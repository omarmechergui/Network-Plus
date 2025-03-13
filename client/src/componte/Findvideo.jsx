import React, { useEffect, useState } from 'react'
import Modal from './Modal';


function Findvideo({ video, index, userData, fetchPosts }) {

  const [postStates, setPostStates] = useState({});
  const [like, setLike] = useState(false)
  const [showModal, setShowModal] = useState(false); // State for modal visibility
  const [selectedImage, setSelectedImage] = useState(null); // State for selected post image
  const [commentInputs, setCommentInputs] = useState({});
  const commentInput = commentInputs[video._id] || '';
  const postState = postStates[video._id] || {};
    const [copied, setCopied] = useState(false);
    
  

 // Function to copy the post link to the clipboard
 const handleCopyLink = (id) => {
  navigator.clipboard.writeText(`http://localhost:3000//Openpost/${id}`).then(() => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
  });
};

  // Handle share modal visibility toggle
  const handleShowShareModal = (postId) => {
    setPostStates((prev) => ({
      ...prev,
      [postId]: { ...prev[postId], showShareModal: !prev[postId]?.showShareModal || false },
    }));
  };


  const handlePostClick = (src) => {
    setSelectedImage(src);
    setShowModal(true);
  };

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

  const handleCommentChange = (postId, event) => {
    setCommentInputs((prev) => ({
      ...prev,
      [postId]: event.target.value,
    }));
  };
  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedImage(null);
  };

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
  useEffect(() => {
    fetchPosts()
  }, [like])
  return (
    video.picture.split('.').at(-1) == "mp4" && <div key={index} className="video_card">

      {/* <iframe
      id="iframe_index"
      src={video.src}
      frameBorder={0}
      title={`Video ${index}`}
      allowFullScreen
    /> */}


      <video style={{ width: "100%", height: "100%" }} src={video.picture} controls

        muted ></video>



      {userData &&<span id="span_icons_index" >
        <ul>
          <li>
            <a href={userData?._id !== video?.userId?._id?`/User/${video?.userId?._id}`:"/Profile"} >
              <img
                src={video.userId.profilePicture || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png'}
                alt={`${video?.userId?.username}'s profile`}
              />
            </a>
          </li>
          <li>
            <i className="fa-solid fa-heart" onClick={() => like ? handledisLike(video._id) : handleLike(video._id)} />
            <span>{video.likes.length || 0}</span>
          </li>
          <li>
            <i className="fa-brands fa-signal-messenger" onClick={() => handlePostClick(video.picture)} />
            <span>{video.comments.length || 0}</span>
          </li>
          <li>
            <i className="fa-solid fa-share" onClick={()=>handleShowShareModal(video._id)} />
            <span>{video.shares.length || 0}</span>
          </li>
          
        </ul>
      </span>}
      {/* <div>
        <div style={{ backgroundColor: 'white', padding: '10px', borderRadius: '10px' ,color: "black" }}>
        {video.comments.map((comment, index) => (
          <div style={{display:""}} key={index}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
            <img src={comment.userId.profilePicture || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png'} 
            style={{ width: "40px", height: "40px", borderRadius: "50%" }} alt="" />
            <strong>{comment.userId.username}</strong>
            </div>
            <p>{comment.comments}</p>
          </div>
        ))}

        
        <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Write a comment..."
            value={commentInput}
            // onChange={(e) => handleCommentChange(post._id, e)}
            style={{
              width: '80%',
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
              width: '15%',
            }}
            // onClick={() => handleSubmitComment(post._id)}
          >
            Send Comment
          </button>
        </div>
        </div>

      </div> */}
      <Modal show={showModal} onClose={handleCloseModal}>
        <div
          style={{
            backgroundColor: 'white',
            padding: '10px',
            borderRadius: '10px',
            color: 'black',
            maxWidth: '600px',
            margin: 'auto',
            display: 'flex',
          }}
        >
          {/* Display Comments */}
          {video.comments && video.comments.length > 0 ? (
            video.comments.map((comment, index) => (
              <div
                key={index}
                style={{
                  width: '90%',
                  height: '100px',
                  margin: '10px 0',
                  border: '1px solid #ccc',
                  borderRadius: '5px',
                  padding: '10px',
                  display: 'flex',
                  justifyContent:'start',
                  gap: '10px',
                }}
              >
                {/* Comment Author */}
                <div style={{ display: 'flex',flexDirection:"row", width: '100%',justifyContent:'start', gap: '10px' }}>
                  <img
                    src={comment.userId.profilePicture || 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_640.png'}
                    alt="Profile Picture"
                    style={{ width: '50px', height: '50px', borderRadius: '50%' }}
                  />
                  <strong>{comment.userId.username}</strong>
                </div>

                {/* Comment Text */}
                <p style={{ margin: 0 }}>{comment.text}</p>
              </div>
            ))
          ) : (
            <p style={{ textAlign: 'center', color: '#888' }}>No comments yet.</p>
          )}

          {/* Comment Input Form */}
          <div style={{ marginTop: '10px', width: "100%", display: "flex", gap: "5px", justifyContent: "center",flexDirection:"row" ,alignItems:"end",paddingBottom:"30px"}}>
              <input
                type="text"
                placeholder="Write a comment..."
                value={commentInput}
                onChange={(e) => setCommentInputs((prev) => ({ ...prev, [video._id]: e.target.value }))}
                style={{
                  width: '80%',
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
                  width: '20%',
                  height: '38px'
                }}
                onClick={() => handleSubmitComment(video._id)}
              >
                <i className="fa-solid fa-paper-plane"></i>
              </button>
            </div>
        </div>
      </Modal>

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
              maxWidth: '40%',
              backgroundColor: '#f0f0f0',
              padding: '20px',
              borderRadius: '10px',
              height:"35%",
              boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
            }}
          >
            {/* Header with close button */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                flexDirection: 'row',
                alignItems: 'center',
                marginBottom: '10px',
              }}
            >
              <h3 style={{color:' #000'}}>Share Post</h3>
              <button
                onClick={() => (!handleShowShareModal(video._id))}
                style={{
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                }}
              >
                <i className="fa-solid fa-xmark" style={{ fontSize: '20px' }} />
              </button>
            </div>

            {/* User Avatars
            <div
              style={{
                display: 'flex',
                gap: '10px',
                overflowX: 'auto',
                marginBottom: '10px',
              }}
            >
              {video.interactedUsers?.map((user) => (
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
            </div> */}

            <hr style={{ margin: '10px 0', border: '1px solid #ccc' }} />

            {/* Social Media Sharing */}
            <div
              style={{
                display: 'flex',
                flexDirection:'row',
                gap: '10px',
                padding:'20px',
                overflowX: 'auto',
                marginBottom: '5px',
              }}
            >
              <a
                href={`https://facebook.com/sharer/sharer.php?u=https://example.com/Openpost/${video._id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fa-brands fa-facebook" style={{ fontSize: '20px', color: '#3b5998' }} />
              </a>
              <a
                href={`https://api.whatsapp.com/send?text=Check out this post: https://example.com/post/${video._id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fa-brands fa-whatsapp" style={{ fontSize: '20px', color: '#25D366' }} />
              </a>
              <a
                href={`https://twitter.com/intent/tweet?url=https://example.com/post/${video._id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fa-brands fa-twitter" style={{ fontSize: '20px', color: '#1DA1F2' }} />
              </a>
              <a
                href={`https://www.instagram.com/share?url=https://example.com/post/${video._id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fa-brands fa-instagram" style={{ fontSize: '20px', color: '#E1306C' }} />
              </a>
              <a
                href={`https://www.linkedin.com/shareArticle?url=https://example.com/post/${video._id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fa-brands fa-linkedin" style={{ fontSize: '20px', color: '#0077B5' }} />
              </a>
              <a
                href={`https://www.youtube.com/share?url=https://example.com/post/${video._id}`}
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="fa-brands fa-youtube" style={{ fontSize: '20px', color: '#FF0000' }} />
              </a>
              <a
                href={`https://pinterest.com/pin/create/button/?url=https://example.com/post/${video._id}`}
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
                value={`https://example.com/post/${video._id}`}
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


      <h3 className="video_title">{video.userId.username}</h3>
      <p className="video_description">{video.description}</p>
      <p>{video.createdAt.slice(0, 10)}</p>
    </div>
  )
}

export default Findvideo