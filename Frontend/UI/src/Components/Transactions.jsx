import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Transactions.css";
import "./Dashboard.css";

const initialTransactions = [
  { id: 1, date: "Apr 23, 2026", title: "Whole Foods Market", category: "Groceries", amount: -85.00, icon: "🛒" },
  { id: 2, date: "Apr 22, 2026", title: "Tech Corp Salary", category: "Income", amount: 4200.00, icon: "💼" },
  { id: 3, date: "Apr 21, 2026", title: "Starbucks", category: "Food & Drink", amount: -5.50, icon: "☕" },
  { id: 4, date: "Apr 20, 2026", title: "AMC Theaters", category: "Entertainment", amount: -24.00, icon: "🎬" },
  { id: 5, date: "Apr 18, 2026", title: "Electric Bill", category: "Utilities", amount: -110.00, icon: "⚡" },
  { id: 6, date: "Apr 15, 2026", title: "Gym Membership", category: "Health", amount: -40.00, icon: "🏋️" },
  { id: 7, date: "Apr 12, 2026", title: "Freelance Project", category: "Income", amount: 850.00, icon: "💻" },
];

export default function Transactions() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("Transactions");
  const [transactions, setTransactions] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newTx, setNewTx] = useState({ title: "", amount: "", type: "expense", category: "General", icon: "📝" });

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("http://localhost:8000/api/transactions", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTransactions(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:8000/api/transactions/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        setTransactions(transactions.filter(tx => tx.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredTransactions = transactions.filter((tx) =>
    tx.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    tx.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="transactions-container">
      {/* Header (Re-using Dash Header styles from Dashboard.css conceptually, but we can recreate or just use the same classes if global. For now, creating a local one is safer or re-using dash-header if imported. We'll use a new layout for the very top or re-import Dashboard.css. Actually, let's keep it self-contained with a page-header for the content area, and a top nav.) */}
      
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
        <h1 className="page-title">Transactions</h1>
        
        <div className="header-actions">
          <input 
            type="text" 
            className="search-input" 
            placeholder="Search transactions..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="add-btn" onClick={() => setIsModalOpen(true)}>+ Add Transaction</button>
        </div>
      </div>

      {/* Data Table */}
      <div className="table-container">
        <table className="transactions-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Transaction Details</th>
              <th>Category</th>
              <th>Amount</th>
              <th style={{ width: '50px' }}></th>
            </tr>
          </thead>
          <tbody>
            {filteredTransactions.map((tx) => (
              <tr key={tx.id} className="tx-row">
                <td className="col-date">{tx.date}</td>
                <td className="col-title">
                  <div className="icon-box">{tx.icon}</div>
                  {tx.title}
                </td>
                <td className="col-category">
                  <span className="category-tag">{tx.category}</span>
                </td>
                <td className={`col-amount amount ${tx.amount < 0 ? 'expense' : 'income'}`}>
                  {tx.amount < 0 ? "-" : "+"}Rs. {Math.abs(tx.amount).toFixed(2)}
                </td>
                <td className="col-action">
                  <button className="delete-btn" onClick={() => handleDelete(tx.id)} title="Delete Transaction">
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
            {filteredTransactions.length === 0 && (
              <tr>
                <td colSpan="5" style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>
                  No transactions found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Transaction Modal */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Add Transaction</h3>
            
            <input 
              type="text" 
              placeholder="Title (e.g. Starbucks)" 
              value={newTx.title}
              onChange={(e) => setNewTx({...newTx, title: e.target.value})}
            />
            
            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="number" 
                placeholder="Amount (Rs.)" 
                value={newTx.amount}
                onChange={(e) => setNewTx({...newTx, amount: e.target.value})}
                style={{ flex: 1 }}
              />
              <select 
                value={newTx.type} 
                onChange={(e) => setNewTx({...newTx, type: e.target.value})}
                style={{ width: '120px' }}
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <input 
                type="text" 
                placeholder="Category (e.g. Food)" 
                value={newTx.category}
                onChange={(e) => setNewTx({...newTx, category: e.target.value})}
                style={{ flex: 1 }}
              />
              <input 
                type="text" 
                placeholder="Icon (☕)" 
                value={newTx.icon}
                onChange={(e) => setNewTx({...newTx, icon: e.target.value})}
                style={{ width: '120px', textAlign: 'center' }}
              />
            </div>
            
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
                  if (newTx.title && newTx.amount) {
                    const parsedAmount = parseFloat(newTx.amount);
                    const finalAmount = newTx.type === "expense" ? -Math.abs(parsedAmount) : Math.abs(parsedAmount);
                    
                    const today = new Date();
                    const formattedDate = today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

                    try {
                      const token = localStorage.getItem("token");
                      const res = await fetch("http://localhost:8000/api/transactions", {
                        method: "POST",
                        headers: { 
                          "Content-Type": "application/json",
                          "Authorization": `Bearer ${token}`
                        },
                        body: JSON.stringify({
                          title: newTx.title,
                          category: newTx.category || "General",
                          amount: finalAmount,
                          type: newTx.type,
                          date: formattedDate,
                          icon: newTx.icon || "📝"
                        })
                      });

                      if (res.ok) {
                        const addedTx = await res.json();
                        setTransactions([addedTx, ...transactions]);
                        setNewTx({ title: "", amount: "", type: "expense", category: "General", icon: "📝" });
                        setIsModalOpen(false);
                      }
                    } catch (err) {
                      console.error(err);
                    }
                  }
                }}
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
