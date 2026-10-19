import React, { useEffect, useState, useRef } from "react";
import { Link } from "react-router-dom";

function Findpost({ post, fetchPosts, userData: userDataProp }) {
  const [localUserData, setLocalUserData] = useState(null);
  const [copied, setCopied] = useState(false);
  const [postStates, setPostStates] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const [like, setLike] = useState(false);
  const isInitialMount = useRef(true);

  // Use prop userData if available, otherwise fall back to locally fetched data
  const userData = userDataProp || localUserData;

  const postState = postStates[post._id] || {};
  const commentInput = commentInputs[post._id] || '';

  // Function to copy the post link to the clipboard
  const handleCopyLink = () => {
    navigator.clipboard.writeText(`${window.location.origin}/Openpost/${post._id}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
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
        setLocalUserData(data.user);
      }
    } catch (err) {
      console.error('Error fetching user data:', err.message);
    }
  };

  // Only fetch user data locally if not provided via prop (runs once)
  useEffect(() => {
    if (!userDataProp) {
      fetchUserData();
    }
  }, [userDataProp]); // eslint-disable-line react-hooks/exhaustive-deps

  // Refresh post list after a like/dislike/comment interaction (skip initial mount)
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    if (fetchPosts) {
      fetchPosts();
    }
  }, [like]); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFollow = (postId, userId) => {
    setPostStates((prev) => ({
      ...prev,
      [postId]: { ...prev[postId], isFollowing: !prev[postId]?.isFollowing || false },
    }));

    fetch(`http://localhost:5000/api/users/${userId}/follow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
      body: JSON.stringify({ isFollowing: !postStates[postId]?.isFollowing || false }),
    })
      .then(() => fetchUserData())
      .catch((err) => console.error('Error updating follow status:', err));
  };

  const handledisLike = (postId) => {
    fetch(`http://localhost:5000/api/posts/${postId}/dislike`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then(() => {
        setLike(!like);
      })
      .catch((err) => console.error('Error updating like status:', err));
  };

  const handleLike = (postId) => {
    fetch(`http://localhost:5000/api/posts/${postId}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    })
      .then(() => {
        setLike(!like);
      })
      .catch((err) => console.error('Error updating like status:', err));
  };

  const handleShowComments = (postId) => {
    setPostStates((prev) => ({
      ...prev,
      [postId]: { ...prev[postId], showComments: !prev[postId]?.showComments || false },
    }));
  };

  const handleShowShareModal = (postId) => {
    setPostStates((prev) => ({
      ...prev,
      [postId]: { ...prev[postId], showShareModal: !prev[postId]?.showShareModal || false },
    }));
  };

  const handleCommentChange = (postId, event) => {
    setCommentInputs((prev) => ({
      ...prev,
      [postId]: event.target.value,
    }));
  };

  const handleSubmitComment = async (postId) => {
    const commentText = commentInputs[postId];
    if (!commentText || !commentText.trim()) return;

    try {
      const response = await fetch(`http://localhost:5000/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ text: commentText }),
      });

      const data = await response.json();
      if (response.ok) {
        setLike(!like);
        setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
      } else {
        throw new Error(data.message || 'Failed to add comment.');
      }
    } catch (err) {
      console.error('Error submitting comment:', err.message);
      alert('Failed to add comment. Please try again.');
    }
  };

  const isLikedByCurrentUser =
    Boolean(userData && post?.likes?.some((l) => (typeof l === 'object' ? l._id === userData._id : l === userData._id)));
  const isVideo = post.picture && post.picture.split('.').at(-1) === 'mp4';
  const postUrl = `${window.location.origin}/Openpost/${post._id}`;
  const authorProfileLink = userData?._id !== post?.userId?._id ? `/User/${post?.userId?._id}` : '/Profile';

  return (
    <article key={post._id} className="np-post-card" id={`post-${post._id}`}>
      {/* Post Author Header */}
      <header className="np-post-header">
        <Link to={authorProfileLink} className="np-post-author">
          <img
            src={post.userId?.profilePicture || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png'}
            alt={`${post.userId?.username || 'User'}'s avatar`}
            className="np-post-avatar"
            onError={(e) => {
              e.target.src = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png';
            }}
          />
          <div className="np-post-author-meta">
            <span className="np-post-author-name">{post.userId?.username || 'Anonymous'}</span>
            <span className="np-post-timestamp">
              {post.createdAt ? new Date(post.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : ''}
            </span>
          </div>
        </Link>

        {userData && userData._id !== post?.userId?._id && (
          <button
            type="button"
            className={`np-btn-follow ${postState.isFollowing || userData.following?.includes(post?.userId?._id) ? 'following' : ''}`}
            onClick={() => handleFollow(post._id, post.userId._id)}
          >
            {postState.isFollowing || userData.following?.includes(post?.userId?._id) ? 'Following' : 'Follow'}
          </button>
        )}
      </header>

      {/* Post Text Caption */}
      {post.text && (
        <Link to={`/Openpost/${post._id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <p className="np-post-content" style={{ fontWeight: 500 }}>
            {post.text}
          </p>
        </Link>
      )}

      {/* Post Media (Image or Video) */}
      {post.picture && (
        <div className="np-post-media-container">
          {isVideo ? (
            <video
              className="np-post-media"
              src={post.picture}
              controls
              playsInline
            />
          ) : (
            <Link to={`/Openpost/${post._id}`} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
              <img
                src={post.picture}
                alt={post.description || 'Post media'}
                className="np-post-media"
                loading="lazy"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </Link>
          )}
        </div>
      )}

      {/* Post Description & Hashtags */}
      {post.description && <p className="np-post-description">{post.description}</p>}

      {post.tags && post.tags.length > 0 && (
        <div className="np-post-tags">
          {post.tags.map((tag, idx) => (
            <Link key={idx} to={`/Search`} className="np-post-tag">
              #{tag.replace(/^#/, '')}
            </Link>
          ))}
        </div>
      )}

      {/* Interactive Actions Toolbar */}
      {userData && (
        <div className="np-post-actions">
          <button
            type="button"
            className={`np-action-btn ${isLikedByCurrentUser ? 'liked' : ''}`}
            onClick={() => (isLikedByCurrentUser ? handledisLike(post._id) : handleLike(post._id))}
            aria-label={isLikedByCurrentUser ? 'Unlike post' : 'Like post'}
          >
            <i className={isLikedByCurrentUser ? 'fa-solid fa-heart' : 'fa-regular fa-heart'} />
            <span className="np-action-count">{post?.likes?.length || 0}</span>
            <span>Like</span>
          </button>

          <button
            type="button"
            className="np-action-btn"
            onClick={() => handleShowComments(post._id)}
            aria-label="Toggle comments"
          >
            <i className="fa-regular fa-comment" />
            <span className="np-action-count">{post?.comments?.length || 0}</span>
            <span>Comment</span>
          </button>

          <button
            type="button"
            className="np-action-btn"
            onClick={() => handleShowShareModal(post._id)}
            aria-label="Share post"
          >
            <i className="fa-regular fa-share-from-square" />
            <span className="np-action-count">{post?.shares || 0}</span>
            <span>Share</span>
          </button>
        </div>
      )}

      {/* Comments Section */}
      {postState.showComments && (
        <section className="np-comments-section" aria-label="Post comments">
          {post.comments && post.comments.length > 0 ? (
            post.comments.map((comment, index) => (
              <div key={comment._id || index} className="np-comment-item">
                <img
                  src={comment.userId?.profilePicture || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png'}
                  alt={`${comment.userId?.username || 'User'}'s avatar`}
                  className="np-comment-avatar"
                  onError={(e) => {
                    e.target.src = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png';
                  }}
                />
                <div className="np-comment-bubble">
                  <div className="np-comment-author">{comment.userId?.username || 'User'}</div>
                  <p className="np-comment-text">{comment.text}</p>
                </div>
              </div>
            ))
          ) : (
            <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', margin: 'var(--space-2) 0' }}>
              No comments yet. Be the first to comment!
            </p>
          )}

          {/* Comment Input Form */}
          <form
            className="np-comment-input-form"
            onSubmit={(e) => {
              e.preventDefault();
              handleSubmitComment(post._id);
            }}
          >
            <input
              type="text"
              placeholder="Write a comment..."
              className="np-comment-input"
              value={commentInput}
              onChange={(e) => handleCommentChange(post._id, e)}
              aria-label="Write a comment"
            />
            <button
              type="submit"
              className="np-comment-submit"
              disabled={!commentInput.trim()}
            >
              Post
            </button>
          </form>
        </section>
      )}

      {/* Share Modal Dialog */}
      {postState.showShareModal && (
        <div
          className="np-modal-backdrop"
          onClick={() => handleShowShareModal(post._id)}
          role="dialog"
          aria-modal="true"
          aria-label="Share Post Dialog"
        >
          <div
            className="np-share-card"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="np-share-header">
              <h3>Share Post</h3>
              <button
                type="button"
                className="btn-ghost"
                onClick={() => handleShowShareModal(post._id)}
                aria-label="Close dialog"
              >
                <i className="fa-solid fa-xmark" style={{ fontSize: '18px' }} />
              </button>
            </div>

            {/* Social Share Grid */}
            <div className="np-social-grid">
              <a
                href={`https://facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="np-social-btn"
              >
                <i className="fa-brands fa-facebook" style={{ color: '#1877F2' }} />
                <span>Facebook</span>
              </a>
              <a
                href={`https://api.whatsapp.com/send?text=${encodeURIComponent(`Check out this post: ${postUrl}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="np-social-btn"
              >
                <i className="fa-brands fa-whatsapp" style={{ color: '#25D366' }} />
                <span>WhatsApp</span>
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(postUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="np-social-btn"
              >
                <i className="fa-brands fa-x-twitter" style={{ color: '#111111' }} />
                <span>X / Twitter</span>
              </a>
              <a
                href={`https://www.linkedin.com/shareArticle?url=${encodeURIComponent(postUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="np-social-btn"
              >
                <i className="fa-brands fa-linkedin" style={{ color: '#0A66C2' }} />
                <span>LinkedIn</span>
              </a>
              <a
                href={`https://pinterest.com/pin/create/button/?url=${encodeURIComponent(postUrl)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="np-social-btn"
              >
                <i className="fa-brands fa-pinterest" style={{ color: '#BD081C' }} />
                <span>Pinterest</span>
              </a>
              <a
                href={`mailto:?subject=Network-Plus%20Post&body=${encodeURIComponent(postUrl)}`}
                className="np-social-btn"
              >
                <i className="fa-regular fa-envelope" style={{ color: 'var(--text-main)' }} />
                <span>Email</span>
              </a>
            </div>

            {/* Copy Link Row */}
            <div className="np-copy-row">
              <input
                type="text"
                readOnly
                value={postUrl}
                className="np-copy-input"
                aria-label="Post URL"
              />
              <button
                type="button"
                className="btn-primary"
                onClick={handleCopyLink}
                style={{ minWidth: '100px' }}
              >
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
}

export default Findpost;