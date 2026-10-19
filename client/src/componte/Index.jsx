import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Findvideo from './Findvideo';
import Findpost from './Findpost';

const DEFAULT_AVATAR =
  'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png';

function randomizeItems(array) {
  const shuffledArray = [...array];
  for (let i = shuffledArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledArray[i], shuffledArray[j]] = [shuffledArray[j], shuffledArray[i]];
  }
  return shuffledArray;
}

function Index() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);
  const [feedTab, setFeedTab] = useState('everyone'); // 'everyone' or 'following'

  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/posts', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setPosts(randomizeItems(Array.isArray(data) ? data : []));
      } else {
        throw new Error(data.message || 'Failed to fetch posts.');
      }
    } catch (err) {
      setError(err.message || 'Network error fetching posts');
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      const response = await fetch('http://localhost:5000/api/users/getuser', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        setUserData(data.user);
      }
    } catch (err) {
      console.error('Failed to fetch user data:', err.message);
    }
  };

  useEffect(() => {
    fetchPosts();
    fetchUserData();
  }, []);

  // Determine if a post is a video based on file extension
  const isVideoPost = (post) =>
    post.picture && post.picture.split('.').at(-1) === 'mp4';

  // Apply Following filter when that tab is active
  const displayedPosts =
    feedTab === 'following' && userData
      ? posts.filter((p) => userData.following?.includes(p.userId?._id))
      : posts;

  return (
    <main className="np-feed-column" id="body_index">
      {/* ── Create-Post Composer Prompt ── */}
      {userData && (
        <Link
          to="/Add"
          className="np-composer-prompt"
          aria-label="Create a new post"
        >
          <img
            src={userData.profilePicture || DEFAULT_AVATAR}
            alt={userData.username || 'Your avatar'}
            className="np-post-avatar np-composer-avatar"
            onError={(e) => {
              e.target.src = DEFAULT_AVATAR;
            }}
          />
          <span className="np-composer-prompt-text">
            What's on your mind?
          </span>
          <div className="np-composer-media-hints">
            <i
              className="fa-regular fa-image"
              title="Photo"
              aria-hidden="true"
            />
            <i
              className="fa-solid fa-video"
              title="Video"
              aria-hidden="true"
            />
          </div>
        </Link>
      )}

      {/* ── Feed Filter Tabs ── */}
      <nav className="np-feed-header" id="header_index" aria-label="Feed filter">
        <button
          type="button"
          className={`np-feed-tab ${feedTab === 'following' ? 'active' : ''}`}
          onClick={() => setFeedTab('following')}
        >
          <i className="fa-solid fa-user-group" />
          <span>Following</span>
        </button>
        <button
          type="button"
          className={`np-feed-tab ${feedTab === 'everyone' ? 'active' : ''}`}
          onClick={() => setFeedTab('everyone')}
        >
          <i className="fa-solid fa-globe" />
          <span>Everyone</span>
        </button>
      </nav>

      {/* ── Loading State ── */}
      {loading && (
        <div className="np-feed-state">
          <div className="np-spinner" role="status" aria-label="Loading feed" />
          <p className="np-feed-state-title">Loading your feed…</p>
        </div>
      )}

      {/* ── Error State ── */}
      {error && !loading && (
        <div className="np-feed-state">
          <i
            className="fa-solid fa-triangle-exclamation np-feed-state-icon"
            style={{ color: 'var(--color-danger)' }}
          />
          <p className="np-feed-state-title">Unable to load feed</p>
          <p className="np-feed-state-desc">{error}</p>
          <button type="button" className="btn-secondary" onClick={fetchPosts}>
            <i className="fa-solid fa-rotate-right" /> Try Again
          </button>
        </div>
      )}

      {/* ── Feed Content ── */}
      {!loading && !error && (
        <section
          className="np-home-feed-section"
          id="section_index"
          aria-label="Social Feed"
        >
          {displayedPosts.length > 0 ? (
            displayedPosts.map((post, index) =>
              isVideoPost(post) ? (
                <Findvideo
                  key={post._id || index}
                  video={post}
                  index={index}
                  userData={userData}
                  fetchPosts={fetchPosts}
                />
              ) : (
                <Findpost
                  key={post._id || index}
                  post={post}
                  fetchPosts={fetchPosts}
                  userData={userData}
                />
              )
            )
          ) : (
            <div className="np-feed-state">
              <i className="fa-regular fa-newspaper np-feed-state-icon" />
              <p className="np-feed-state-title">
                {feedTab === 'following'
                  ? 'No posts from people you follow'
                  : 'No posts yet'}
              </p>
              <p className="np-feed-state-desc">
                {feedTab === 'following'
                  ? 'Switch to "Everyone" or follow more people to see their posts.'
                  : 'Be the first to share something with the community!'}
              </p>
              <Link
                to="/Add"
                className="btn-primary"
                style={{ marginTop: 'var(--space-2)' }}
              >
                <i className="fa-solid fa-plus" /> Create Post
              </Link>
            </div>
          )}
        </section>
      )}
    </main>
  );
}

export default Index;