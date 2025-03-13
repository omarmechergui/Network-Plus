import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Editprofile() {
  const [userData, setUserData] = useState(null); // State for user profile data
  const [username, setUsername] = useState(''); // State for username input
  const [bio, setBio] = useState(''); // State for bio input
  const [bioLink, setBioLink] = useState(''); // State for bio link input
  const [profilePicture, setProfilePicture] = useState(null); // State for profile picture file
  const [loading, setLoading] = useState(true); // State for loading indicator
  const [error, setError] = useState(null); // State for error messages
  const [successMessage, setSuccessMessage] = useState(''); // State for success message
console.log(username)
  // Fetch user data when the component mounts
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/users/getuser', {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`, // Replace with actual token logic
          },
        });

        const data = await response.json();
        if (response.ok) {
          setUserData(data.user);
          setUsername(data.user.username || '');
          setBio(data.user.bio || '');
          setBioLink(data.user.bioLink || '');
          setProfilePicture(data.user.profilePicture); // Reset profile picture state
        } else {
          throw new Error(data.message || 'Failed to fetch profile data.');
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim()) {
      setError('Username cannot be empty.');
      return;
    }
    try {
     
      const response = await axios.put('http://localhost:5000/api/users/updateprofile', {username, bio, bioLink, profilePicture}, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        
        },
      });
      console.log(response.data);
      if (response.data.success) {
        setSuccessMessage('Profile updated successfully!');
        setError(null); // Clear any previous errors
      } else {
        throw new Error(response.data.message || 'Failed to update profile.');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  // Handle profile picture change
  const handleProfilePictureChange = async(e) => {
    const file = e.target.files[0];
    if (file) {
      setLoading(true)
       // Generate a preview URL for the selected media with cloudinary
       const formData = new FormData()
       formData.append('file', file)
       formData.append('upload_preset', 'ml_default')
       const res = await axios.post('https://api.cloudinary.com/v1_1/ddedv1njr/upload', formData)
 
       console.log(res)
       setProfilePicture(res.data.secure_url);
       setLoading(false)
       
      
    }
  };

  return (
    <div
      style={{
        maxWidth: '600px',
        margin: '50px auto',
        padding: '20px',
        backgroundColor: '#f9f9f9',
        border: '1px solid #ddd',
        borderRadius: '8px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}
    >
      {/* Loading Indicator */}
      {loading && (
        <p
          style={{
            textAlign: 'center',
            fontSize: '18px',
            color: '#555',
            margin: '20px 0',
          }}
        >
          Loading profile...
        </p>
      )}
      {/* Error Message */}
      {error && (
        <p
          style={{
            textAlign: 'center',
            color: 'red',
            fontSize: '16px',
            margin: '10px 0',
          }}
        >
          {error}
        </p>
      )}
      {/* Success Message */}
      {successMessage && (
        <p
          style={{
            textAlign: 'center',
            color: 'green',
            fontSize: '16px',
            margin: '10px 0',
          }}
        >
          {successMessage}
        </p>
      )}
      {/* Edit Profile Form */}
      {userData ? (
        <form
          onSubmit={handleSubmit}
          style={{
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <h2
            style={{
              fontSize: '24px',
              marginBottom: '20px',
              color: '#333',
              textAlign: 'center',
            }}
          >
            Edit Profile
          </h2>
          {/* Username Input */}
          <label
            style={{
              marginBottom: '15px',
              fontWeight: 'bold',
              color: '#555',
            }}
          >
            Username:
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Enter your username"
              style={{
                width: '100%',
                padding: '10px',
                marginTop: '5px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '16px',
              }}
            />
          </label>
          {/* Bio Input */}
          <label
            style={{
              marginBottom: '15px',
              fontWeight: 'bold',
              color: '#555',
            }}
          >
            Bio:
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself"
              style={{
                width: '100%',
                padding: '10px',
                marginTop: '5px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '16px',
                resize: 'vertical',
                minHeight: '100px',
              }}
            />
          </label>
          {/* Bio Link Input */}
          <label
            style={{
              marginBottom: '15px',
              fontWeight: 'bold',
              color: '#555',
            }}
          >
            Bio Link:
            <input
              type="url"
              value={bioLink}
              onChange={(e) => setBioLink(e.target.value)}
              placeholder="Enter a link to your website or social media"
              style={{
                width: '100%',
                padding: '10px',
                marginTop: '5px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '16px',
              }}
            />
          </label>
          {/* Profile Picture Upload */}
          <label
            style={{
              marginBottom: '15px',
              fontWeight: 'bold',
              color: '#555',
            }}
          >
            Profile Picture:
            <input
              type="file"
              accept="image/*"
              onChange={handleProfilePictureChange}
              style={{
                width: '100%',
                padding: '10px',
                marginTop: '5px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                fontSize: '16px',
              }}
            />
          </label>
          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '16px',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease',
              ...(successMessage && { backgroundColor: '#0056b3' }),
            }}
          >
            Save Changes
          </button>
        </form>
      ) : (
        <p
          style={{
            textAlign: 'center',
            fontSize: '18px',
            color: '#555',
            margin: '20px 0',
          }}
        >
          Loading user data...
        </p>
      )}
    </div>
  );
}

export default Editprofile;