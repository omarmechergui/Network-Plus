import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { Link } from 'react-router-dom';

const socket = io('http://localhost:5000');

function Contact({ talk, userId, activeContact, onBack }) {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasNewMessagesBelow, setHasNewMessagesBelow] = useState(false);

  const messagesContainerRef = useRef(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const isNearBottomRef = useRef(true);

  // Helper: check if user is scrolled near bottom
  const checkIfNearBottom = () => {
    const el = messagesContainerRef.current;
    if (!el) return true;
    const threshold = 120; // px
    const position = el.scrollHeight - el.scrollTop - el.clientHeight;
    return position <= threshold;
  };

  const handleScroll = () => {
    const nearBottom = checkIfNearBottom();
    isNearBottomRef.current = nearBottom;
    if (nearBottom) {
      setHasNewMessagesBelow(false);
    }
  };

  const scrollToBottom = useCallback((behavior = 'smooth') => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior });
      setHasNewMessagesBelow(false);
    }
  }, []);

  // 1. Load conversation history when talk or userId changes
  const fetchMessages = useCallback(async () => {
    if (!userId || !talk) return;

    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `http://localhost:5000/api/messages/conversation/${userId}/${talk}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        }
      );

      if (Array.isArray(response.data)) {
        setMessages(
          response.data.map((msg) => ({
            _id: msg._id,
            text: msg.text,
            isFriend: (typeof msg.senderId === 'object' ? msg.senderId?._id : msg.senderId) === talk,
            createdAt: msg.createdAt || new Date(),
          }))
        );
        setTimeout(() => scrollToBottom('auto'), 60);
      }
    } catch (err) {
      console.error('Error fetching conversation:', err);
      setError('Failed to load conversation history.');
    } finally {
      setLoading(false);
    }
  }, [talk, userId, scrollToBottom]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // 2. Set up Socket.IO listeners
  useEffect(() => {
    if (userId) {
      const token = localStorage.getItem('token');
      socket.emit('setUser', { userId, token });
    }

    const handleReceiveMessage = (data) => {
      const senderObjId = typeof data.senderId === 'object' ? data.senderId?._id : data.senderId;
      const isRelevant =
        (data.receiverId === userId && senderObjId === talk) ||
        (data.receiverId === talk && senderObjId === userId);

      if (isRelevant) {
        setMessages((prevMessages) => {
          // Prevent duplicates by checking if ID or identical text/timestamp matches
          if (data._id && prevMessages.some((m) => m._id === data._id)) {
            return prevMessages;
          }
          return [
            ...prevMessages,
            {
              _id: data._id,
              text: data.text,
              isFriend: senderObjId === talk,
              createdAt: data.createdAt || new Date(),
            },
          ];
        });

        // Smart scroll: only auto-scroll if user is already near bottom, else show indicator
        if (isNearBottomRef.current) {
          setTimeout(() => scrollToBottom('smooth'), 50);
        } else {
          setHasNewMessagesBelow(true);
        }
      }
    };

    socket.on('receiveMessage', handleReceiveMessage);

    return () => {
      socket.off('receiveMessage', handleReceiveMessage);
    };
  }, [talk, userId, scrollToBottom]);

  // Auto-resize composer textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSendMessage = () => {
    const trimmed = message.trim();
    if (!trimmed) return;

    // Send via socket
    socket.emit('newMessage', {
      senderId: userId,
      receiverId: talk,
      text: trimmed,
    });

    // Optimistically add locally
    const newMsg = {
      _id: `temp-${Date.now()}`,
      text: trimmed,
      isFriend: false,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, newMsg]);
    setMessage('');

    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    setTimeout(() => scrollToBottom('smooth'), 50);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Format message time
  const formatTime = (dateStr) => {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? '' : d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Group messages with date separators and consecutive grouping
  const groupedItems = useMemo(() => {
    const items = [];
    let lastDateStr = null;

    messages.forEach((msg, idx) => {
      const d = new Date(msg.createdAt || Date.now());
      const dateStr = isNaN(d.getTime())
        ? 'Recent'
        : d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });

      if (dateStr !== lastDateStr) {
        items.push({ type: 'divider', date: dateStr, id: `div-${dateStr}-${idx}` });
        lastDateStr = dateStr;
      }

      // Check if previous message in same group was from same sender
      const prevMsg = idx > 0 ? messages[idx - 1] : null;
      const nextMsg = idx < messages.length - 1 ? messages[idx + 1] : null;
      const isConsecutiveWithPrev = prevMsg && prevMsg.isFriend === msg.isFriend;
      const isLastInSequence = !nextMsg || nextMsg.isFriend !== msg.isFriend;

      items.push({
        type: 'message',
        data: msg,
        id: msg._id || `msg-${idx}`,
        isConsecutive: isConsecutiveWithPrev,
        showAvatar: msg.isFriend && isLastInSequence,
      });
    });

    return items;
  }, [messages]);

  return (
    <div className="np-chat-window">
      {/* Active Chat Header */}
      <div className="np-chat-header">
        <div className="np-chat-header-user">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="np-chat-back-btn"
              aria-label="Back to conversations"
              title="Back"
            >
              <i className="fa-solid fa-arrow-left" />
            </button>
          )}

          <Link
            to={`/User/${talk}`}
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)', textDecoration: 'none' }}
          >
            <img
              src={activeContact?.profilePicture || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png'}
              alt=""
              className="np-chat-header-avatar"
            />
            <div className="np-chat-header-info">
              <h3 className="np-chat-header-title">{activeContact?.username || 'User'}</h3>
              <span className="np-chat-header-sub">Direct Message</span>
            </div>
          </Link>
        </div>

        <div className="np-chat-header-actions">
          <Link
            to={`/User/${talk}`}
            className="np-btn np-btn-ghost np-btn-icon"
            title="View Profile"
            aria-label="View Profile"
          >
            <i className="fa-regular fa-user" />
          </Link>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div
        className="np-chat-messages-area"
        ref={messagesContainerRef}
        onScroll={handleScroll}
      >
        {loading && (
          <div className="np-loading-state" style={{ minHeight: '140px' }}>
            <div className="np-spinner" />
            <p style={{ fontSize: 'var(--font-size-xs)' }}>Loading messages...</p>
          </div>
        )}

        {error && (
          <div className="np-error-state" style={{ padding: 'var(--space-6) var(--space-4)', margin: 'auto' }}>
            <i className="fa-solid fa-circle-exclamation np-error-state-icon" style={{ fontSize: '1.5rem', marginBottom: 'var(--space-2)' }} />
            <p className="np-error-state-title" style={{ fontSize: 'var(--font-size-sm)', margin: '0 0 var(--space-3) 0' }}>{error}</p>
            <button
              type="button"
              onClick={fetchMessages}
              className="np-btn np-btn-outline np-btn-sm"
            >
              <i className="fa-solid fa-rotate" /> Retry
            </button>
          </div>
        )}

        {!loading && !error && messages.length === 0 && (
          <div className="np-empty-state" style={{ margin: 'auto' }}>
            <i className="fa-regular fa-comment-dots np-empty-state-icon" />
            <p className="np-empty-state-title">No messages yet</p>
            <p className="np-empty-state-subtitle">Say hello to {activeContact?.username || 'your contact'} to start chatting!</p>
          </div>
        )}

        {!loading &&
          groupedItems.map((item) => {
            if (item.type === 'divider') {
              return (
                <div key={item.id} className="np-chat-date-divider">
                  <span className="np-chat-date-badge">{item.date}</span>
                </div>
              );
            }

            const msg = item.data;
            return (
              <div
                key={item.id}
                className={`np-message-row ${msg.isFriend ? 'received' : 'sent'} ${item.isConsecutive ? 'np-msg-consecutive' : ''}`}
              >
                {msg.isFriend && (
                  <div className="np-msg-avatar-slot">
                    {item.showAvatar && (
                      <img
                        src={activeContact?.profilePicture || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png'}
                        alt=""
                        className="np-msg-avatar"
                        loading="lazy"
                      />
                    )}
                  </div>
                )}
                <div className="np-msg-content-wrap">
                  <div className={`np-msg-bubble ${msg.isFriend ? 'received' : 'sent'}`}>
                    {msg.text}
                  </div>
                  <span className="np-msg-timestamp">{formatTime(msg.createdAt)}</span>
                </div>
              </div>
            );
          })}

        <div ref={messagesEndRef} />
      </div>

      {/* Floating "New Messages" Jump Button */}
      {hasNewMessagesBelow && (
        <button
          type="button"
          onClick={() => scrollToBottom('smooth')}
          className="np-chat-scroll-bottom-btn"
        >
          <i className="fa-solid fa-arrow-down" /> New messages
        </button>
      )}

      {/* Message Composer Area */}
      <div className="np-chat-composer-box">
        <div className="np-chat-input-bar">
          <textarea
            ref={textareaRef}
            className="np-chat-textarea"
            placeholder={`Message @${activeContact?.username || 'user'}... (Enter to send, Shift+Enter for new line)`}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            aria-label="Message text"
          />
          <button
            type="button"
            onClick={handleSendMessage}
            disabled={!message.trim()}
            className="np-chat-send-btn"
            title="Send Message"
            aria-label="Send Message"
          >
            <i className="fa-solid fa-paper-plane" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Contact;
