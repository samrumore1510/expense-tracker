import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import "./Dashboard.css";

import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("Overview");
  const [showDropdown, setShowDropdown] = useState(false);
  const navigate = useNavigate();
  
  const [dashboardData, setDashboardData] = useState({
    user: { name: "Guest" },
    total_balance: 0,
    income: 0,
    expense: 0,
    savings: 0,
    recent_transactions: [],
    chart_data: [{"name": "", "income": 0, "expense": 0}],
    monthly_budget: 0,
    spent_percentage: 0
  });

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/api/dashboard", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const result = await res.json();
        setDashboardData(result);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="dash-header">
        <div className="dash-logo">MoneyMap</div>
        <nav className="dash-nav">
          {["Overview", "Transactions", "Budgets"].map((tab) => (
            <Link 
              to={tab === "Overview" ? "/dashboard" : `/${tab.toLowerCase()}`}
              key={tab}
              style={{ textDecoration: 'none' }}
            >
              <span
                className={activeTab === tab ? "active" : ""}
                onClick={() => setActiveTab(tab)}
              >
                {tab}
              </span>
            </Link>
          ))}
        </nav>
        <div className="dash-profile-menu">
          <div className="dash-profile-icon" onClick={() => setShowDropdown(!showDropdown)}>
            {dashboardData.user.name ? dashboardData.user.name.charAt(0).toUpperCase() : 'A'}
          </div>
          {showDropdown && (
            <div className="profile-dropdown">
              <Link to="/profile" className="dropdown-item">See Profile</Link>
              <button onClick={handleLogout} className="dropdown-item logout-btn">Logout</button>
            </div>
          )}
        </div>
      </header>

      {/* Content Grid */}
      <div className="dash-content">
        {/* Left Main Panel */}
        <div className="main-panel">
          <div className="section-header">
            <h2>My Finances</h2>
            <div className="date-picker">4/23/2026 📅</div>
          </div>

          {/* 4 Summary Cards */}
          <div className="summary-cards">
            <div className="stat-card blue">
              <div className="title">💳 Total Balance</div>
              <div className="amount">Rs. {dashboardData.total_balance.toLocaleString()}</div>
              <div className="subtitle">+2.5% from last month</div>
            </div>
            <div className="stat-card pink">
              <div className="title">📈 Income</div>
              <div className="amount">Rs. {dashboardData.income.toLocaleString()}</div>
              <div className="subtitle">Target: Rs. 6000</div>
            </div>
            <div className="stat-card orange">
              <div className="title">📉 Expenses</div>
              <div className="amount">Rs. {dashboardData.expense.toLocaleString()}</div>
              <div className="subtitle">Target: Rs. 3000</div>
            </div>
            <div className="stat-card teal">
              <div className="title">🎯 Savings</div>
              <div className="amount">Rs. {dashboardData.savings.toLocaleString()}</div>
              <div className="subtitle">65% of goal</div>
            </div>
          </div>

          {/* Chart Section */}
          <div className="chart-section">
            <div className="section-header" style={{ marginTop: '10px' }}>
              <h2>Cashflow Statistics</h2>
              <select className="date-picker" style={{ outline: 'none' }}>
                <option>Weekly</option>
                <option>Monthly</option>
                <option>Yearly</option>
              </select>
            </div>
            
            <div className="chart-container">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={dashboardData.chart_data}
                  margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ec4899" stopOpacity={0.8} />
                      <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-secondary)" tick={{fill: 'var(--text-secondary)'}} />
                  <YAxis stroke="var(--text-secondary)" tick={{fill: 'var(--text-secondary)'}} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'var(--glass-bg)', borderColor: 'var(--glass-border)', borderRadius: '10px', color: '#fff' }}
                    itemStyle={{ color: '#fff' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="income"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorIncome)"
                  />
                  <Area
                    type="monotone"
                    dataKey="expense"
                    stroke="#ec4899"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorExpense)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Sidebar Panel */}
        <div className="side-panel">
          {/* Profile Widget */}
          <div className="profile-card">
            <div className="avatar">🧑🏽‍💻</div>
            <h3>{dashboardData.user.name}</h3>
            <p>Premium Member</p>
            
            <div className="profile-stats">
              <div>
                <span>Monthly Budget</span>
                <span>Rs. {dashboardData.monthly_budget.toLocaleString()}</span>
              </div>
              <div>
                <span>Spent</span>
                <span>{dashboardData.spent_percentage}%</span>
              </div>
            </div>
          </div>

          {/* Recent Transactions List (Journals Equivalent) */}
          <div className="recent-activity">
            <div className="section-header">
              <h2 style={{ fontSize: '18px' }}>Recent Activity</h2>
            </div>
            
            <div className="activity-list">
              {dashboardData.recent_transactions.length > 0 ? (
                dashboardData.recent_transactions.map((tx) => (
                  <div className="activity-item" key={tx.id}>
                    <div className="act-info">
                      <h4>{tx.icon} {tx.title}</h4>
                      <p>{tx.date}</p>
                    </div>
                    <div className={`act-amount ${tx.type}`}>
                      {tx.type === "income" ? "+" : "-"}Rs. {Math.abs(tx.amount).toFixed(2)}
                    </div>
                  </div>
                ))
              ) : (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', marginTop: '20px' }}>No recent activity.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}