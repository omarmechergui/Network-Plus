import React from 'react'

function Sigin_in_verif_email() {
  return (
    <div>
        <div style={{ backgroundColor: "#d1d1d1", width: "99%" }}>
  <form id="form_verif_emil" action="">
    <p>
      Hi <span id="username">username</span>,
    </p>
    <p>
      Thanks for signing up for Network Plus! To complete your registration,
      please verify your email address by clicking the link below:
    </p>
    <input type="submit" defaultValue="Verify Your Email" />
    <p>If you didn't request this email, please ignore it.</p>
    <p>Best regards,</p>
    <p style={{ textAlign: "end" }}>Network Plus</p>
  </form>
</div>

    </div>
  )
}

export default Sigin_in_verif_email