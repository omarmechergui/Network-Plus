import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function New_password() {
  const navigate = useNavigate();

  // State for form inputs
  const [formData, setFormData] = useState({
    password: '',
    confirmPassword: '',
  });

  // State for error and success messages
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Get the reset token from the URL query parameters
  const queryParams = new URLSearchParams(window.location.search);
  const resetToken = queryParams.get('token');

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    try {
      // Clear previous messages
      setErrorMessage('');
      setSuccessMessage('');

      // Validate password match
      if (formData.password !== formData.confirmPassword) {
        return setErrorMessage('Passwords do not match');
      }

      if (!resetToken) {
        return setErrorMessage('Reset token is missing.');
      }

      // Send password reset request to the backend
      const response = await fetch(`http://192.168.1.92:5000/api/users/reset-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          token: resetToken,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Successful password reset
        setSuccessMessage('Password reset successfully! You can now log in.');
        setTimeout(() => {
          navigate('/Login', { replace: true }); // Redirect to login page after 2 seconds
        }, 2000);
      } else {
        // Failed password reset
        setErrorMessage(data.message || 'An error occurred during password reset.');
      }
    } catch (error) {
      console.error('Error during password reset:', error);
      setErrorMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div id="body_forget_password">
      <form id="form_forget_password" onSubmit={handleSubmit}>
        <fieldset>
          <legend style={{ textAlign: 'center', fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', marginTop: '20px', }}>Set New Password</legend>
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            name="password"
            required
            value={formData.password}
            onChange={handleChange}
          />
          <label htmlFor="confirmPassword">Confirm Password:</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            required
            value={formData.confirmPassword}
            onChange={handleChange}
          />
          <input type="submit" defaultValue="Submit" />
        </fieldset>

        {/* Error Message */}
        {errorMessage && <p className="error-message" style={{ color: 'red' }}>{errorMessage}</p>}

        {/* Success Message */}
        {successMessage && <p className="success-message" style={{ color: 'green' }}>{successMessage}</p>}
      </form>
    </div>
  );
}

export default New_password;