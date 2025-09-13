import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import { useSelector } from 'react-redux';
import { getToken } from '../../slice/AuthSlice';



const MentorDashboard = () => {
  const user = useSelector(state => state.auth.user);
  const token = useSelector(state=>state.auth.token)
  const [socket, setSocket] = useState(null);
  const [activeUsers, setActiveUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [conversations, setConversations] = useState({});
  const [inputMessage, setInputMessage] = useState('');
  const [unreadMessages, setUnreadMessages] = useState(new Set());
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversations, selectedUser]);

  useEffect(() => {
    const newSocket = io('http://localhost:5000', {
      auth: {
        token:token 
      }
    });

    newSocket.on('connect', () => {
      newSocket.emit('join_chat', {
        userName: user.name,
        userId: user.id,
        userType: 'mentor'
      });
    });

    newSocket.on('user_joined', ({ users }) => {
      setActiveUsers(users);
    });

    newSocket.on('user_left', ({ userId, userName, users }) => {
      setActiveUsers(users);
      if (selectedUser?.userId === userId) {
        setSelectedUser(null);
      }
    });

    newSocket.on('receive_message', (messageData) => {
      const senderId = messageData.senderId;
      
      setConversations(prev => ({
        ...prev,
        [senderId]: [
          ...(prev[senderId] || []),
          {
            id: Date.now(),
            content: messageData.message,
            sender: messageData.sender,
            timestamp: new Date(messageData.timestamp),
            type: messageData.messageType
          }
        ]
      }));

      if (!selectedUser || selectedUser.userId !== senderId) {
        setUnreadMessages(prev => new Set([...prev, senderId]));
      }
    });

    newSocket.on('message_sent', (response) => {
      if (!response.success) {
        console.error('Failed to send message:', response.error);
      }
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user, selectedUser]);

  const selectUser = (userData) => {
    setSelectedUser(userData);
    setUnreadMessages(prev => {
      const newSet = new Set(prev);
      newSet.delete(userData.userId);
      return newSet;
    });
  };

  const sendReply = () => {
    if (inputMessage.trim() && socket && selectedUser) {
      const messageData = {
        message: inputMessage.trim(),
        recipientUserId: selectedUser.userId
      };

      setConversations(prev => ({
        ...prev,
        [selectedUser.userId]: [
          ...(prev[selectedUser.userId] || []),
          {
            id: Date.now(),
            content: inputMessage.trim(),
            sender: user.name,
            timestamp: new Date(),
            type: 'mentor'
          }
        ]
      }));

      socket.emit('mentor_reply', messageData);
      setInputMessage('');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendReply();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Mentor Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {user?.name}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-green-100 px-3 py-1.5 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-green-700">Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Users Sidebar */}
        <div className="w-80 bg-white shadow-lg border-r border-gray-200 flex flex-col">
          <div className="p-6 border-b border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">Active Users</h3>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-600">{activeUsers.length}</span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {activeUsers.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-center px-6">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h2V4a2 2 0 012-2h4a2 2 0 012 2v4z"
                    />
                  </svg>
                </div>
                <h4 className="text-lg font-medium text-gray-700 mb-2">No Active Users</h4>
                <p className="text-sm text-gray-500">Waiting for students to join...</p>
              </div>
            ) : (
              <div className="p-4 space-y-2">
                {activeUsers.map((userData) => (
                  <div
                    key={userData.userId}
                    onClick={() => selectUser(userData)}
                    className={`relative p-4 rounded-xl cursor-pointer transition-all duration-200 border ${
                      selectedUser?.userId === userData.userId
                        ? 'bg-blue-50 border-blue-200 shadow-md scale-[1.02]'
                        : 'bg-gray-50 border-gray-100 hover:bg-gray-100 hover:border-gray-200 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center shadow-sm">
                          <span className="text-white font-semibold text-lg">
                            {userData.userName.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 truncate">{userData.userName}</h4>
                        <p className="text-sm text-gray-500">
                          Joined {formatTime(userData.joinedAt)}
                        </p>
                      </div>

                      {unreadMessages.has(userData.userId) && (
                        <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse shadow-sm"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className="flex-1 flex flex-col bg-white">
          {selectedUser ? (
            <>
              {/* Chat Header */}
              <div className="p-6 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center space-x-4">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-semibold">
                        {selectedUser.userName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-800">{selectedUser.userName}</h4>
                    <p className="text-sm text-gray-500">Active now</p>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
                {(conversations[selectedUser.userId] || []).length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                          />
                        </svg>
                      </div>
                      <p className="text-gray-500 font-medium">Start your conversation with {selectedUser.userName}</p>
                    </div>
                  </div>
                ) : (
                  conversations[selectedUser.userId].map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${
                        message.type === 'mentor' ? 'justify-end' : 'justify-start'
                      } mb-4`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-sm ${
                          message.type === 'mentor'
                            ? 'bg-blue-600 text-white rounded-br-md'
                            : message.type === 'system'
                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                            : 'bg-white text-gray-800 border border-gray-200 rounded-bl-md'
                        }`}
                      >
                        <div className="text-sm leading-relaxed whitespace-pre-wrap">
                          {message.content}
                        </div>
                        <div
                          className={`text-xs mt-2 ${
                            message.type === 'mentor'
                              ? 'text-blue-100'
                              : message.type === 'system'
                              ? 'text-yellow-600'
                              : 'text-gray-500'
                          }`}
                        >
                          {message.sender} • {formatTime(message.timestamp)}
                        </div>
                      </div>
                    </div>
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-6 border-t border-gray-100 bg-white">
                <div className="flex items-end space-x-3">
                  <div className="flex-1 relative">
                    <textarea
                      value={inputMessage}
                      onChange={(e) => setInputMessage(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder={`Message ${selectedUser.userName}...`}
                      rows="1"
                      maxLength="1000"
                      className="w-full resize-none rounded-2xl border border-gray-200 px-4 py-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 text-sm transition-all duration-200"
                      style={{ minHeight: '44px', maxHeight: '120px' }}
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-gray-400">
                      {inputMessage.length}/1000
                    </div>
                  </div>
                  
                  <button
                    onClick={sendReply}
                    disabled={!inputMessage.trim()}
                    className={`p-3 rounded-full transition-all duration-200 shadow-lg ${
                      inputMessage.trim()
                        ? 'bg-blue-600 hover:bg-blue-700 text-white hover:shadow-xl transform hover:scale-105'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    }`}
                    aria-label="Send message"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center bg-gray-50">
              <div className="text-center">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <svg className="w-12 h-12 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h2V4a2 2 0 012-2h4a2 2 0 012 2v4z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-700 mb-2">Ready to Help Students</h3>
                <p className="text-gray-500 max-w-sm">
                  Select a student from the sidebar to start or continue a conversation
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorDashboard;

// import React, { useState, useEffect, useRef } from 'react';
// import io from 'socket.io-client';
// import '../../App.css';
// import { useSelector } from 'react-redux';

// const MentorDashboard = () => {


//   const user = useSelector(state=>state.auth.user);
//   const [socket, setSocket] = useState(null);
//   const [activeUsers, setActiveUsers] = useState([]);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [conversations, setConversations] = useState({});
//   const [inputMessage, setInputMessage] = useState('');
//   const [unreadMessages, setUnreadMessages] = useState(new Set());
//   const messagesEndRef = useRef(null);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [conversations, selectedUser]);

//   useEffect(() => {
//     const newSocket = io('http://localhost:5000', {
//       auth: {
//         token: localStorage.getItem('auth_token')
//       }
//     });

//     newSocket.on('connect', () => {
//       newSocket.emit('join_chat', {
//         userName: user.name,
//         userId: user.id,
//         userType: 'mentor'
//       });
//     });

//     newSocket.on('user_joined', ({ users }) => {
//       setActiveUsers(users);
//     });

//     newSocket.on('user_left', ({ userId, userName, users }) => {
//       setActiveUsers(users);
//       if (selectedUser?.userId === userId) {
//         setSelectedUser(null);
//       }
//     });

//     newSocket.on('receive_message', (messageData) => {
//       const senderId = messageData.senderId;
      
//       setConversations(prev => ({
//         ...prev,
//         [senderId]: [
//           ...(prev[senderId] || []),
//           {
//             id: Date.now(),
//             content: messageData.message,
//             sender: messageData.sender,
//             timestamp: new Date(messageData.timestamp),
//             type: messageData.messageType
//           }
//         ]
//       }));

//       // Mark as unread if not currently selected
//       if (!selectedUser || selectedUser.userId !== senderId) {
//         setUnreadMessages(prev => new Set([...prev, senderId]));
//       }
//     });

//     newSocket.on('message_sent', (response) => {
//       if (!response.success) {
//         console.error('Failed to send message:', response.error);
//       }
//     });

//     setSocket(newSocket);

//     return () => {
//       newSocket.disconnect();
//     };
//   }, [user, selectedUser]);

//   const selectUser = (userData) => {
//     setSelectedUser(userData);
//     setUnreadMessages(prev => {
//       const newSet = new Set(prev);
//       newSet.delete(userData.userId);
//       return newSet;
//     });
//   };

//   const sendReply = () => {
//     if (inputMessage.trim() && socket && selectedUser) {
//       const messageData = {
//         message: inputMessage.trim(),
//         recipientUserId: selectedUser.userId
//       };

//       // Add message to UI immediately
//       setConversations(prev => ({
//         ...prev,
//         [selectedUser.userId]: [
//           ...(prev[selectedUser.userId] || []),
//           {
//             id: Date.now(),
//             content: inputMessage.trim(),
//             sender: user.name,
//             timestamp: new Date(),
//             type: 'mentor'
//           }
//         ]
//       }));

//       socket.emit('mentor_reply', messageData);
//       setInputMessage('');
//     }
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       sendReply();
//     }
//   };

//   return (
//     <div className="mentor-dashboard">
//       <div className="dashboard-header">
//         <h2>👨‍🏫 Mentor Dashboard</h2>
//         <div className="mentor-info">
//           Welcome, {user.name}
//         </div>
//       </div>

//       <div className="dashboard-content">
//         <div className="users-sidebar">
//           <div className="sidebar-header">
//             <h3>Active Users ({activeUsers.length})</h3>
//           </div>
//           <div className="users-list">
//             {activeUsers.length === 0 ? (
//               <div className="no-users">No active users</div>
//             ) : (
//               activeUsers.map((userData) => (
//                 <div
//                   key={userData.userId}
//                   className={`user-item ${selectedUser?.userId === userData.userId ? 'selected' : ''}`}
//                   onClick={() => selectUser(userData)}
//                 >
//                   <div className="user-info">
//                     <div className="user-name">{userData.userName}</div>
//                     <div className="user-meta">
//                       Joined: {new Date(userData.joinedAt).toLocaleTimeString()}
//                     </div>
//                   </div>
//                   {unreadMessages.has(userData.userId) && (
//                     <div className="unread-indicator"></div>
//                   )}
//                 </div>
//               ))
//             )}
//           </div>
//         </div>

//         <div className="chat-area">
//           {selectedUser ? (
//             <>
//               <div className="chat-header">
//                 <h4>Conversation with {selectedUser.userName}</h4>
//               </div>
//               <div className="messages-container">
//                 {(conversations[selectedUser.userId] || []).map((message) => (
//                   <div
//                     key={message.id}
//                     className={`message ${message.type === 'user' ? 'user-message' : message.type === 'system' ? 'system-message' : 'mentor-message'}`}
//                   >
//                     <div className="message-content">
//                       {message.content}
//                     </div>
//                     <div className="message-meta">
//                       {message.sender} • {message.timestamp.toLocaleTimeString()}
//                     </div>
//                   </div>
//                 ))}
//                 <div ref={messagesEndRef} />
//               </div>
//               <div className="message-input-container">
//                 <textarea
//                   value={inputMessage}
//                   onChange={(e) => setInputMessage(e.target.value)}
//                   onKeyPress={handleKeyPress}
//                   placeholder={`Reply to ${selectedUser.userName}...`}
//                   rows="2"
//                   maxLength="1000"
//                 />
//                 <button
//                   onClick={sendReply}
//                   disabled={!inputMessage.trim()}
//                   className="send-button"
//                 >
//                   Reply
//                 </button>
//               </div>
//             </>
//           ) : (
//             <div className="no-conversation">
//               <div className="placeholder-message">
//                 Select a user to start conversation
//               </div>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// };

// export default MentorDashboard;