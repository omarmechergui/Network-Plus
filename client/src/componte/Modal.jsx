import React from 'react';

function Modal({ show, onClose, children }) {
  // Close modal when clicking outside of the modal content
  const handleModalClick = (e) => {
    // Check if the click happened on the backdrop (not inside modal content)
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div
      style={{
        display: show ? 'block' : 'none', // Show or hide the modal
        position: 'fixed', // Fixed position to cover the whole screen
        top: 1,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
        zIndex: 1000, // Ensure it's on top of other content
      }}
      onClick={handleModalClick} // Close modal if clicking on the backdrop
    >
      <div
        style={{
          position: 'absolute',
          top: '4%',
          left: '25%',
          width: '55%',
          height: '90%',
          backgroundColor: 'transparent',
          display: 'flex',
          alignItems: 'space-between',
          justifyContent: 'center',
          overflow: 'auto',
          borderRadius: '10px', // Optional: border radius for the modal
        }}
      >
        {children}
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            backgroundColor: 'transparent',
            border: 'none',
            fontSize: '20px',
            color: 'black',
            cursor: 'pointer',
          }}
        >
          X
        </button>
      </div>
    </div>
  );
}

export default Modal;
