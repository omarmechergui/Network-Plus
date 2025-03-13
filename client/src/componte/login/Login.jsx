import React, { useState } from 'react';

function Login() {
  const [email, setEmail] = useState(''); // State for email input
  const [password, setPassword] = useState(''); // State for password input
  const [errorMessage, setErrorMessage] = useState(''); // State for error messages
  const [successMessage, setSuccessMessage] = useState(''); // State for success messages

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior

    try {
      // Clear previous messages
      setErrorMessage('');
      setSuccessMessage('');

      // Send login request to the backend
      const response = await fetch('http://192.168.1.112:5000/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Successful login
        setSuccessMessage('Login successful!');
        localStorage.setItem('token', data.token); // Store JWT token in local storage
        setTimeout(() => {
          window.location.href = '/'; // Redirect to home page after 2 seconds
        }, 2000);
      } else {
        // Failed login
        setErrorMessage(data.message || 'Invalid email or password');
      }
    } catch (error) {
      console.error('Error during login:', error);
      setErrorMessage('An error occurred. Please try again.');
    }
  };

  return (
    <div id="body_log_in">
      <header>
        <h1 id="network">Network</h1>
        <h2 id="plus">Plus</h2>
      </header>
      <section>
        <form onSubmit={handleSubmit}>
          <fieldset>
            <legend>Login</legend>
            <label htmlFor="email">Email:</label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              name="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <p className="remember-me">
              <input type="checkbox" id="remember-me" name="remember-me" />
              <label htmlFor="remember-me">Remember me</label>
            </p>
            <input type="submit" defaultValue="Login" />
            <br />
            <a href="/Forgrt_password" id="forgot_password">
              Forgot Password?
            </a>
            <p className="error-message">{errorMessage && <span>{errorMessage}</span>}</p>
            <p className="success-message">{successMessage && <span>{successMessage}</span>}</p>
            <hr />
            <legend>Login with social accounts</legend>
            <div>
              <a href="">
                <i className="fa-brands fa-google" />
              </a>
              <a href="">
                <i className="fa-brands fa-github" />
              </a>
              <a href="">
                <i className="fa-brands fa-facebook" />
              </a>
            </div>
            <hr />
            <p>
              Don't have an account?{' '}
              <a href="/Siginin" id="singup">
                Sign up
              </a>
            </p>
          </fieldset>
        </form>
      </section>
    </div>
  );
}

export default Login;