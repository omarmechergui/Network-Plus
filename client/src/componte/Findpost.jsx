import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Findpost({ post, fetchPosts }) {
const [userData, setUserData] = useState(null);
 const [loading, setLoading] = useState(true); // State for loading indicator
  const [error, setError] = useState(null); // State for error messages
  const [copied, setCopied] = useState(false);
  const [shares, setShares] = useState([]);
  // Function to copy the post link to the clipboard
  const handleCopyLink = (id) => {
    navigator.clipboard.writeText(`http://localhost:3000//Openpost/${id}`).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    });
  };
  const [postStates, setPostStates] = useState({});
  const [commentInputs, setCommentInputs] = useState({});
  const postState = postStates[post._id] || {};
  const commentInput = commentInputs[post._id] || '';
  const [like, setLike] = useState(false)
  
  console.log(postState)
  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/users/getuser', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Replace with actual token logic
        },
      });
      
      const data = await response.json();
      console.log(data);
      if (response.ok) {
        setUserData(data.user);
         
      } else {
        throw new Error(data.message || 'Failed to fetch profile data.');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchPosts();
    

    fetchUserData();
  }, [like, commentInputs])

  const handleFollow = (postId, userId) => {
    setPostStates((prev) => ({
      ...prev,
      [postId]: { ...prev[postId], isFollowing: !prev[postId]?.isFollowing || false },
    }));

    // Update follow status on the backend
    fetch(`http://localhost:5000/api/users/${userId}/follow`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`, // Replace with actual token logic
      },
      body: JSON.stringify({ isFollowing: !postStates[postId]?.isFollowing || false }),
    }).then(res=>fetchUserData()).catch((err) => console.error('Error updating follow status:', err));
  };

  // Handle like/unlike button toggle
  const handledisLike = (postId) => {


    // Update like status on the backend
    const response = fetch(`http://localhost:5000/api/posts/${postId}/dislike`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`, // Replace with actual token logic
      },
    }).then(res => {
      console.log(res)
      setLike(!like)
    }).catch((err) => console.error('Error updating like status:', err));

  };
  const handleLike = (postId) => {


    // Update like status on the backend
    const response = fetch(`http://localhost:5000/api/posts/${postId}/like`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`, // Replace with actual token logic
      },
    }).then(res => {
      setLike(!like)
    }).catch((err) => console.error('Error updating like status:', err));

  };




  // Handle comment visibility toggle
  const handleShowComments = (postId) => {
    setPostStates((prev) => ({
      ...prev,
      [postId]: { ...prev[postId], showComments: !prev[postId]?.showComments || false },
    }));
  };

  // Handle share modal visibility toggle
  const handleShowShareModal = (postId) => {
    setPostStates((prev) => ({
      ...prev,
      [postId]: { ...prev[postId], showShareModal: !prev[postId]?.showShareModal || false },
    }));
  };

  // Handle comment input change
  const handleCommentChange = (postId, event) => {
    setCommentInputs((prev) => ({
      ...prev,
      [postId]: event.target.value,
    }));
  };

  // Handle comment submission
  const handleSubmitComment = async (postId) => {
    const commentText = commentInputs[postId];
    if (!commentText.trim()) return;

    try {
      const response = await fetch(`http://localhost:5000/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`, // Replace with actual token logic
        },
        body: JSON.stringify({ text: commentText }),
      });

      const data = await response.json();
      if (response.ok) {
        // Update the local state with the new comment
        setLike(like)
        setCommentInputs((prev) => ({ ...prev, [postId]: '' }));
      } else {
        throw new Error(data.message || 'Failed to add comment.');
      }
    } catch (err) {
      console.error('Error submitting comment:', err.message);
      alert('Failed to add comment. Please try again.');
    }
  };

  // Handel share button toggle
  const handleSharePost = async (id) => {
    try {
      const token = localStorage.getItem('token'); // Replace with actual token logic
      const response = await fetch(`http://localhost:5000/api/posts/${id}/share`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setShares(data.shares); // Update the local state with the new share count
      } else {
        throw new Error('Failed to share post.');
      }
    } catch (error) {
      console.error('Error sharing post:', error.message);
      alert('Failed to share post. Please try again.');
    }
  };
  
  
  return (

    <div key={post._id}>

      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <a href={userData?._id !== post?.userId?._id?`/User/${post?.userId?._id}`:"/Profile"}>
          <img
            src={post.userId.profilePicture}
            alt={`${post.username}'s profile`}
            id="user"
          />
          <h3 style={{ fontWeight: "bold" }}>{post?.userId?.username}</h3>
        </a>
        {userData && userData?._id !== post?.userId?._id && !userData?.following.includes(post?.userId?._id)  && <button
          style={{
            backgroundColor:  'black',
            color: 'white',
            border: '1px solid black',
            borderRadius: '5px',
            padding: '5px',
            margin: '10px',
            cursor: 'pointer',
            width: '100px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
          onClick={() => handleFollow(post._id, post.userId._id)}
        >
          {postState.isFollowing ? 'Unfollow' : 'Follow'}
        </button>}
      </div>

      {/* <Link to={'/Openpost/' + post._id}> {post.picture && <img src={post.picture} alt="" id="img_post" />}</Link> */}
      <Link to='/Openpost'> {post.text && <p id="text_post">{post.text}</p>}</Link>
      <Link to={'/Openpost/'+ post._id} > {post.picture.split('.').at(-1)=="mp4"? (
        // <iframe
        //   width={560}
        //   height={315}
        //   src={post.picture}
          
        //   frameBorder={0}
        // />
        <video style={{ width: '100%', height: 'auto' }} src={post.picture} controls></video>):(
          <img src={post.picture} id="img_post" alt="" />
        )
      }</Link>
      <p>{post.description}</p>
      <p>Posted on: {post.createdAt.slice(0, 10)}</p>

     {userData && <span>
        <i onClick={() => like ? handledisLike(post._id) : handleLike(post._id)} className="fa-solid fa-heart" />
        <span style={{ marginLeft: '-15%' }}>{post?.likes?.length || 0}</span>
        <i
          className="fa-solid fa-comment"
          onClick={() => handleShowComments(post._id)}
          aria-label="Toggle Comments"
        />
        <span style={{ marginLeft: '-15%' }}>{post.comments?.length || 0}</span>
        <i
          className="fa-solid fa-share-square"
          onClick={() => handleShowShareModal(post._id)} // Call handleSharePost here
          aria-label="Share Post"
        />
        <span style={{ marginLeft: '-15%' }}>{post.shares || 0}</span>
      </span>}

      {/* Show Comments */}
      {postState.showComments && (
        <div>
          {post.comments.map((comment) => (
            <div
              key={comment._id}
              style={{
                display: 'flex',
                gap: '10px',
                alignItems: 'center',
                marginBottom: '10px',
              }}
            >
              <img
                src={comment.userId.profilePicture}
                alt=""
                style={{ width: '50px', height: '50px', borderRadius: '50%' }}
              />
              <p style={{ fontSize: '1rem' }}>
                <strong>{comment.userId.username}:</strong> {comment.text}
              </p>
              <i className="fa-solid fa-heart" />{' '}
              <span>{comment.likes || 0}</span>
            </div>
          ))}

          {/* Comment Input Form */}
          <div style={{ marginTop: '10px' }}>
            <input
              type="text"
              placeholder="Write a comment..."
              value={commentInput}
              onChange={(e) => handleCommentChange(post._id, e)}
              style={{
                width: '100%',
                padding: '10px',
                border: '1px solid #ccc',
                borderRadius: '5px',
                marginBottom: '10px',
              }}
            />
            <button
              style={{
                padding: '10px',
                border: 'none',
                borderRadius: '5px',
                cursor: 'pointer',
                backgroundColor: '#007bff',
                color: 'white',
                width: '100%',
              }}
              onClick={() => handleSubmitComment(post._id)}
            >
              Send Comment
            </button>
          </div>
        </div>
      )}

      {/* Share Modal */}
      {postState.showShareModal && (
        <div
          style={{
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.77)',
            position: 'fixed',
            top: 0,
            left: 0,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        // onClick={() => (!handleShowShareModal(post._id))} 
        >
          <div
            style={{
              width: '500px',
              maxWidth: '90%',
              backgroundColor: '#f0f0f0',
              padding: '20px',
              borderRadius: '10px',
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            }}
          >
            {/* Header with close button */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '10px',
              }}
            >
              <h3>Share Post</h3>
              <button
                onClick={() => (!handleShowShareModal(post._id))}
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                }}
              >
                <i className="fa-solid fa-xmark" style={{ fontSize: '20px' }} />
              </button>
            </div>

            {/* User Avatars */}
            <div
              style={{
                display: 'flex',
                gap: '10px',
                overflowX: 'auto',
                marginBottom: '10px',
              }}
            >
              {post.interactedUsers?.map((user) => (
                <a href={`/user/${user._id}`} key={user._id}>
                  <img
                    src={user.profilePicture || 'https://via.placeholder.com/50'}
                    alt={user.username}
                    style={{
                      width: '50px',
                      height: '50px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                    }}
                  />
                </a>
              ))}
            </div>

            <hr style={{ margin: '10px 0', border: '1px solid #ccc' }} />

            {/* Social Media Sharing */}
            <div
              style={{
                display: 'flex',
                gap: '10px',
                overflowX: 'auto',
                marginBottom: '10px',
              }}
            >
              <a
                href={`https://facebook.com/sharer/sharer.php?u=https://example.com/post/${post._id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fa-brands fa-facebook" style={{ fontSize: '20px', color: '#3b5998' }} />
              </a>
              <a
                href={`https://api.whatsapp.com/send?text=Check? http://localhost:3000/Openpost/${post._id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fa-brands fa-whatsapp" style={{ fontSize: '20px', color: '#25D366' }} />
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=http://localhost:3000/Openpost/${post._id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fa-brands fa-twitter" style={{ fontSize: '20px', color: '#1DA1F2' }} />
              </a>
              <a
                href={`https://www.instagram.com/share?url=http://localhost:3000/Openpost/${post._id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fa-brands fa-instagram" style={{ fontSize: '20px', color: '#E1306C' }} />
              </a>
              <a
                href={`https://www.linkedin.com/shareArticle?url=http://localhost:3000/Openpost/${post._id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fa-brands fa-linkedin" style={{ fontSize: '20px', color: '#0077B5' }} />
              </a>
              <a
                href={`https://www.youtube.com/share?url=http://localhost:3000/Openpost/${post._id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fa-brands fa-youtube" style={{ fontSize: '20px', color: '#FF0000' }} />
              </a>
              <a
                href={`https://pinterest.com/pin/create/button/?url=http://localhost:3000/Openpost${post._id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fa-brands fa-pinterest" style={{ fontSize: '20px', color: '#BD081C' }} />
              </a>
            </div>

            <hr style={{ margin: '10px 0', border: '1px solid #ccc' }} />

            {/* Copy Link Section */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '10px',
              }}
            >
              <input
                type="text"
                value={`https://example.com/post/${post._id}`}
                readOnly
                style={{
                  flex: 1,
                  padding: '8px',
                  border: '1px solid #ccc',
                  borderRadius: '5px',
                }}
              />
              <button
                onClick={handleCopyLink}
                style={{
                  padding: '8px 16px',
                  backgroundColor: copied ? '#28a745' : '#007bff',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                }}
              >
                {copied ? 'Copied!' : 'Copy Link'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Findpost;