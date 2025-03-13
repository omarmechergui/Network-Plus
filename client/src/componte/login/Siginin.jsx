import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Siginin() {
  const navigate = useNavigate();

  // State for form inputs
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    Birthday: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  // State for error and success messages
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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

      // Send registration request to the backend
      const response = await fetch('http://192.168.1.92:5000/api/users/validate_email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: `${formData.firstname} ${formData.lastname}`,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // Successful registration
        setSuccessMessage('Registration successful! Please verify your email.');
        // setTimeout(() => {
        //   navigate('/Sigin_in_verif_email', { replace: true }); // Redirect to email verification page
        // }, 2000);
      } else {
        // Failed registration
        setErrorMessage(data.message || 'An error occurred during registration.');
      }
    } catch (error) {
      console.error('Error during registration:', error);
      setErrorMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div id="body_sing_up" >
      <section>
        <form onSubmit={handleSubmit}>
          <fieldset>
            <legend>Sign Up</legend>
            <label htmlFor="firstname">First Name:</label>
            <input
              type="text"
              id="firstname"
              name="firstname"
              required
              value={formData.firstname}
              onChange={handleChange}
            />
            <label htmlFor="lastname">Last Name:</label>
            <input
              type="text"
              id="lastname"
              name="lastname"
              required
              value={formData.lastname}
              onChange={handleChange}
            />
            <label htmlFor="Birthday">Birthday:</label>
            <input
              type="date"
              id="Birthday"
              name="Birthday"
              value={formData.Birthday}
              onChange={handleChange}
            />
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
            />
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
            <p className="error-message">{errorMessage && <span>{errorMessage}</span>}</p>
            <p className="success-message">{successMessage && <span>{successMessage}</span>}</p>
          </fieldset>
        </form>
      </section>
    </div>
  );
}

export default Siginin;