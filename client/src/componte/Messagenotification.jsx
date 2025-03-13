import React, { useState } from 'react'
import Message from './Message'
import { Outlet, Link, useLocation } from 'react-router-dom'

function Messagenotification() {
  const [issound, setIsound] = useState(false)

  const location = useLocation()

  const handleSound = () => {
    setIsound(!issound)
  }

  return (
    <div id="body_msg_notification">

      <header id="header_msg_notification">
        <div>
          <Link to="/Index">
            <i className="fa-solid fa-arrow-left" />
          </Link>
          <span>
            <h1 id="network">
              Network <span id="plus">Plus</span>
            </h1>
          </span>
          <Link to="" onClick={handleSound}>
            {issound ? (
              <i id="mode_sound_msg_notification" className="fa-solid fa-bell-slash" />
            ) : (
              <i id="mode_sound_msg_notification" className="fa-solid far fa-bell" />
            )}
          </Link>
        </div>
      </header>
      <section id="section1_msg_notification">
        <div>
          <button>
            <Link to="/Message">
              <h2>Message</h2>
            </Link>
          </button>
          <button>
            <Link to="/Message/Notification">
              <h2>Notification</h2>
            </Link>
          </button>
        </div>
      </section>
      <hr id="hr_msg_notification" />
      <section id="section2_msg_notification">
        <Outlet>

        </Outlet>
      </section>

    </div>
  )
}

export default Messagenotification