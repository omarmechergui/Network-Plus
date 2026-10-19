import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Findpost from './Findpost';

function Post() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null);

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
        setPosts(Array.isArray(data) ? data : []);
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

  return (
    <main className="np-feed-column" id="body_post">
      {/* Loading State */}
      {loading && (
        <div className="np-feed-state">
          <div className="np-spinner" role="status" aria-label="Loading posts" />
          <p className="np-feed-state-title">Loading feed...</p>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <div className="np-feed-state">
          <i className="fa-solid fa-triangle-exclamation np-feed-state-icon" style={{ color: 'var(--color-danger)' }} />
          <p className="np-feed-state-title">Unable to load posts</p>
          <p className="np-feed-state-desc">{error}</p>
          <button type="button" className="btn-secondary" onClick={fetchPosts}>
            <i className="fa-solid fa-rotate-right" /> Try Again
          </button>
        </div>
      )}

      {/* Posts Section */}
      {!loading && !error && (
        <section id="section1_post" aria-label="Posts Feed">
          {posts.length > 0 ? (
            posts.map((post) => (
              <Findpost key={post._id} post={post} fetchPosts={fetchPosts} userData={userData} />
            ))
          ) : (
            <div className="np-feed-state">
              <i className="fa-regular fa-newspaper np-feed-state-icon" />
              <p className="np-feed-state-title">No posts yet</p>
              <p className="np-feed-state-desc">Be the first to share an update with the community!</p>
              <Link to="/Add" className="btn-primary" style={{ marginTop: 'var(--space-2)' }}>
                <i className="fa-solid fa-plus" /> Create Post
              </Link>
            </div>
          )}
        </section>
      )}
    </main>
  );
}

export default Post;