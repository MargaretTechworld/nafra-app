import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { logOut } from '../features/auth/authSlice';
import './styles/AdminDashboard.css';

export default function AdminDashboard() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, role } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logOut());
    navigate('/login');
  };

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <h1>Admin Dashboard</h1>
        <div className="user-info">
          <span>
            Welcome,
            {user?.name || 'Admin'}
            {' '}
            (
            {role}
            )
          </span>
          <button
            type="button"
            onClick={handleLogout}
            className="logout-btn"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        <section className="dashboard-overview">
          <h2>Overview</h2>
          <div className="stats-grid">
            <div className="stat-card">
              <h3>Total Users</h3>
              <p className="stat-number">0</p>
            </div>
            <div className="stat-card">
              <h3>Total Agencies</h3>
              <p className="stat-number">0</p>
            </div>
            <div className="stat-card">
              <h3>Total Submissions</h3>
              <p className="stat-number">0</p>
            </div>
          </div>
        </section>

        <section className="dashboard-actions">
          <h2>Management</h2>
          <div className="action-buttons">
            <button type="button" className="action-btn">Manage Users</button>
            <button type="button" className="action-btn">Manage Agencies</button>
            <button type="button" className="action-btn">View Submissions</button>
            <button type="button" className="action-btn">Analytics</button>
          </div>
        </section>
      </main>
    </div>
  );
}
