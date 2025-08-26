import React, { useState, useEffect, useRef } from 'react';
import io from 'socket.io-client';
import '../../App.css';

const MentorDashboard = ({ user }) => {
  const [socket, setSocket] = useState(null);
  const [activeUsers, setActiveUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [conversations, setConversations] = useState({});
  const [inputMessage, setInputMessage] = useState('');
  const [unreadMessages, setUnreadMessages] = useState(new Set());
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
        token: localStorage.getItem('auth_token')
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

      // Mark as unread if not currently selected
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

      // Add message to UI immediately
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

  return (
    <div className="mentor-dashboard">
      <div className="dashboard-header">
        <h2>👨‍🏫 Mentor Dashboard</h2>
        <div className="mentor-info">
          Welcome, {user.name}
        </div>
      </div>

      <div className="dashboard-content">
        <div className="users-sidebar">
          <div className="sidebar-header">
            <h3>Active Users ({activeUsers.length})</h3>
          </div>
          <div className="users-list">
            {activeUsers.length === 0 ? (
              <div className="no-users">No active users</div>
            ) : (
              activeUsers.map((userData) => (
                <div
                  key={userData.userId}
                  className={`user-item ${selectedUser?.userId === userData.userId ? 'selected' : ''}`}
                  onClick={() => selectUser(userData)}
                >
                  <div className="user-info">
                    <div className="user-name">{userData.userName}</div>
                    <div className="user-meta">
                      Joined: {new Date(userData.joinedAt).toLocaleTimeString()}
                    </div>
                  </div>
                  {unreadMessages.has(userData.userId) && (
                    <div className="unread-indicator"></div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="chat-area">
          {selectedUser ? (
            <>
              <div className="chat-header">
                <h4>Conversation with {selectedUser.userName}</h4>
              </div>
              <div className="messages-container">
                {(conversations[selectedUser.userId] || []).map((message) => (
                  <div
                    key={message.id}
                    className={`message ${message.type === 'user' ? 'user-message' : message.type === 'system' ? 'system-message' : 'mentor-message'}`}
                  >
                    <div className="message-content">
                      {message.content}
                    </div>
                    <div className="message-meta">
                      {message.sender} • {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
              <div className="message-input-container">
                <textarea
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder={`Reply to ${selectedUser.userName}...`}
                  rows="2"
                  maxLength="1000"
                />
                <button
                  onClick={sendReply}
                  disabled={!inputMessage.trim()}
                  className="send-button"
                >
                  Reply
                </button>
              </div>
            </>
          ) : (
            <div className="no-conversation">
              <div className="placeholder-message">
                Select a user to start conversation
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MentorDashboard;