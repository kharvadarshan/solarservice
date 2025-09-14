

const express = require('express');
const cors = require('cors');
const bodyParser  = require('body-parser')
const dotenv = require('dotenv');
const { connectDB } = require('./config/db');
const bookingRoutes = require('./routes/BookingRoutes');
const authRoutes = require('./routes/AuthRoutes');
const adminRoutes = require('./routes/AdminRoutes');
const chatRoutes = require('./routes/ChatRoutes');
const productRoutes = require("./routes/ProductRoutes");
const cookieParser = require('cookie-parser');
const http=require('http');
const socketIo = require('socket.io');
const app = express();

dotenv.config();




const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: ["http://localhost:3000","http://localhost:5173","http://localhost:5174"], // Your React app URL
    methods: ["GET", "POST"],
    credentials: true
  },
  allowEIO3: true,
  transports: ['websocket', 'polling']
});

app.use(cors({
  origin: [ "http://localhost:3000","http://localhost:5174","http://localhost:5173"],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());



app.get('/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

// Database health check
app.get('/health/db', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const ChatMessage = require('./Models/ChatMessage');
    
    // Test database connection
    const connectionState = mongoose.connection.readyState;
    const connectionStates = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    // Test a simple query
    const messageCount = await ChatMessage.countDocuments();
    
    res.json({
      status: 'Database is healthy',
      connectionState: connectionStates[connectionState],
      messageCount: messageCount,
      timestamp: new Date()
    });
  } catch (error) {
    res.status(500).json({
      status: 'Database error',
      error: error.message,
      timestamp: new Date()
    });
  }
});

// Connect to database
connectDB().then((connection) => {
    console.log('Database connected successfully');
    console.log('Database name:', connection.name);
    console.log('Database host:', connection.host);
    console.log('Database port:', connection.port);
}).catch((e) => {
    console.error('Failed to connect to database on startup. Exiting.');
    console.error('Error details:', e);
    process.exit(1);
});

const activeUsers = new Map();
const mentorSockets = new Set();

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user joining chat
  socket.on('join_chat', async ({ userName, userId, userType }) => {
    try {
      console.log(`User joining chat:`, { userName, userId, userType, socketId: socket.id });
      console.log('userId type:', typeof userId, 'userId value:', userId);
      
      const userData = {
        socketId: socket.id,
        userName,
        userId,
        userType,
        joinedAt: new Date()
      };

      activeUsers.set(socket.id, userData);
      
      if (userType === 'mentor') {
        mentorSockets.add(socket.id);
        console.log('Mentor joined. Active mentors:', mentorSockets.size);
      }

      // Load chat history for the user
      if (userType === 'user') {
        try {
          const ChatMessage = require('./Models/ChatMessage');
          const ChatSession = require('./Models/ChatSession');
          const mongoose = require('mongoose');
          
          // Convert userId to ObjectId if it's a string (mongoose v8 compatible)
          let userObjectId;
          try {
            console.log('Chat history userId:', userId, 'Type:', typeof userId);
            if (mongoose.Types.ObjectId.isValid(userId)) {
              // For mongoose v8, we can use the string directly
              userObjectId = typeof userId === 'string' ? userId : userId;
            } else {
              console.error('Invalid userId format in chat history:', userId);
              throw new Error('Invalid user ID format');
            }
          } catch (error) {
            console.error('Error converting userId to ObjectId in chat history:', error);
            throw new Error('Invalid user ID format');
          }
          
          // Find or create chat session
          let chatSession = await ChatSession.findOne({ 
            userId: userObjectId, 
            status: { $in: ['active', 'waiting'] } 
          });
          
          if (!chatSession) {
            chatSession = new ChatSession({
              userId: userObjectId,
              status: 'waiting',
              isUserOnline: true
            });
            await chatSession.save();
          } else {
            // Update online status
            chatSession.isUserOnline = true;
            chatSession.lastActivity = new Date();
            await chatSession.save();
          }

          // Load recent messages (last 50)
          const messages = await ChatMessage.find({
            $or: [
              { sender: userObjectId },
              { recipientId: userId },
              { recipientId: 'mentor' }
            ]
          })
          .sort({ timestamp: -1 })
          .limit(50)
          .populate('sender', 'name email');

          // Send chat history to user
          socket.emit('chat_history_loaded', {
            success: true,
            messages: messages.reverse(), // Reverse to show oldest first
            sessionId: chatSession._id
          });

          // Mark unread messages as read
          await ChatMessage.updateMany(
            { 
              recipientId: userId, 
              isRead: false 
            },
            { 
              isRead: true, 
              readAt: new Date(),
              status: 'read'
            }
          );

        } catch (dbError) {
          console.error('Error loading chat history:', dbError);
          socket.emit('chat_history_loaded', {
            success: false,
            error: 'Failed to load chat history'
          });
        }

        // Notify all mentors about new user
        const userList = Array.from(activeUsers.values()).filter(user => user.userType === 'user');
        mentorSockets.forEach(mentorSocketId => {
          io.to(mentorSocketId).emit('user_joined', {
            users: userList
          });
        });

        // Send welcome message only if no previous messages
        if (messages && messages.length === 0) {
          socket.emit('receive_message', {
            message: 'Welcome! A mentor will assist you shortly. Please describe how we can help you.',
            sender: 'System',
            timestamp: new Date().toISOString(),
            messageType: 'system'
          });
        }
      }

      // Confirm join to the user
      socket.emit('join_confirmed', {
        success: true,
        userData,
        activeUsers: Array.from(activeUsers.values())
      });

      console.log(`${userType} ${userName} joined the chat successfully`);
    } catch (error) {
      console.error('Error in join_chat:', error);
      socket.emit('join_error', { error: error.message });
    }
  });

  

  // Handle sending messages from users
  socket.on('send_message', async ({ message, recipientId, timestamp, sessionId }) => {
    try {
      console.log('Received send_message:', { message, recipientId, timestamp, sessionId, socketId: socket.id });
      
      const sender = activeUsers.get(socket.id);
      console.log('Sender from activeUsers:', sender);
      console.log('Active users map:', Array.from(activeUsers.entries()));
      
      if (!sender) {
        console.error('Sender not found for socket:', socket.id);
        socket.emit('message_sent', { 
          success: false, 
          error: 'User not found. Please refresh the page.' 
        });
        return;
      }

      if (!message || !message.trim()) {
        socket.emit('message_sent', { 
          success: false, 
          error: 'Message cannot be empty' 
        });
        return;
      }

      const messageData = {
        message: message.trim(),
        sender: sender.userName,
        senderId: sender.userId,
        senderSocketId: socket.id,
        timestamp: timestamp || new Date().toISOString(),
        messageType: sender.userType
      };

      console.log('Prepared message data:', messageData);

      // Save message to database
      let savedMessage = null;
      try {
        const ChatMessage = require('./Models/ChatMessage');
        const ChatSession = require('./Models/ChatSession');
        const mongoose = require('mongoose');
        
        // Convert userId to ObjectId if it's a string (mongoose v8 compatible)
        let senderObjectId;
        try {
          console.log('Sender userId:', sender.userId, 'Type:', typeof sender.userId);
          if (mongoose.Types.ObjectId.isValid(sender.userId)) {
            // For mongoose v8, we can use the string directly or create ObjectId
            senderObjectId = typeof sender.userId === 'string' ? sender.userId : sender.userId;
          } else {
            console.error('Invalid userId format:', sender.userId);
            throw new Error('Invalid user ID format');
          }
        } catch (error) {
          console.error('Error converting userId to ObjectId:', error);
          throw new Error('Invalid user ID format');
        }
        
        // Create new message
        console.log('Creating message with data:', {
          content: message.trim(),
          sender: senderObjectId,
          senderName: sender.userName,
          senderType: sender.userType,
          recipientId: recipientId || 'mentor',
          recipientName: recipientId === 'mentor' ? 'Mentor' : 'User',
          timestamp: new Date(),
          status: 'sent',
          chatSessionId: sessionId
        });
        
        savedMessage = new ChatMessage({
          content: message.trim(),
          sender: senderObjectId,
          senderName: sender.userName,
          senderType: sender.userType,
          recipientId: recipientId || 'mentor',
          recipientName: recipientId === 'mentor' ? 'Mentor' : 'User',
          timestamp: new Date(),
          status: 'sent',
          chatSessionId: sessionId
        });
        
        console.log('Attempting to save message to database...');
        await savedMessage.save();
        console.log('Message saved to database with ID:', savedMessage._id);

        // Update chat session
        if (sessionId) {
          await ChatSession.findByIdAndUpdate(sessionId, {
            lastMessage: message.trim(),
            lastMessageTime: new Date(),
            lastActivity: new Date(),
            $inc: { messageCount: 1 }
          });
        }

      } catch (dbError) {
        console.error('Database save error:', dbError);
        console.error('Error details:', {
          message: dbError.message,
          name: dbError.name,
          code: dbError.code,
          stack: dbError.stack
        });
        socket.emit('message_sent', { 
          success: false, 
          error: `Failed to save message: ${dbError.message}` 
        });
        return;
      }

      // Send to mentors or specific recipient
      let messageDelivered = false;
      let recipientOnline = false;

      if (recipientId && recipientId !== 'mentor') {
        // Send to specific user
        const recipientSocket = Array.from(activeUsers.entries())
          .find(([socketId, user]) => user.userId === recipientId);
        
        if (recipientSocket) {
          io.to(recipientSocket[0]).emit('receive_message', {
            ...messageData,
            messageId: savedMessage._id,
            status: 'delivered'
          });
          messageDelivered = true;
          recipientOnline = true;
          console.log(`Message sent to specific user: ${recipientId}`);
        }
      } else {
        // Send to all mentors
        if (mentorSockets.size > 0) {
          mentorSockets.forEach(mentorSocketId => {
            io.to(mentorSocketId).emit('receive_message', {
              ...messageData,
              messageId: savedMessage._id,
              status: 'delivered'
            });
            messageDelivered = true;
            recipientOnline = true;
          });
          console.log(`Message sent to ${mentorSockets.size} mentors`);
        }
      }

      // Update message status based on delivery
      if (savedMessage) {
        try {
          const ChatMessage = require('./Models/ChatMessage');
          await ChatMessage.findByIdAndUpdate(savedMessage._id, {
            status: messageDelivered ? 'delivered' : 'sent'
          });
        } catch (updateError) {
          console.error('Error updating message status:', updateError);
        }
      }

      if (!messageDelivered) {
        console.log('No mentors available to receive message - message queued');
        // Don't send system message, just queue the message
      }

      // Confirm message sent
      socket.emit('message_sent', { 
        success: true, 
        messageId: savedMessage._id,
        delivered: messageDelivered,
        recipientOnline: recipientOnline
      });

    } catch (error) {
      console.error('Error in send_message:', error);
      socket.emit('message_sent', { 
        success: false, 
        error: 'Failed to send message. Please try again.' 
      });
    }
  });

  // Handle mentor replies
  socket.on('mentor_reply', async ({ message, recipientUserId, timestamp }) => {
    try {
      console.log('Received mentor_reply:', { message, recipientUserId, timestamp });
      
      const mentor = activeUsers.get(socket.id);
      if (!mentor || mentor.userType !== 'mentor') {
        socket.emit('message_sent', { 
          success: false, 
          error: 'Only mentors can send replies' 
        });
        return;
      }

      if (!message || !message.trim()) {
        socket.emit('message_sent', { 
          success: false, 
          error: 'Message cannot be empty' 
        });
        return;
      }

      const messageData = {
        message: message.trim(),
        sender: mentor.userName,
        senderId: mentor.userId,
        timestamp: timestamp || new Date().toISOString(),
        messageType: 'mentor'
      };

      // Save message to database (if MongoDB is connected)
    
      try {
        const ChatMessage = require('./Models/ChatMessage');
        const newMessage = new ChatMessage({
          content: message.trim(),
          sender: mentor.userId,
          senderName: mentor.userName,
          senderType: 'mentor',
          recipientId: recipientUserId,
          timestamp: new Date()
        });
        await newMessage.save();
        console.log('Mentor reply saved to database');
      } catch (dbError) {
        console.error('Database save error:', dbError);
      }
  

      // Send to specific user
      const userSocket = Array.from(activeUsers.entries())
        .find(([socketId, user]) => user.userId === recipientUserId);
      
      let messageDelivered = false;
      if (userSocket) {
        io.to(userSocket[0]).emit('receive_message', messageData);
        messageDelivered = true;
        console.log(`Mentor reply sent to user: ${recipientUserId}`);
      }

      // Confirm message sent to mentor
      socket.emit('message_sent', { 
        success: true, 
        messageId: Date.now(),
        delivered: messageDelivered
      });

    } catch (error) {
      console.error('Error in mentor_reply:', error);
      socket.emit('message_sent', { 
        success: false, 
        error: 'Failed to send reply. Please try again.' 
      });
    }
  });

  // Handle getting chat history
  socket.on('get_chat_history', async ({ userId }) => {
    try {
      // If using MongoDB, uncomment this:
    
      const ChatMessage = require('./Models/ChatMessage');
      const messages = await ChatMessage.find({
        $or: [
          { sender: userId },
          { recipientId: userId }
        ]
      }).sort({ timestamp: 1 }).limit(50);

      socket.emit('chat_history', messages);
    
      
      // For now, send empty history
      socket.emit('chat_history', []);
    } catch (error) {
      console.error('Error fetching chat history:', error);
      socket.emit('chat_history', []);
    }
  });

  // Handle disconnect
  socket.on('disconnect', (reason) => {
    console.log(`Socket ${socket.id} disconnected:`, reason);
    
    const user = activeUsers.get(socket.id);
    if (user) {
      activeUsers.delete(socket.id);
      mentorSockets.delete(socket.id);

      // Notify mentors about user leaving
      if (user.userType === 'user') {
        const userList = Array.from(activeUsers.values()).filter(user => user.userType === 'user');
        mentorSockets.forEach(mentorSocketId => {
          io.to(mentorSocketId).emit('user_left', {
            userId: user.userId,
            userName: user.userName,
            users: userList
          });
        });
      }

      console.log(`${user.userType} ${user.userName} disconnected`);
    }
  });

  // Handle connection errors
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

// Error handling for the server
server.on('error', (error) => {
  console.error('Server error:', error);
});

io.on('error', (error) => {
  console.error('Socket.IO error:', error);
});

// Routes
app.use('/api/bookings', bookingRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use("/api/products", productRoutes);



const PORT = process.env.PORT || 5000;

server.listen(PORT,()=>{
    console.log(`Server is running on Port ${PORT}`);
});


module.exports = { app, io };