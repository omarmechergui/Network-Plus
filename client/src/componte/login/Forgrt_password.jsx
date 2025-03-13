import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Forget_password() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email) {
      setError('Please enter a valid email address.');
      return;
    }

    console.log(`Email submitted: ${email}`);

    navigate('/New_password', { replace: true });
  };

  const handleEmailChange = (e) => {
    setEmail(e.target.value);
    setError(null);
  };

  return (
    <div id="body_forget_password">
      <form id="form_forget_password" onSubmit={handleSubmit}>
        <label htmlFor="email">Email</label>
        <input 
          type="email" 
          id="email" 
          name="email" 
          required 
          placeholder="Enter your email" 
          value={email} 
          onChange={handleEmailChange} 
        />
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <input type="submit" defaultValue="submit" />
      </form>
    </div>
  );
}

export default Forget_password