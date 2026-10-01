import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Profile.css";

export default function Profile() {
  const [user, setUser] = useState({ name: "Loading...", email: "loading...", id: "" });
  const navigate = useNavigate();

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }
      
      const res = await fetch("http://localhost:8000/api/auth/me", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (res.ok) {
        const data = await res.json();
        setUser(data);
      } else {
        // Token might be invalid or expired
        navigate("/login");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="profile-container">
      <div className="profile-wrapper">
        <Link to="/dashboard" className="back-button">← Back to Dashboard</Link>
        
        <div className="profile-avatar-large">
          {user.name && user.name !== "Loading..." ? user.name.charAt(0).toUpperCase() : "👤"}
        </div>
        
        <div className="profile-details">
          <h1>{user.name}</h1>
          <p className="email">{user.email}</p>
          
          <div className="profile-info-grid">
            <div className="info-item">
              <span className="info-label">Account ID</span>
              <span className="info-value">{user.id ? `${user.id.substring(0, 8)}...` : '...'}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Membership Level</span>
              <span className="info-value" style={{ color: 'var(--accent-cyan)' }}>Premium</span>
            </div>
            <div className="info-item">
              <span className="info-label">Status</span>
              <span className="info-value" style={{ color: '#10b981' }}>Active</span>
            </div>
          </div>
          
          <div className="profile-actions">
            <button className="logout-action-btn" onClick={handleLogout}>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
