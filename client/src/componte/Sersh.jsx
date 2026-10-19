import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function Sersh() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [usersData, setUsersData] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasSearched, setHasSearched] = useState(false);

  const fetchsearch = async (e) => {
    if (e) e.preventDefault();
    const query = search.trim();
    if (!query) return;

    try {
      setLoading(true);
      setError(null);
      setHasSearched(true);

      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5000/api/posts/search',
        { query },
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
          },
        }
      );

      if (response.status === 200) {
        setPosts(response.data.posts || []);
        setUsersData(response.data.users || []);
      } else {
        throw new Error(response.data.message || 'Failed to fetch search results.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error occurred while searching.');
    } finally {
      setLoading(false);
    }
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
    <div className="np-search-page">
      {/* Search Header and Input */}
      <div className="np-search-bar-wrap">
        <form onSubmit={fetchsearch} style={{ display: 'flex', gap: 'var(--space-2)' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <i
              className="fa-solid fa-magnifying-glass"
              style={{
                position: 'absolute',
                left: 'var(--space-3)',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--color-text-secondary)',
                fontSize: 'var(--font-size-sm)',
              }}
            />
            <input
              type="search"
              className="np-form-input"
              style={{ paddingLeft: 'calc(var(--space-3) * 2 + 14px)' }}
              placeholder="Search posts, hashtags, or users..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button type="submit" disabled={loading || !search.trim()} className="np-btn np-btn-primary">
            {loading ? (
              <div className="np-spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }} />
            ) : (
              'Search'
            )}
          </button>
        </form>

        {/* Filter Pills */}
        <div className="np-search-filter-pills">
          <button
            type="button"
            className={`np-btn np-btn-sm ${category === '' ? 'np-btn-primary' : 'np-btn-outline'}`}
            onClick={() => setCategory('')}
          >
            All Results
          </button>
          <button
            type="button"
            className={`np-btn np-btn-sm ${category === 'videos' ? 'np-btn-primary' : 'np-btn-outline'}`}
            onClick={() => setCategory('videos')}
          >
            <i className="fa-solid fa-film" /> Videos
          </button>
          <button
            type="button"
            className={`np-btn np-btn-sm ${category === 'images' ? 'np-btn-primary' : 'np-btn-outline'}`}
            onClick={() => setCategory('images')}
          >
            <i className="fa-regular fa-images" /> Photos
          </button>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="np-error-state">
          <i className="fa-solid fa-circle-exclamation np-error-state-icon" />
          <p className="np-error-state-title">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="np-loading-state" style={{ minHeight: '200px' }}>
          <div className="np-spinner" />
          <p>Searching Network Plus...</p>
        </div>
      )}

      {/* Not Searched Yet State */}
      {!hasSearched && !loading && (
        <div className="np-empty-state" style={{ minHeight: '260px' }}>
          <i className="fa-solid fa-magnifying-glass np-empty-state-icon" />
          <p className="np-empty-state-title">Explore Network Plus</p>
          <p className="np-empty-state-subtitle">Type a query above to discover creators, posts, and topics.</p>
        </div>
      )}

      {/* Results Section */}
      {hasSearched && !loading && (
        <>
          {/* Matching Users */}
          {usersData.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
              <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
                People ({usersData.length})
              </h3>
              <div className="np-search-users-carousel">
                {usersData.map((user) => (
                  <Link to={`/User/${user._id}`} key={user._id} className="np-user-card">
                    <img
                      src={user.profilePicture || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png'}
                      alt={`${user.username}'s avatar`}
                      className="np-user-card-avatar"
                    />
                    <span className="np-user-card-username">{user.username}</span>
                    <div className="np-user-card-stats">
                      <span>{user.followers?.length || 0} followers</span>
                      <span>{user.following?.length || 0} following</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Matching Posts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <h3 style={{ fontSize: 'var(--font-size-base)', fontWeight: 600, color: 'var(--color-text-primary)' }}>
              Posts ({filteredPosts.length})
            </h3>

            {filteredPosts.length === 0 ? (
              <div className="np-empty-state" style={{ minHeight: '180px' }}>
                <i className="fa-regular fa-folder-open np-empty-state-icon" />
                <p className="np-empty-state-title">No posts found</p>
                <p className="np-empty-state-subtitle">Try adjusting your search terms or filter.</p>
              </div>
            ) : (
              <div className="np-profile-grid">
                {filteredPosts.map((post) => {
                  const isVideo = ['mp4', 'webm', 'mov'].includes(post.picture?.split('.').at(-1)?.toLowerCase());
                  return (
                    <Link
                      to={`/Openpost/${post._id}`}
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
          </div>
        </>
      )}
    </div>
  );
}

export default Sersh;