
import React, { useState } from 'react';
import ChatWithMentor from '../ChatWithMentor';
import '../../App.css';

const ChatButton = ({ user }) => {
  const [showChat, setShowChat] = useState(false);
  console.log(user);
  if (!user) {
    return null;
  }

  return (
    <>
      {!showChat && (
        <button
          className="chat-mentor-button"
          onClick={() => setShowChat(true)}
        >
          💬 Chat with Mentor
        </button>
      )}
      
      {showChat && (
        <div className="chat-overlay">
          <ChatWithMentor
            user={user}
            onClose={() => setShowChat(false)}
          />
        </div>
      )}
    </>
  );
};

export default ChatButton;