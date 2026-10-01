import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Budgets.css";
import "./Dashboard.css"; // Reuse header styles
import "./Transactions.css"; // Reuse page-header styles

const initialBudgets = [
  { id: 1, category: "Groceries", spent: 450, limit: 500, icon: "🛒" },
  { id: 2, category: "Rent & Utilities", spent: 1600, limit: 1600, icon: "🏠" },
  { id: 3, category: "Entertainment", spent: 120, limit: 300, icon: "🎬" },
  { id: 4, category: "Dining Out", spent: 280, limit: 250, icon: "🍔" },
  { id: 5, category: "Transportation", spent: 85, limit: 200, icon: "🚗" },
];

export default function Budgets() {
  const [activeTab, setActiveTab] = useState("Budgets");
  const [budgets, setBudgets] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newBudget, setNewBudget] = useState({ category: "", limit: "", icon: "📌" });

  useEffect(() => {
    fetchBudgets();
  }, []);

  const fetchBudgets = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/api/budgets", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setBudgets(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const totalBudget = budgets.reduce((acc, curr) => acc + curr.limit, 0);
  const totalSpent = budgets.reduce((acc, curr) => acc + curr.spent, 0);
  const remaining = totalBudget - totalSpent;

  const getProgressColor = (spent, limit) => {
    const percentage = (spent / limit) * 100;
    if (percentage >= 100) return "danger";
    if (percentage >= 80) return "warning";
    return "safe";
  };

  return (
    <div className="budgets-container">
      {/* Top Nav (Identical to Dashboard) */}
      <header className="dash-header">
        <div className="dash-logo">MoneyMap</div>
        <nav className="dash-nav">
          {["Overview", "Transactions", "Budgets"].map((tab) => (
            <Link 
              to={tab === "Overview" ? "/dashboard" : `/${tab.toLowerCase()}`}
              key={tab}
              style={{ textDecoration: 'none' }}
            >
              <span className={activeTab === tab ? "active" : ""} onClick={() => setActiveTab(tab)}>
                {tab}
              </span>
            </Link>
          ))}
        </nav>
        <div className="dash-profile-icon">A</div>
      </header>

      {/* Main Page Header */}
      <div className="page-header">
        <h1 className="page-title">Budgets</h1>
        <div className="header-actions">
          <button className="add-btn" onClick={() => setIsModalOpen(true)}>+ Create Budget</button>
        </div>
      </div>

      {/* Top Summary Cards */}
      <div className="budget-summary">
        <div className="b-card total">
          <div className="b-icon">💰</div>
          <div className="b-info">
            <h3>Total Budgeted</h3>
            <div className="b-amount">Rs. {totalBudget.toLocaleString()}</div>
          </div>
        </div>
        <div className="b-card spent">
          <div className="b-icon">🔥</div>
          <div className="b-info">
            <h3>Total Spent</h3>
            <div className="b-amount">Rs. {totalSpent.toLocaleString()}</div>
          </div>
        </div>
        <div className="b-card remaining">
          <div className="b-icon">✨</div>
          <div className="b-info">
            <h3>Remaining</h3>
            <div className="b-amount">Rs. {remaining > 0 ? remaining.toLocaleString() : "0"}</div>
          </div>
        </div>
      </div>

      {/* Category Trackers Area */}
      <div className="budget-trackers">
        <div className="trackers-header">
          <h2>Budget Limits</h2>
        </div>

        <div className="tracker-list">
          {budgets.map((budget) => {
            const percentage = Math.min((budget.spent / budget.limit) * 100, 100);
            const colorClass = getProgressColor(budget.spent, budget.limit);
            
            return (
              <div className="tracker-item" key={budget.id}>
                <div className="tracker-top">
                  <div className="t-category">
                    <div className="t-icon">{budget.icon}</div>
                    <div className="t-name">{budget.category}</div>
                  </div>
                  <div className="t-amounts">
                    <span className="t-spent">Rs. {budget.spent}</span>
                    <span className="t-limit"> of Rs. {budget.limit}</span>
                  </div>
                </div>
                
                <div className="progress-bg">
                  <div 
                    className={`progress-fill ${colorClass}`} 
                    style={{ width: `${percentage}%` }}
                  ></div>
                </div>

                {budget.spent > budget.limit && (
                  <span className="t-warning">Exceeded budget by Rs. {budget.spent - budget.limit}!</span>
                )}
                {budget.spent === budget.limit && (
                  <span className="t-warning" style={{ color: '#f59e0b' }}>Budget fully exhausted.</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Budget Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Create New Budget</h3>
            <input 
              type="text" 
              placeholder="Category Name (e.g. Groceries)" 
              value={newBudget.category}
              onChange={(e) => setNewBudget({...newBudget, category: e.target.value})}
            />
            <input 
              type="number" 
              placeholder="Budget Limit (Rs.)" 
              value={newBudget.limit}
              onChange={(e) => setNewBudget({...newBudget, limit: e.target.value})}
            />
            <input 
              type="text" 
              placeholder="Emoji Icon (e.g. 🍕)" 
              value={newBudget.icon}
              onChange={(e) => setNewBudget({...newBudget, icon: e.target.value})}
            />
            
            <div className="modal-actions">
              <button 
                className="modal-btn cancel"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="modal-btn save"
                onClick={async () => {
                  if (newBudget.category && newBudget.limit) {
                    try {
                      const token = localStorage.getItem("token");
                      const res = await fetch("http://localhost:8000/api/budgets", {
                        method: "POST",
                        headers: { 
                          "Content-Type": "application/json",
                          "Authorization": `Bearer ${token}`
                        },
                        body: JSON.stringify({
                          category: newBudget.category,
                          limit: parseFloat(newBudget.limit),
                          icon: newBudget.icon || "📌"
                        })
                      });

                      if (res.ok) {
                        const addedBudget = await res.json();
                        setBudgets([...budgets, addedBudget]);
                        setNewBudget({ category: "", limit: "", icon: "📌" });
                        setIsModalOpen(false);
                      }
                    } catch (err) {
                      console.error(err);
                    }
                  }
                }}
              >
                Save Budget
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
