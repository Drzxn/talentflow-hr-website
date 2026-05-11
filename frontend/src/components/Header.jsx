import { useState } from "react";
import { NOTIFS } from "../data/dummyData";

export default function Header({ user, onLogout }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);

  return (
    <header className="header">
      <div className="search-wrap">
        <span className="search-icon">⌕</span>
        <input type="text" placeholder="Search users, positions…" />
      </div>

      <div className="header-right">
        <div className="dropdown-wrap">
          <button
            className="notif-btn"
            onClick={() => {
              setNotifOpen(!notifOpen);
              setProfileOpen(false);
            }}
          >
            🔔
            <span className="notif-dot"></span>
          </button>

          {notifOpen && (
            <div className="notif-panel">
              <h4>Notifications</h4>
              {NOTIFS.map((item, index) => (
                <div className="notif-item" key={index}>
                  <strong>
                    <span className="notif-dot-inline"></span>
                    {item.title}
                  </strong>
                  <span>{item.time}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div
          className="profile-btn"
          onClick={() => {
            setProfileOpen(!profileOpen);
            setNotifOpen(false);
          }}
        >
          <div className="avatar">{user.initials}</div>
          <span className="profile-name">{user.name.split(" ")[0]}</span>
          <span className="arrow">▾</span>

          {profileOpen && (
            <div className="profile-dropdown">
              <h4>{user.name}</h4>
              <p>{user.email}</p>
              <hr />
              <div className="dropdown-item">⚙ Settings</div>
              <div className="dropdown-item logout" onClick={onLogout}>
                ↪ Logout
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
