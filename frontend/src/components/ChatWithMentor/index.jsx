import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';

const ChatWithMentor = ({ user, onClose }) => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [connectionError, setConnectionError] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Auto-resize textarea based on content
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [inputMessage]);

  useEffect(() => {
    console.log('Initializing socket connection...');
    
    const newSocket = io('http://localhost:5000', {
      auth: {
        token: localStorage.getItem('auth_token')
      },
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true
    });

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('Socket connected successfully:', newSocket.id);
      setIsConnected(true);
      setConnectionError(null);
      
      // Join chat room
      newSocket.emit('join_chat', {
        userName: user.name,
        userId: user.userId,
        userType: 'user'
      });
      
      console.log('Emitted join_chat with data:', {
        userName: user.name,
        userId: user.userId,
        userType: 'user'
      });
    });

    newSocket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      setConnectionError(`Connection failed: ${error.message}`);
      setIsConnected(false);
    });

    newSocket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setIsConnected(false);
      if (reason === 'io server disconnect') {
        newSocket.connect();
      }
    });

    // Message event handlers
    newSocket.on('receive_message', (messageData) => {
      console.log('Received message:', messageData);
      setMessages(prev => [...prev, {
        id: Date.now() + Math.random(),
        content: messageData.message,
        sender: messageData.sender,
        timestamp: new Date(messageData.timestamp),
        type: messageData.messageType
      }]);
    });

    newSocket.on('message_sent', (response) => {
      console.log('Message sent response:', response);
      if (!response.success) {
        console.error('Failed to send message:', response.error);
        setMessages(prev => [...prev, {
          id: Date.now() + Math.random(),
          content: `Error: ${response.error}`,
          sender: 'System',
          timestamp: new Date(),
          type: 'system'
        }]);
      }
    });

    // Additional debugging events
    newSocket.on('user_joined', (data) => {
      console.log('User joined event:', data);
    });

    newSocket.on('error', (error) => {
      console.error('Socket error:', error);
      setConnectionError(`Socket error: ${error}`);
    });

    setSocket(newSocket);

    // Cleanup on unmount
    return () => {
      console.log('Cleaning up socket connection');
      newSocket.disconnect();
    };
  }, [user]);

  const sendMessage = () => {
    if (!inputMessage.trim()) {
      console.log('Cannot send empty message');
      return;
    }

    if (!socket) {
      console.error('Socket not available');
      setMessages(prev => [...prev, {
        id: Date.now(),
        content: 'Error: Not connected to server',
        sender: 'System',
        timestamp: new Date(),
        type: 'system'
      }]);
      return;
    }

    if (!isConnected) {
      console.error('Socket not connected');
      setMessages(prev => [...prev, {
        id: Date.now(),
        content: 'Error: Connection lost. Please try again.',
        sender: 'System',
        timestamp: new Date(),
        type: 'system'
      }]);
      return;
    }

    const messageData = {
      message: inputMessage.trim(),
      recipientId: 'mentor',
      timestamp: new Date().toISOString()
    };

    console.log('Sending message:', messageData);

    // Add message to UI immediately (optimistic update)
    const optimisticMessage = {
      id: Date.now(),
      content: inputMessage.trim(),
      sender: user.name,
      timestamp: new Date(),
      type: 'user'
    };

    setMessages(prev => [...prev, optimisticMessage]);
    
    // Send message to server
    socket.emit('send_message', messageData);
    setInputMessage('');
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const reconnect = () => {
    if (socket) {
      socket.connect();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        {/* Popup Container - stops click propagation to prevent closing when clicking inside */}
        <div 
          className="flex flex-col h-full max-h-[600px] w-full max-w-md bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-indigo-600 text-white">
            <div className="flex items-center">
              <div className="flex flex-col">
                <h3 className="font-semibold text-lg">Chat with Mentor</h3>
                <div className="flex items-center mt-1">
                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></span>
                  <span className="text-xs">{isConnected ? 'Connected' : 'Disconnected'}</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {!isConnected && (
                <button 
                  onClick={reconnect} 
                  className="flex items-center text-xs bg-indigo-700 hover:bg-indigo-800 px-2 py-1 rounded transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Reconnect
                </button>
              )}
              <button 
                onClick={onClose} 
                className="p-1 rounded-full hover:bg-indigo-700 transition-colors"
                aria-label="Close chat"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {connectionError && (
            <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 text-sm">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {connectionError}
              </div>
            </div>
          )}

          {/* Messages Container */}
          <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-500">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                </svg>
                <p className="text-center">Welcome! Start a conversation with a mentor.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-xs lg:max-w-md rounded-lg p-3 ${message.type === 'user' 
                      ? 'bg-indigo-500 text-white rounded-br-none' 
                      : message.type === 'system' 
                        ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
                        : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'}`}
                    >
                      <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                      <div className={`text-xs mt-1 ${message.type === 'user' ? 'text-indigo-200' : 'text-gray-500'}`}>
                        {message.sender} • {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Input Area */}
          <div className="border-t border-gray-200 p-3 bg-white">
            <div className="flex items-end space-x-2">
              <div className="flex-1 bg-gray-100 rounded-lg border border-gray-200 focus-within:ring-2 focus-within:ring-indigo-400 focus-within:border-transparent">
                <textarea
                  ref={textareaRef}
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={isConnected ? "Type your message..." : "Connecting..."}
                  rows="1"
                  maxLength="1000"
                  disabled={!isConnected}
                  className="block w-full px-3 py-2 bg-transparent border-0 resize-none focus:outline-none text-gray-800 placeholder-gray-500"
                />
              </div>
              <button
                onClick={sendMessage}
                disabled={!inputMessage.trim() || !isConnected}
                className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Send message"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            <div className="text-xs text-gray-500 mt-1 text-right">
              {inputMessage.length}/1000
            </div>
          </div>

          {/* Debug info (remove in production) */}
          {import.meta.env.NODE_ENV === 'development' && (
            <div className="bg-gray-800 text-white p-2 text-xs">
              <div>Socket ID: {socket?.id || 'Not connected'}</div>
              <div>Connected: {isConnected ? 'Yes' : 'No'}</div>
              <div>Messages: {messages.length}</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ChatWithMentor;

// import React, { useState, useEffect, useRef } from 'react';
// import io from 'socket.io-client';

// const ChatWithMentor = ({ user, onClose }) => {
//   const [socket, setSocket] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [inputMessage, setInputMessage] = useState('');
//   const [isConnected, setIsConnected] = useState(false);
//   const [isTyping, setIsTyping] = useState(false);
//   const [connectionError, setConnectionError] = useState(null);
//   const messagesEndRef = useRef(null);
//   const textareaRef = useRef(null);

//   const scrollToBottom = () => {
//     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
//   };

//   useEffect(() => {
//     scrollToBottom();
//   }, [messages]);

//   // Auto-resize textarea based on content
//   useEffect(() => {
//     if (textareaRef.current) {
//       textareaRef.current.style.height = 'auto';
//       textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
//     }
//   }, [inputMessage]);

//   useEffect(() => {
//     console.log('Initializing socket connection...');
    
//     const newSocket = io('http://localhost:5000', {
//       auth: {
//         token: localStorage.getItem('auth_token')
//       },
//       transports: ['websocket', 'polling'],
//       timeout: 20000,
//       forceNew: true
//     });

//     // Connection event handlers
//     newSocket.on('connect', () => {
//       console.log('Socket connected successfully:', newSocket.id);
//       setIsConnected(true);
//       setConnectionError(null);
      
//       // Join chat room
//       newSocket.emit('join_chat', {
//         userName: user.name,
//         userId: user.userId,
//         userType: 'user'
//       });
      
//       console.log('Emitted join_chat with data:', {
//         userName: user.name,
//         userId: user.userId,
//         userType: 'user'
//       });
//     });

//     newSocket.on('connect_error', (error) => {
//       console.error('Connection error:', error);
//       setConnectionError(`Connection failed: ${error.message}`);
//       setIsConnected(false);
//     });

//     newSocket.on('disconnect', (reason) => {
//       console.log('Socket disconnected:', reason);
//       setIsConnected(false);
//       if (reason === 'io server disconnect') {
//         newSocket.connect();
//       }
//     });

//     // Message event handlers
//     newSocket.on('receive_message', (messageData) => {
//       console.log('Received message:', messageData);
//       setMessages(prev => [...prev, {
//         id: Date.now() + Math.random(),
//         content: messageData.message,
//         sender: messageData.sender,
//         timestamp: new Date(messageData.timestamp),
//         type: messageData.messageType
//       }]);
//     });

//     newSocket.on('message_sent', (response) => {
//       console.log('Message sent response:', response);
//       if (!response.success) {
//         console.error('Failed to send message:', response.error);
//         setMessages(prev => [...prev, {
//           id: Date.now() + Math.random(),
//           content: `Error: ${response.error}`,
//           sender: 'System',
//           timestamp: new Date(),
//           type: 'system'
//         }]);
//       }
//     });

//     // Additional debugging events
//     newSocket.on('user_joined', (data) => {
//       console.log('User joined event:', data);
//     });

//     newSocket.on('error', (error) => {
//       console.error('Socket error:', error);
//       setConnectionError(`Socket error: ${error}`);
//     });

//     setSocket(newSocket);

//     // Cleanup on unmount
//     return () => {
//       console.log('Cleaning up socket connection');
//       newSocket.disconnect();
//     };
//   }, [user]);

//   const sendMessage = () => {
//     if (!inputMessage.trim()) {
//       console.log('Cannot send empty message');
//       return;
//     }

//     if (!socket) {
//       console.error('Socket not available');
//       setMessages(prev => [...prev, {
//         id: Date.now(),
//         content: 'Error: Not connected to server',
//         sender: 'System',
//         timestamp: new Date(),
//         type: 'system'
//       }]);
//       return;
//     }

//     if (!isConnected) {
//       console.error('Socket not connected');
//       setMessages(prev => [...prev, {
//         id: Date.now(),
//         content: 'Error: Connection lost. Please try again.',
//         sender: 'System',
//         timestamp: new Date(),
//         type: 'system'
//       }]);
//       return;
//     }

//     const messageData = {
//       message: inputMessage.trim(),
//       recipientId: 'mentor',
//       timestamp: new Date().toISOString()
//     };

//     console.log('Sending message:', messageData);

//     // Add message to UI immediately (optimistic update)
//     const optimisticMessage = {
//       id: Date.now(),
//       content: inputMessage.trim(),
//       sender: user.name,
//       timestamp: new Date(),
//       type: 'user'
//     };

//     setMessages(prev => [...prev, optimisticMessage]);
    
//     // Send message to server
//     socket.emit('send_message', messageData);
//     setInputMessage('');
    
//     // Reset textarea height
//     if (textareaRef.current) {
//       textareaRef.current.style.height = 'auto';
//     }
//   };

//   const handleKeyPress = (e) => {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault();
//       sendMessage();
//     }
//   };

//   const reconnect = () => {
//     if (socket) {
//       socket.connect();
//     }
//   };

//   return (
//     <div className="flex flex-col h-full max-w-md mx-auto bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden pt-50">
//       {/* Header */}
//       <div className="flex items-center justify-between p-4 bg-indigo-600 text-white">
//         <div className="flex items-center">
//           <div className="flex flex-col">
//             <h3 className="font-semibold text-lg">Chat with Mentor</h3>
//             <div className="flex items-center mt-1">
//               <span className={`inline-block w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></span>
//               <span className="text-xs">{isConnected ? 'Connected' : 'Disconnected'}</span>
//             </div>
//           </div>
//         </div>
        
//         <div className="flex items-center space-x-2">
//           {!isConnected && (
//             <button 
//               onClick={reconnect} 
//               className="flex items-center text-xs bg-indigo-700 hover:bg-indigo-800 px-2 py-1 rounded transition-colors"
//             >
//               <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
//               </svg>
//               Reconnect
//             </button>
//           )}
//           <button 
//             onClick={onClose} 
//             className="p-1 rounded-full hover:bg-indigo-700 transition-colors"
//             aria-label="Close chat"
//           >
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//             </svg>
//           </button>
//         </div>
//       </div>

//       {connectionError && (
//         <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-3 text-sm">
//           <div className="flex items-center">
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//             </svg>
//             {connectionError}
//           </div>
//         </div>
//       )}

//       {/* Messages Container */}
//       <div className="flex-1 p-4 overflow-y-auto bg-gray-50">
//         {messages.length === 0 ? (
//           <div className="flex flex-col items-center justify-center h-full text-gray-500">
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-3 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
//             </svg>
//             <p className="text-center">Welcome! Start a conversation with a mentor.</p>
//           </div>
//         ) : (
//           <div className="space-y-3">
//             {messages.map((message) => (
//               <div
//                 key={message.id}
//                 className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
//               >
//                 <div className={`max-w-xs lg:max-w-md rounded-lg p-3 ${message.type === 'user' 
//                   ? 'bg-indigo-500 text-white rounded-br-none' 
//                   : message.type === 'system' 
//                     ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' 
//                     : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'}`}
//                 >
//                   <div className="text-sm whitespace-pre-wrap">{message.content}</div>
//                   <div className={`text-xs mt-1 ${message.type === 'user' ? 'text-indigo-200' : 'text-gray-500'}`}>
//                     {message.sender} • {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//                   </div>
//                 </div>
//               </div>
//             ))}
//             <div ref={messagesEndRef} />
//           </div>
//         )}
//       </div>

//       {/* Input Area */}
//       <div className="border-t border-gray-200 p-3 bg-white">
//         <div className="flex items-end space-x-2">
//           <div className="flex-1 bg-gray-100 rounded-lg border border-gray-200 focus-within:ring-2 focus-within:ring-indigo-400 focus-within:border-transparent">
//             <textarea
//               ref={textareaRef}
//               value={inputMessage}
//               onChange={(e) => setInputMessage(e.target.value)}
//               onKeyPress={handleKeyPress}
//               placeholder={isConnected ? "Type your message..." : "Connecting..."}
//               rows="1"
//               maxLength="1000"
//               disabled={!isConnected}
//               className="block w-full px-3 py-2 bg-transparent border-0 resize-none focus:outline-none text-gray-800 placeholder-gray-500"
//             />
//           </div>
//           <button
//             onClick={sendMessage}
//             disabled={!inputMessage.trim() || !isConnected}
//             className="flex items-center justify-center h-10 w-10 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//             aria-label="Send message"
//           >
//             <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
//             </svg>
//           </button>
//         </div>
//         <div className="text-xs text-gray-500 mt-1 text-right">
//           {inputMessage.length}/1000
//         </div>
//       </div>

//       {/* Debug info (remove in production) */}
//       {import.meta.env.NODE_ENV === 'development' && (
//         <div className="bg-gray-800 text-white p-2 text-xs">
//           <div>Socket ID: {socket?.id || 'Not connected'}</div>
//           <div>Connected: {isConnected ? 'Yes' : 'No'}</div>
//           <div>Messages: {messages.length}</div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default ChatWithMentor;

// // import React, { useState, useEffect, useRef } from 'react';
// // import io from 'socket.io-client';
// // import '../../App.css';

// // const ChatWithMentor = ({ user, onClose }) => {
// //   const [socket, setSocket] = useState(null);
// //   const [messages, setMessages] = useState([]);
// //   const [inputMessage, setInputMessage] = useState('');
// //   const [isConnected, setIsConnected] = useState(false);
// //   const [isTyping, setIsTyping] = useState(false);
// //   const [connectionError, setConnectionError] = useState(null);
// //   const messagesEndRef = useRef(null);

// //   const scrollToBottom = () => {
// //     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
// //   };

// //   useEffect(() => {
// //     scrollToBottom();
// //   }, [messages]);

// //   useEffect(() => {
// //     console.log('Initializing socket connection...');
    
// //     const newSocket = io('http://localhost:5000', {
// //       auth: {
// //         token: localStorage.getItem('auth_token')
// //       },
// //       transports: ['websocket', 'polling'], // Allow fallback
// //       timeout: 20000,
// //       forceNew: true
// //     });

// //     // Connection event handlers
// //     newSocket.on('connect', () => {
// //       console.log('Socket connected successfully:', newSocket.id);
// //       setIsConnected(true);
// //       setConnectionError(null);
      
// //       // Join chat room
// //       newSocket.emit('join_chat', {
// //         userName: user.name,
// //         userId: user.userId,
// //         userType: 'user'
// //       });
      
// //       console.log('Emitted join_chat with data:', {
// //         userName: user.name,
// //         userId: user.userId,
// //         userType: 'user'
// //       });
// //     });

// //     newSocket.on('connect_error', (error) => {
// //       console.error('Connection error:', error);
// //       setConnectionError(`Connection failed: ${error.message}`);
// //       setIsConnected(false);
// //     });

// //     newSocket.on('disconnect', (reason) => {
// //       console.log('Socket disconnected:', reason);
// //       setIsConnected(false);
// //       if (reason === 'io server disconnect') {
// //         // Server disconnected the socket, reconnect manually
// //         newSocket.connect();
// //       }
// //     });

// //     // Message event handlers
// //     newSocket.on('receive_message', (messageData) => {
// //       console.log('Received message:', messageData);
// //       setMessages(prev => [...prev, {
// //         id: Date.now() + Math.random(), // More unique ID
// //         content: messageData.message,
// //         sender: messageData.sender,
// //         timestamp: new Date(messageData.timestamp),
// //         type: messageData.messageType
// //       }]);
// //     });

// //     newSocket.on('message_sent', (response) => {
// //       console.log('Message sent response:', response);
// //       if (!response.success) {
// //         console.error('Failed to send message:', response.error);
// //         // Show error message to user
// //         setMessages(prev => [...prev, {
// //           id: Date.now() + Math.random(),
// //           content: `Error: ${response.error}`,
// //           sender: 'System',
// //           timestamp: new Date(),
// //           type: 'system'
// //         }]);
// //       }
// //     });

// //     // Additional debugging events
// //     newSocket.on('user_joined', (data) => {
// //       console.log('User joined event:', data);
// //     });

// //     newSocket.on('error', (error) => {
// //       console.error('Socket error:', error);
// //       setConnectionError(`Socket error: ${error}`);
// //     });

// //     setSocket(newSocket);

// //     // Cleanup on unmount
// //     return () => {
// //       console.log('Cleaning up socket connection');
// //       newSocket.disconnect();
// //     };
// //   }, [user]);

// //   const sendMessage = () => {
// //     if (!inputMessage.trim()) {
// //       console.log('Cannot send empty message');
// //       return;
// //     }

// //     if (!socket) {
// //       console.error('Socket not available');
// //       setMessages(prev => [...prev, {
// //         id: Date.now(),
// //         content: 'Error: Not connected to server',
// //         sender: 'System',
// //         timestamp: new Date(),
// //         type: 'system'
// //       }]);
// //       return;
// //     }

// //     if (!isConnected) {
// //       console.error('Socket not connected');
// //       setMessages(prev => [...prev, {
// //         id: Date.now(),
// //         content: 'Error: Connection lost. Please try again.',
// //         sender: 'System',
// //         timestamp: new Date(),
// //         type: 'system'
// //       }]);
// //       return;
// //     }

// //     const messageData = {
// //       message: inputMessage.trim(),
// //       recipientId: 'mentor',
// //       timestamp: new Date().toISOString()
// //     };

// //     console.log('Sending message:', messageData);

// //     // Add message to UI immediately (optimistic update)
// //     const optimisticMessage = {
// //       id: Date.now(),
// //       content: inputMessage.trim(),
// //       sender: user.name,
// //       timestamp: new Date(),
// //       type: 'user'
// //     };

// //     setMessages(prev => [...prev, optimisticMessage]);
    
// //     // Send message to server
// //     socket.emit('send_message', messageData);
// //     setInputMessage('');
// //   };

// //   const handleKeyPress = (e) => {
// //     if (e.key === 'Enter' && !e.shiftKey) {
// //       e.preventDefault();
// //       sendMessage();
// //     }
// //   };

// //   const reconnect = () => {
// //     if (socket) {
// //       socket.connect();
// //     }
// //   };

// //   return (
// //     <div className="chat-container">
// //       <div className="chat-header">
// //         <div className="chat-title">
// //           <h3>💬 Chat with Mentor</h3>
// //           <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
// //             {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
// //           </span>
// //           {connectionError && (
// //             <div className="error-text" style={{ fontSize: '12px', color: '#ff6b6b' }}>
// //               {connectionError}
// //             </div>
// //           )}
// //         </div>
// //         <div className="header-actions">
// //           {!isConnected && (
// //             <button onClick={reconnect} className="reconnect-button" style={{ marginRight: '10px' }}>
// //               🔄 Reconnect
// //             </button>
// //           )}
// //           <button onClick={onClose} className="close-button">✕</button>
// //         </div>
// //       </div>

// //       <div className="messages-container">
// //         {messages.length === 0 ? (
// //           <div className="no-messages" style={{ 
// //             textAlign: 'center', 
// //             color: '#666', 
// //             fontStyle: 'italic', 
// //             padding: '20px' 
// //           }}>
// //             Welcome! Start a conversation with a mentor.
// //           </div>
// //         ) : (
// //           messages.map((message) => (
// //             <div
// //               key={message.id}
// //               className={`message ${message.type === 'user' ? 'user-message' : message.type === 'system' ? 'system-message' : 'mentor-message'}`}
// //             >
// //               <div className="message-content">
// //                 {message.content}
// //               </div>
// //               <div className="message-meta">
// //                 {message.sender} • {message.timestamp.toLocaleTimeString()}
// //               </div>
// //             </div>
// //           ))
// //         )}
// //         <div ref={messagesEndRef} />
// //       </div>

// //       <div className="message-input-container">
// //         <textarea
// //           value={inputMessage}
// //           onChange={(e) => setInputMessage(e.target.value)}
// //           onKeyPress={handleKeyPress}
// //           placeholder={isConnected ? "Type your message..." : "Connecting..."}
// //           rows="1"
// //           maxLength="1000"
// //           disabled={!isConnected}
// //           style={{
// //             opacity: isConnected ? 1 : 0.6
// //           }}
// //         />
// //         <button
// //           onClick={sendMessage}
// //           disabled={!inputMessage.trim() || !isConnected}
// //           className="send-button"
// //           style={{
// //             opacity: (!inputMessage.trim() || !isConnected) ? 0.6 : 1
// //           }}
// //         >
// //           {isConnected ? 'Send' : 'Connecting...'}
// //         </button>
// //       </div>
      
// //       {/* Debug info (remove in production) */}
// //       {import.meta.env.NODE_ENV === 'development' && (
// //         <div className="debug-info" style={{
// //           position: 'absolute',
// //           bottom: '10px',
// //           right: '10px',
// //           fontSize: '10px',
// //           color: '#666',
// //           background: 'rgba(0,0,0,0.1)',
// //           padding: '5px',
// //           borderRadius: '3px'
// //         }}>
// //           Socket ID: {socket?.id || 'Not connected'}<br/>
// //           Connected: {isConnected ? 'Yes' : 'No'}<br/>
// //           Messages: {messages.length}
// //         </div>
// //       )}
// //     </div>
// //   );
// // };

// // export default ChatWithMentor;


// // import React, { useState, useEffect, useRef } from 'react';
// // import io from 'socket.io-client';
// // import '../../App.css';

// // const ChatWithMentor = ({ user, onClose }) => {
// //   const [socket, setSocket] = useState(null);
// //   const [messages, setMessages] = useState([]);
// //   const [inputMessage, setInputMessage] = useState('');
// //   const [isConnected, setIsConnected] = useState(false);
// //   const [isTyping, setIsTyping] = useState(false);
// //   const messagesEndRef = useRef(null);

// //   const scrollToBottom = () => {
// //     messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
// //   };

// //   useEffect(() => {
// //     scrollToBottom();
// //   }, [messages]);

// //   useEffect(() => {
// //     const newSocket = io('http://localhost:5000', {
// //       auth: {
// //         token: localStorage.getItem('token')
// //       }
// //     });

// //     newSocket.on('connect', () => {
// //       setIsConnected(true);
// //       newSocket.emit('join_chat', {
// //         userName: user.name,
// //         userId: user.id,
// //         userType: 'user'
// //       });
// //     });

// //     newSocket.on('receive_message', (messageData) => {
// //       setMessages(prev => [...prev, {
// //         id: Date.now(),
// //         content: messageData.message,
// //         sender: messageData.sender,
// //         timestamp: new Date(messageData.timestamp),
// //         type: messageData.messageType
// //       }]);
// //     });

// //     newSocket.on('message_sent', (response) => {
// //       if (!response.success) {
// //         console.error('Failed to send message:', response.error);
// //       }
// //     });

// //     newSocket.on('disconnect', () => {
// //       setIsConnected(false);
// //     });

// //     setSocket(newSocket);

// //     // Cleanup on unmount
// //     return () => {
// //       newSocket.disconnect();
// //     };
// //   }, [user]);

// //   const sendMessage = () => {
// //     if (inputMessage.trim() && socket && isConnected) {
// //       const messageData = {
// //         message: inputMessage.trim(),
// //         recipientId: 'mentor'
// //       };

// //       // Add message to UI immediately (optimistic update)
// //       setMessages(prev => [...prev, {
// //         id: Date.now(),
// //         content: inputMessage.trim(),
// //         sender: user.name,
// //         timestamp: new Date(),
// //         type: 'user'
// //       }]);

// //       socket.emit('send_message', messageData);
// //       setInputMessage('');
// //     }
// //   };

// //   const handleKeyPress = (e) => {
// //     if (e.key === 'Enter' && !e.shiftKey) {
// //       e.preventDefault();
// //       sendMessage();
// //     }
// //   };

// //   return (
// //     <div className="chat-container">
// //       <div className="chat-header">
// //         <div className="chat-title">
// //           <h3>💬 Chat with Mentor</h3>
// //           <span className={`status-indicator ${isConnected ? 'connected' : 'disconnected'}`}>
// //             {isConnected ? 'Connected' : 'Connecting...'}
// //           </span>
// //         </div>
// //         <button onClick={onClose} className="close-button">✕</button>
// //       </div>

// //       <div className="messages-container">
// //         {messages.map((message) => (
// //           <div
// //             key={message.id}
// //             className={`message ${message.type === 'user' ? 'user-message' : message.type === 'system' ? 'system-message' : 'mentor-message'}`}
// //           >
// //             <div className="message-content">
// //               {message.content}
// //             </div>
// //             <div className="message-meta">
// //               {message.sender} • {message.timestamp.toLocaleTimeString()}
// //             </div>
// //           </div>
// //         ))}
// //         <div ref={messagesEndRef} />
// //       </div>

// //       <div className="message-input-container">
// //         <textarea
// //           value={inputMessage}
// //           onChange={(e) => setInputMessage(e.target.value)}
// //           onKeyPress={handleKeyPress}
// //           placeholder="Type your message..."
// //           rows="1"
// //           maxLength="1000"
// //           disabled={!isConnected}
// //         />
// //         <button
// //           onClick={sendMessage}
// //           disabled={!inputMessage.trim() || !isConnected}
// //           className="send-button"
// //         >
// //           Send
// //         </button>
// //       </div>
// //     </div>
// //   );
// // };

// // export default ChatWithMentor;