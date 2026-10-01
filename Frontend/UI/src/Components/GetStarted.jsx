import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./GetStarted.css";

export default function GetStarted() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const response = await fetch("http://localhost:8000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          password: formData.password
        })
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.access_token);
        navigate("/dashboard");
      } else {
        alert(data.detail || "Signup failed");
      }
    } catch (error) {
      console.error("Error signing up:", error);
      alert("An error occurred. Please try again.");
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-box">
        <h2>Create Account</h2>

        <form onSubmit={handleSubmit}>
          <input
            type="text"
            name="name"
            placeholder="Full Name"
            value={formData.name}
            onChange={handleChange}
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email Address"
            value={formData.email}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
          />

          <button type="submit">Sign Up</button>
        </form>

        <p className="login-link">
          Already have an account? <Link to="/login">Log in</Link>
        </p>

        <Link to="/" className="back-home">← Back to Home</Link>
      </div>
    </div>
  );
}