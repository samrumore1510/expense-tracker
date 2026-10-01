import React from "react";
import "./LandingPage.css";
import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="landing-container">
      {/* Navbar */}
      <nav className="navbar">
        <h2 className="logo">MoneyMap</h2>

        <div className="nav-buttons">
          <Link to="/login" className="login-btn">
            Login
          </Link>

          <Link to="/getStarted" className="start-btn">
            Get Started
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero">
        <h1>Track Your Expenses <span className="highlight">Easily</span></h1>
        <p>
          Take control of your finances. Manage your income and expenses with a simple, powerful, and beautifully designed tool.
        </p>

        <Link to="/getStarted">
          <button className="btn">Start for Free</button>
        </Link>
      </section>

      {/* Features */}
      <section className="features">
        <div className="card">
          <div className="card-icon">💸</div>
          <h3>Quick Transactions</h3>
          <p>Instantly log your income and expenses with our streamlined interface.</p>
        </div>

        <div className="card">
          <div className="card-icon">📊</div>
          <h3>Visual Reports</h3>
          <p>Gain insights into your spending habits with stunning, easy-to-read charts.</p>
        </div>

        <div className="card">
          <div className="card-icon">🔒</div>
          <h3>Secure Data</h3>
          <p>Your financial data is encrypted and securely stored. Peace of mind guaranteed.</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <p>© 2026 MoneyMap. All rights reserved.</p>
      </footer>
    </div>
  );
}