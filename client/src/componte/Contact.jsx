import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios'; // You'll need to install axios (or use fetch)

const socket = io('http://localhost:5000'); // Change this to your server's URL

function Contact({ talk, userId }) {  // talk is the receiverId
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  // Function to scroll to bottom of messages container
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };
  // Load conversation history on mount or when talk/userId changes
  useEffect(() => {
    if (!userId || !talk) return;

    // Fetch messages between userId and talk (receiverId)
    const fetchMessages = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/messages/conversation/${userId}/${talk}`
        );
        // Assuming the API returns an array of messages
        setMessages(
          response.data.map(msg => ({
            text: msg.text,
            isFriend: msg.senderId === talk, // If the sender is the friend (receiver)
          }))
        );
      } catch (error) {
        console.error('Error fetching conversation:', error);
      }
    };

    fetchMessages();
  }, [talk, userId]);

  useEffect(() => {
    if (userId) {
      socket.emit('setUser', userId); // Join the user's room
    }

    socket.on('receiveMessage', (data) => {
      // Check if this message is relevant to the current conversation.
      console.log(data)
      if (
        (data.receiverId === userId && data.senderId._id === talk) ||
        (data.receiverId === talk && data.senderId._id === userId)
      ) {
        setMessages((prevMessages) => [
          ...prevMessages,
          { text: data.text, isFriend: data.senderId._id === talk },
        ]);
      }
    });

    // Cleanup socket listener when component unmounts
    return () => {
      socket.off('receiveMessage');
    };
  }, [talk, userId]);

   // Scroll to bottom whenever messages change
   useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const handleSendMessage = () => {
    if (message.trim() === '') return;

    // Send the message to the server via socket
    socket.emit('newMessage', {
      senderId: userId,  // Current user is the sender
      receiverId: talk,
      text: message,
    });

    // Add the message locally
    setMessages([...messages, { text: message, isFriend: false }]);
    setMessage('');
  };

  const handleSendPhoto = () => {
    console.log('Send photo/video functionality not implemented yet.');
  };

  return (
    <div id="body_contact">
      <div id="chat_container_contact">
        <div id="chat_messages_contact" style={{ gap: '10px' }}>
          {messages.map((message, index) => (
            <div key={index} style={{ display: 'flex', gap: '10px', paddingTop: '10px' }}>
              {message.isFriend && (
                <div>
                  <img
                    src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                    alt="friend avatar"
                    style={{ width: '50px', height: '50px', borderRadius: '50%', paddingTop: '10px' }}
                  />
                </div>
              )}
              <div className={`message ${message.isFriend ? 'friend-message' : 'my-message'}`}>
                <p>{message.text}</p>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} /> {/* This is a dummy div to scroll to */}
        </div>
        <div className="chat-input">
          <input
            type="text"
            id="message-input"
            placeholder="Type your message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
          <button id="send_post_contact" type="button" title="Send Photo/Video" onClick={handleSendPhoto}>
            <i className="fa-solid fa-photo-film"></i>
          </button>
          <button id="send_button_contact" title="Send Message" onClick={handleSendMessage}>
            <i className="fa-regular fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  );
}

export default Contact;
