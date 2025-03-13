import React, { useState } from 'react';

const Settings = () => {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        lastPassword: '',
        newPassword: '',
        confirmNewPassword: '',
        notifications: false,
        theme: 'light',
        language: 'en',
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSave = () => {
        // Save settings logic
        console.log('Settings saved:', formData);
    };

    const toggleNotifications = () => {
        setFormData(prevState => ({
            ...prevState,
            notifications: !prevState.notifications
        }));
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '93vh', width: '100%', background: '#f0f0f0',overflowY: 'auto',overflowX: 'hidden' }}>
        <div className="settings-container" style={{ padding: '20px', maxWidth: '700px', margin: '0 auto'  }}>
            <h2 style={{ textAlign: 'center' }}>Settings</h2>

            {['username', 'email'].map(field => (
                <div className="settings-item" style={{ marginBottom: '15px' }} key={field}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>{field.charAt(0).toUpperCase() + field.slice(1)}:</label>
                    <input 
                        type={field === 'email' ? 'email' : 'text'}
                        name={field}
                        value={formData[field]} 
                        onChange={handleChange} 
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>
            ))}

            {['lastPassword', 'newPassword', 'confirmNewPassword'].map(field => (
                <div className="settings-item" style={{ marginBottom: '15px' }} key={field}>
                    <label style={{ display: 'block', marginBottom: '5px' }}>{
                        field.split(/(?=[A-Z])/).join(' ')
                    }:</label>
                    <input 
                        type="password" 
                        name={field}
                        value={formData[field]} 
                        onChange={handleChange} 
                        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                    />
                </div>
            ))}

            <div className="settings-item" style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Notifications:</label>
                <button 
                    onClick={toggleNotifications} 
                    style={{ cursor: 'pointer', padding: '8px', fontSize: '16px' }}
                >
                    {formData.notifications ? 'Disable Notifications' : 'Enable Notifications'}
                </button>
            </div>

            <div className="settings-item" style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Theme:</label>
                <select 
                    name="theme"
                    value={formData.theme} 
                    onChange={handleChange} 
                    style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                >
                    <option value="light">Light</option>
                    <option value="dark">Dark</option>
                </select>
            </div>

            <div className="settings-item" style={{ marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '5px' }}>Language:</label>
                <select 
                    name="language"
                    value={formData.language} 
                    onChange={handleChange} 
                    style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                >
                    <option value="en">English</option>
                    <option value="es">Spanish</option>
                    <option value="fr">French</option>
                    <option value="de">German</option>
                </select>
            </div>

            <button 
                onClick={handleSave} 
                style={{ width: '100%', padding: '10px', backgroundColor: '#007BFF', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
            >
                Save
            </button>
        </div>
        </div>
    );
};

export default Settings;
