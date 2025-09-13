

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

// Connect to database
connectDB().catch((e) => {
    console.error('Failed to connect to database on startup. Exiting.');
    process.exit(1);
});

const activeUsers = new Map();
const mentorSockets = new Set();

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  // Handle user joining chat
  socket.on('join_chat', ({ userName, userId, userType }) => {
    try {
      console.log(`User joining chat:`, { userName, userId, userType, socketId: socket.id });
      
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

      // Notify all mentors about new user
      if (userType === 'user') {
        const userList = Array.from(activeUsers.values()).filter(user => user.userType === 'user');
        mentorSockets.forEach(mentorSocketId => {
          io.to(mentorSocketId).emit('user_joined', {
            users: userList
          });
        });

        // Send welcome message to user
        socket.emit('receive_message', {
          message: 'Welcome! A mentor will assist you shortly. Please describe how we can help you.',
          sender: 'System',
          timestamp: new Date().toISOString(),
          messageType: 'system'
        });
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
  socket.on('send_message', async ({ message, recipientId, timestamp }) => {
    try {
      console.log('Received send_message:', { message, recipientId, timestamp, socketId: socket.id });
      
      const sender = activeUsers.get(socket.id);
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

      // Save message to database (if MongoDB is connected)
  
      try {
        const ChatMessage = require('./Models/ChatMessage');
        const newMessage = new ChatMessage({
          content: message.trim(),
          sender: sender.userId,
          senderName: sender.userName,
          senderType: sender.userType,
          recipientId: recipientId || 'mentor',
          timestamp: new Date()
        });
        await newMessage.save();
        console.log('Message saved to database');
      } catch (dbError) {
        console.error('Database save error:', dbError);
        // Continue without failing the message send
      }
    

      // Send to mentors or specific recipient
      let messageDelivered = false;

      if (recipientId && recipientId !== 'mentor') {
        // Send to specific user
        const recipientSocket = Array.from(activeUsers.entries())
          .find(([socketId, user]) => user.userId === recipientId);
        
        if (recipientSocket) {
          io.to(recipientSocket[0]).emit('receive_message', messageData);
          messageDelivered = true;
          console.log(`Message sent to specific user: ${recipientId}`);
        }
      } else {
        // Send to all mentors
        if (mentorSockets.size > 0) {
          mentorSockets.forEach(mentorSocketId => {
            io.to(mentorSocketId).emit('receive_message', messageData);
            messageDelivered = true;
          });
          console.log(`Message sent to ${mentorSockets.size} mentors`);
        }
      }

      if (!messageDelivered) {
        console.log('No mentors available to receive message');
        socket.emit('receive_message', {
          message: 'No mentors are currently available. Your message has been queued and a mentor will respond shortly.',
          sender: 'System',
          timestamp: new Date().toISOString(),
          messageType: 'system'
        });
      }

      // Confirm message sent
      socket.emit('message_sent', { 
        success: true, 
        messageId: Date.now(),
        delivered: messageDelivered
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