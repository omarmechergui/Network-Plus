import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import Modal from './Modal';

function User() {
  const { id } = useParams();
  const [userData, setUserData] = useState(null);
  const [userconnect, setUserconnect] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [category, setCategory] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const fetchProfileData = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        const headers = token ? { Authorization: `Bearer ${token}` } : {};

        // Fetch logged in user to check follow status
        const currentUserRes = await fetch('http://localhost:5000/api/users/getuser', { headers });
        const currentUserData = await currentUserRes.json();
        if (isMounted && currentUserRes.ok) {
          setUserconnect(currentUserData.user);
        }

        // Fetch viewed user's profile and posts
        const userRes = await fetch(`http://localhost:5000/api/users/profile/${id}`, { headers });
        const userDataJson = await userRes.json();

        if (!userRes.ok) {
          throw new Error(userDataJson.message || 'Failed to fetch user profile.');
        }

        if (isMounted) {
          setUserData(userDataJson.user);
          setPosts(userDataJson.posts || []);

          // Check if current user is following this user
          const currentUserFollowing = currentUserData?.user?.following || [];
          const followingStatus = currentUserFollowing.some((f) =>
            typeof f === 'object' ? f._id === id : f === id
          );
          setIsFollowing(followingStatus);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message || 'Error loading profile.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchProfileData();

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleFollowToggle = async () => {
    if (!userconnect || actionLoading) return;

    try {
      setActionLoading(true);
      const action = isFollowing ? 'unfollow' : 'follow';
      const token = localStorage.getItem('token');

      // Optimistically update UI
      setIsFollowing((prev) => !prev);
      setUserData((prev) => {
        if (!prev) return prev;
        const currentFollowers = prev.followers || [];
        const updatedFollowers = isFollowing
          ? currentFollowers.filter((fId) => (typeof fId === 'object' ? fId._id !== userconnect._id : fId !== userconnect._id))
          : [...currentFollowers, userconnect._id];
        return { ...prev, followers: updatedFollowers };
      });

      const response = await fetch(`http://localhost:5000/api/users/${id}/${action}`, {
        method: 'POST',
        headers: {
          Authorization: token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        // Rollback on failure
        setIsFollowing((prev) => !prev);
      }
    } catch (err) {
      // Rollback on error
      setIsFollowing((prev) => !prev);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedImage(null);
  };

  const filteredPosts = posts.filter((post) => {
    if (!post || !post.picture) return false;
    const ext = post.picture.split('.').at(-1)?.toLowerCase();
    if (category === '') return true;
    if (category === 'videos') return ext === 'mp4' || ext === 'webm' || ext === 'mov';
    if (category === 'images') return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
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
        <div style={{ width: '40px' }} />
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
          <Link to="/" className="np-btn np-btn-primary">
            Back to Home
          </Link>
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

            {/* Actions: Follow / Message */}
            <div className="np-profile-actions">
              <button
                type="button"
                onClick={handleFollowToggle}
                disabled={actionLoading}
                className={`np-btn ${isFollowing ? 'np-btn-outline' : 'np-btn-primary'}`}
              >
                <i className={`fa-solid ${isFollowing ? 'fa-user-check' : 'fa-user-plus'}`} />
                {isFollowing ? 'Following' : 'Follow'}
              </button>

              <Link to="/Message" className="np-btn np-btn-outline">
                <i className="fa-regular fa-comment-dots" /> Message
              </Link>
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
          </div>

          {/* Posts Grid */}
          {filteredPosts.length === 0 ? (
            <div className="np-empty-state" style={{ minHeight: '240px' }}>
              <i className="fa-regular fa-folder-open np-empty-state-icon" />
              <p className="np-empty-state-title">No posts yet</p>
              <p className="np-empty-state-subtitle">This user hasn't posted any content in this category.</p>
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

export default User;