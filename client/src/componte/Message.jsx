import React, { useEffect, useState, useMemo, useCallback } from 'react';
import Contact from './Contact';

function Message() {
  const [contacts, setContacts] = useState([]);
  const [userData, setUserData] = useState(null);
  const [talk, setTalk] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch contacts (following list)
  const fetchcontacts = useCallback(async () => {
    try {
      setError(null);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users/contacts', {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });
      const data = await response.json();
      if (response.ok) {
        const contactList = data.contacts || [];
        setContacts(contactList);
        // Default to first contact on desktop if nothing selected
        if (contactList.length > 0 && !talk && window.innerWidth > 768) {
          setTalk(contactList[0]._id);
        }
      } else {
        throw new Error(data.message || 'Failed to fetch contacts');
      }
    } catch (err) {
      console.error('Error fetching contacts:', err);
      setError(err.message || 'Unable to load conversations.');
    } finally {
      setLoading(false);
    }
  }, [talk]);

  // Fetch current user
  const fetchUserData = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/users/getuser', {
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
        },
      });

      const data = await response.json();
      if (response.ok) {
        setUserData(data.user);
      } else {
        throw new Error(data.message || 'Failed to fetch user data.');
      }
    } catch (err) {
      console.error('Error fetching user data:', err);
    }
  }, []);

  useEffect(() => {
    fetchcontacts();
    fetchUserData();
  }, [fetchcontacts, fetchUserData]);

  // Filter contacts by search query
  const filteredContacts = useMemo(() => {
    if (!searchQuery.trim()) return contacts;
    const q = searchQuery.trim().toLowerCase();
    return contacts.filter((c) =>
      c.username?.toLowerCase().includes(q)
    );
  }, [contacts, searchQuery]);

  const activeContact = contacts.find((c) => c._id === talk);

  // Mobile back action: clear selected talk to return to sidebar
  const handleBackToConversations = () => {
    setTalk('');
  };

  const handleClearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className={`np-chat-split ${talk ? 'mobile-chat-open' : ''}`}>
      {/* Left Column: Conversation Sidebar */}
      <div className="np-chat-contacts-col">
        {/* Sidebar Header & Search */}
        <div className="np-chat-sidebar-header">
          <div className="np-chat-sidebar-title-row">
            <h2 className="np-chat-sidebar-title">Messages</h2>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--color-text-secondary)', fontWeight: 500 }}>
              {contacts.length} {contacts.length === 1 ? 'chat' : 'chats'}
            </span>
          </div>

          <div className="np-chat-search-wrap">
            <i className="fa-solid fa-magnifying-glass np-chat-search-icon" />
            <input
              type="text"
              className="np-chat-search-input"
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search conversations"
            />
            {searchQuery && (
              <button
                type="button"
                className="np-chat-search-clear"
                onClick={handleClearSearch}
                title="Clear search"
                aria-label="Clear search"
              >
                <i className="fa-solid fa-xmark" />
              </button>
            )}
          </div>
        </div>

        {/* Contacts List */}
        <div className="np-chat-contacts-list">
          {loading ? (
            // Skeleton shimmer loaders
            <div>
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="np-chat-skeleton-item">
                  <div className="np-skeleton-avatar" />
                  <div className="np-skeleton-text-group">
                    <div className="np-skeleton-line short" />
                    <div className="np-skeleton-line long" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="np-error-state" style={{ padding: 'var(--space-6) var(--space-4)', textAlign: 'center' }}>
              <i className="fa-solid fa-circle-exclamation np-error-state-icon" style={{ fontSize: '1.5rem', marginBottom: 'var(--space-2)' }} />
              <p className="np-error-state-title" style={{ fontSize: 'var(--font-size-sm)', margin: '0 0 var(--space-3) 0' }}>{error}</p>
              <button
                type="button"
                onClick={fetchcontacts}
                className="np-btn np-btn-outline np-btn-sm"
              >
                <i className="fa-solid fa-rotate" /> Retry
              </button>
            </div>
          ) : contacts.length === 0 ? (
            <div className="np-empty-state" style={{ padding: 'var(--space-8) var(--space-4)' }}>
              <i className="fa-regular fa-comments np-empty-state-icon" />
              <p className="np-empty-state-title" style={{ fontSize: 'var(--font-size-sm)' }}>No conversations yet</p>
              <p className="np-empty-state-subtitle" style={{ fontSize: 'var(--font-size-xs)' }}>
                Follow people on Network Plus to start direct conversations.
              </p>
            </div>
          ) : filteredContacts.length === 0 ? (
            <div className="np-empty-state" style={{ padding: 'var(--space-8) var(--space-4)' }}>
              <i className="fa-solid fa-magnifying-glass np-empty-state-icon" />
              <p className="np-empty-state-title" style={{ fontSize: 'var(--font-size-sm)' }}>No results found</p>
              <p className="np-empty-state-subtitle" style={{ fontSize: 'var(--font-size-xs)' }}>
                No conversations match "{searchQuery}"
              </p>
              <button
                type="button"
                onClick={handleClearSearch}
                className="np-btn np-btn-ghost np-btn-sm"
                style={{ marginTop: 'var(--space-2)' }}
              >
                Clear filter
              </button>
            </div>
          ) : (
            filteredContacts.map((contact) => {
              const isSelected = talk === contact._id;
              return (
                <div
                  key={contact._id}
                  className={`np-contact-item ${isSelected ? 'active' : ''}`}
                  onClick={() => setTalk(contact._id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && setTalk(contact._id)}
                  aria-selected={isSelected}
                >
                  <div className="np-contact-avatar-wrap">
                    <img
                      src={contact.profilePicture || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png'}
                      alt={`${contact.username}'s avatar`}
                      className="np-contact-avatar"
                      loading="lazy"
                    />
                  </div>

                  <div className="np-contact-info">
                    <div className="np-contact-top-row">
                      <span className="np-contact-name">{contact.username}</span>
                    </div>
                    <div className="np-contact-bottom-row">
                      <span className="np-contact-preview">Click to chat</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Right Column: Active Conversation */}
      <div className="np-chat-main-col">
        {talk ? (
          <Contact
            talk={talk}
            userId={userData?._id}
            activeContact={activeContact}
            onBack={handleBackToConversations}
          />
        ) : (
          <div className="np-empty-state" style={{ height: '100%', justifyContent: 'center', padding: 'var(--space-6)' }}>
            <i className="fa-regular fa-paper-plane np-empty-state-icon" style={{ fontSize: '2.5rem' }} />
            <p className="np-empty-state-title" style={{ fontSize: 'var(--font-size-base)' }}>Your Messages</p>
            <p className="np-empty-state-subtitle" style={{ maxWidth: '320px' }}>
              Select a conversation from the sidebar to chat with friends and creators.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Message;