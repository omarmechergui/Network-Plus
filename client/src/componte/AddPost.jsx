import React, { useState } from 'react';
import axios from 'axios'; // Make sure to install axios: npm install axios

const AddPost = () => {
  const [caption, setCaption] = useState(''); // State for the post caption
  const [tags, setTags] = useState(''); // State for the post tags (comma-separated)
  const [media, setMedia] = useState(null); // State for the uploaded media (image or video)
  const [isVideo, setIsVideo] = useState(false); // State to track if the uploaded media is a video
  const [previewUrl, setPreviewUrl] = useState(''); // State for media preview
  const [loading, setLoading] = useState(false); // State for loading indicator
  const [error, setError] = useState(null); // State for error handling
  const [success, setSuccess] = useState(false); // State for success message

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    if (!caption.trim() || !media) {
      return setError('Caption and media are required.');
    }

    try {
      setLoading(true); // Set loading state to true
      setError(null); // Clear any previous errors

      const formData = new FormData(); // Create a FormData object for file upload
      formData.append('description', caption);
      formData.append('tags', tags.split(',').map((tag) => tag.trim())); // Split tags into an array
      formData.append('media', media); // Append the media file
      formData.append('isVideo', isVideo); // Indicate if the media is a video
      formData.append('userId', localStorage.getItem('userId')); // Assuming user ID is stored in local storage

      // Send the post data to the server
      const response = await axios.post('http://localhost:5000/api/posts/add', {description:caption, tags:tags.split(' '), picture:previewUrl}, {
        headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`, // Replace with actual token logic
          }, // Specify content type for file upload
      });
      console.log(response);
      if (response.status==201) {
        setSuccess(true); // Set success state to true
        setCaption(''); // Clear the caption input
        setTags(''); // Clear the tags input
        setMedia(null); // Clear the media file
        setIsVideo(false); // Reset media type
        setPreviewUrl(''); // Clear the preview
      } else {
        setError('Failed to add the post. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError('An error occurred while adding the post.');
    } finally {
      setLoading(false); // Reset loading state
    }
  };
console.log(media)
  // Function to handle media file selection
  const handleMediaChange = async (e) => {
    setLoading(true)
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setMedia(selectedFile);
      setIsVideo(selectedFile.type.startsWith('video/')); // Check if the file is a video
      setError(null); // Clear any previous errors

      // Generate a preview URL for the selected media with cloudinary
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('upload_preset', 'ml_default')
      const res = await axios.post('https://api.cloudinary.com/v1_1/ddedv1njr/upload', formData)

      console.log(res)
      
      setPreviewUrl(res.data.secure_url);
      setLoading(false)
    } else {
      setError('Please select a valid media file.');
      setPreviewUrl(''); // Clear the preview if no file is selected
    }
  };

  return (
    <div
      style={{
        maxWidth: '600px',
        margin: '0 auto',
        padding: '20px',
        backgroundColor: '#f9f9f9',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}
    >
      <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>Add New Post (Reel or Image)</h2>
      {success && (
        <p style={{ color: 'green', fontWeight: 'bold', marginBottom: '10px' }}>Post added successfully!</p>
      )}
      {error && <p style={{ color: 'red', fontWeight: 'bold', marginBottom: '10px' }}>{error}</p>}

      <form
        onSubmit={handleSubmit}
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '15px',
        }}
      >
        {/* Caption Input */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label htmlFor="caption" style={{ fontWeight: 'bold', marginBottom: '5px' }}>
            Caption:
          </label>
          <input
            type="text"
            id="caption"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Enter post caption"
            required
            style={{
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '14px',
            }}
          />
        </div>

        {/* Tags Input */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label htmlFor="tags" style={{ fontWeight: 'bold', marginBottom: '5px' }}>
            Tags:
          </label>
          <input
            type="text"
            id="tags"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="Enter tags (comma-separated)"
            style={{
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '14px',
            }}
          />
        </div>

        {/* Media Upload */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label htmlFor="media" style={{ fontWeight: 'bold', marginBottom: '5px' }}>
            Upload Media (Image or Video):
          </label>
          <input
            type="file"
            id="media"
            accept="image/*,video/*" // Accept both images and videos
            onChange={handleMediaChange}
            required
            style={{
              padding: '10px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              fontSize: '14px',
            }}
          />
          {media && (
            <p style={{ marginTop: '5px', fontWeight: 'bold' }}>
              Selected{' '}
              {isVideo ? 'Video' : 'Image'}: {media.name}
            </p>
          )}
        </div>

        {/* Media Preview */}
        {previewUrl && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              marginBottom: '15px',
            }}
          >
            {isVideo ? (
              <video
                src={previewUrl}
                controls
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: '8px',
                }}
              />
            ) : (
              <img
                src={previewUrl}
                alt="Preview"
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: '8px',
                }}
              />
            )}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          style={{
            padding: '10px',
            backgroundColor: '#007bff',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            opacity: loading ? 0.6 : 1,
            pointerEvents: loading ? 'none' : 'auto',
          }}
        >
          {loading ? 'Uploading...' : 'Upload Post'}
        </button>
      </form>
    </div>
  );
};

export default AddPost;