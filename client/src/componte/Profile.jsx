import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Modal from './Modal';

function Profile() {
  const [userData, setUserData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [category, setCategory] = useState('');

  useEffect(() => {
    let isMounted = true;

    const loadProfileAndPosts = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // 1. Fetch current user data and their posts
        const userRes = await fetch('http://localhost:5000/api/users/getuser', { headers });
        const userDataJson = await userRes.json();

        if (!userRes.ok) {
          throw new Error(userDataJson.message || 'Failed to fetch profile data.');
        }

        if (isMounted) {
          setUserData(userDataJson.user);
          setPosts(userDataJson.posts || []);
        }

        // 2. Fetch all posts to filter for liked posts
        const postsRes = await fetch('http://localhost:5000/api/posts', { headers });
        const allPostsJson = await postsRes.json();

        if (postsRes.ok && Array.isArray(allPostsJson) && userDataJson.user?._id) {
          const currentUserId = userDataJson.user._id;
          const userLiked = allPostsJson.filter((p) =>
            p.likes && p.likes.some((like) => (typeof like === 'object' ? like._id === currentUserId : like === currentUserId))
          );
          if (isMounted) {
            setLikedPosts(userLiked);
          }
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'An error occurred while loading profile.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    loadProfileAndPosts();

    return () => {
      isMounted = false;
    };
  }, []); // Run once on mount to eliminate infinite loop bug

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedImage(null);
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: `${userData?.username || 'User'} on Network Plus`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Profile link copied to clipboard!');
    }
  };

  // Determine which posts array to filter
  const currentPostPool = category === 'likes' ? likedPosts : posts;

  const filteredPosts = currentPostPool.filter((post) => {
    if (!post || !post.picture) return false;
    const ext = post.picture.split('.').at(-1)?.toLowerCase();
    if (category === '') return true;
    if (category === 'videos') return ext === 'mp4' || ext === 'webm' || ext === 'mov';
    if (category === 'images') return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
    if (category === 'likes') return true;
    return true;
  });

  return (
    <div className="np-profile-page">
      {/* Top Header Bar */}
      <div className="np-profile-top-bar">
        <Link to="/" className="np-btn np-btn-ghost np-btn-icon" aria-label="Go back">
          <i className="fa-solid fa-arrow-left" />
        </Link>
        <h1 className="np-top-nav-logo" style={{ margin: 0 }}>
          Network <span className="np-top-nav-logo-plus">Plus</span>
        </h1>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <Link to="/Settings" className="np-btn np-btn-ghost np-btn-icon" aria-label="Settings">
            <i className="fa-solid fa-gear" />
          </Link>
        </div>
      </div>

      {loading && (
        <div className="np-loading-state" style={{ minHeight: '200px' }}>
          <div className="np-spinner" />
          <p>Loading profile...</p>
        </div>
      )}

      {error && (
        <div className="np-error-state">
          <i className="fa-solid fa-circle-exclamation np-error-state-icon" />
          <p className="np-error-state-title">{error}</p>
          <button onClick={() => window.location.reload()} className="np-btn np-btn-primary">
            Retry
          </button>
        </div>
      )}

      {!loading && userData && (
        <>
          {/* Profile Header Card */}
          <section className="np-profile-header-card">
            <div className="np-profile-main-info">
              <div className="np-profile-avatar-wrap">
                <img
                  src={userData.profilePicture || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png'}
                  alt={`${userData.username}'s profile`}
                  className="np-profile-avatar-lg"
                />
              </div>

              <div className="np-profile-identity" style={{ flex: 1 }}>
                <h2 className="np-profile-name">{userData.username}</h2>
                <span className="np-profile-handle">@{userData.username?.toLowerCase().replace(/\s+/g, '')}</span>

                {/* Stats */}
                <div className="np-profile-stats">
                  <div className="np-profile-stat">
                    <span className="np-profile-stat-num">{posts.length}</span>
                    <span className="np-profile-stat-label">Posts</span>
                  </div>
                  <div className="np-profile-stat">
                    <span className="np-profile-stat-num">{userData.followers?.length || 0}</span>
                    <span className="np-profile-stat-label">Followers</span>
                  </div>
                  <div className="np-profile-stat">
                    <span className="np-profile-stat-num">{userData.following?.length || 0}</span>
                    <span className="np-profile-stat-label">Following</span>
                  </div>
                  <div className="np-profile-stat">
                    <span className="np-profile-stat-num">
                      {posts.reduce((total, p) => total + (p.likes?.length || 0), 0)}
                    </span>
                    <span className="np-profile-stat-label">Likes</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bio */}
            <div className="np-profile-bio-section">
              <p className="np-profile-bio-text">
                {userData.bio || 'No bio yet.'}
              </p>
              {userData.bioLink && (
                <a
                  href={userData.bioLink.startsWith('http') ? userData.bioLink : `https://${userData.bioLink}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="np-profile-bio-link"
                >
                  <i className="fa-solid fa-link" />
                  {userData.bioLink}
                </a>
              )}
            </div>

            {/* Action Buttons */}
            <div className="np-profile-actions">
              <Link to="/EditProfile" className="np-btn np-btn-primary">
                <i className="fa-solid fa-user-pen" /> Edit Profile
              </Link>
              <button type="button" onClick={handleShare} className="np-btn np-btn-outline">
                <i className="fa-solid fa-share-nodes" /> Share Profile
              </button>
            </div>
          </section>

          {/* Tab Navigation */}
          <div className="np-profile-tabs">
            <button
              type="button"
              className={`np-profile-tab ${category === '' ? 'active' : ''}`}
              onClick={() => setCategory('')}
            >
              <i className="fa-solid fa-table-cells" /> All Posts ({posts.length})
            </button>
            <button
              type="button"
              className={`np-profile-tab ${category === 'videos' ? 'active' : ''}`}
              onClick={() => setCategory('videos')}
            >
              <i className="fa-solid fa-film" /> Videos
            </button>
            <button
              type="button"
              className={`np-profile-tab ${category === 'images' ? 'active' : ''}`}
              onClick={() => setCategory('images')}
            >
              <i className="fa-regular fa-images" /> Photos
            </button>
            <button
              type="button"
              className={`np-profile-tab ${category === 'likes' ? 'active' : ''}`}
              onClick={() => setCategory('likes')}
            >
              <i className="fa-solid fa-heart" /> Liked ({likedPosts.length})
            </button>
          </div>

          {/* Posts Grid */}
          {filteredPosts.length === 0 ? (
            <div className="np-empty-state" style={{ minHeight: '240px' }}>
              <i className="fa-regular fa-folder-open np-empty-state-icon" />
              <p className="np-empty-state-title">No posts found</p>
              <p className="np-empty-state-subtitle">
                {category === 'likes'
                  ? 'Posts you have liked will show up here.'
                  : 'Start sharing your photos and videos with your network.'}
              </p>
              {category !== 'likes' && (
                <Link to="/AddPost" className="np-btn np-btn-primary" style={{ marginTop: 'var(--space-3)' }}>
                  Create First Post
                </Link>
              )}
            </div>
          ) : (
            <div className="np-profile-grid">
              {filteredPosts.map((post) => {
                const isVideo = ['mp4', 'webm', 'mov'].includes(post.picture?.split('.').at(-1)?.toLowerCase());
                return (
                  <Link
                    to={`/openpost/${post._id}`}
                    key={post._id}
                    className="np-profile-grid-item"
                  >
                    {isVideo ? (
                      <video src={post.picture} muted playsInline />
                    ) : (
                      <img src={post.picture} alt={post.description || 'Post thumbnail'} loading="lazy" />
                    )}
                  </Link>
                );
              })}
            </div>
          )}

          {/* Modal for Post Preview */}
          <Modal show={showModal} onClose={handleCloseModal}>
            {selectedImage && (
              <div>
                <img
                  src={selectedImage}
                  alt="Selected Post"
                  style={{ maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', borderRadius: 'var(--radius-lg)' }}
                />
              </div>
            )}
          </Modal>
        </>
      )}
    </div>
  );
}

export default Profile;