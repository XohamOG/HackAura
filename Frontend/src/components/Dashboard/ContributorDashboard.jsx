import React from 'react';
import { useAuth } from '../../context/AuthContext';
import './ContributorDashboard.css';

const ContributorDashboard = () => {
  const { userProfile, githubUser, walletAddress, logout } = useAuth();

  const mockBounties = [
    {
      id: 1,
      title: "Implement authentication system",
      repository: "web-app-starter",
      organization: "TechCorp",
      amount: "0.8 ETH",
      difficulty: "Medium",
      tags: ["React", "Node.js", "Security"],
      posted: "1 day ago"
    },
    {
      id: 2,
      title: "Add unit tests for API endpoints",
      repository: "api-service",
      organization: "StartupXYZ",
      amount: "0.4 ETH",
      difficulty: "Easy",
      tags: ["Testing", "Jest", "API"],
      posted: "3 days ago"
    },
    {
      id: 3,
      title: "Performance optimization for dashboard",
      repository: "analytics-dashboard",
      organization: "DataTech",
      amount: "1.2 ETH",
      difficulty: "Hard",
      tags: ["Performance", "React", "Optimization"],
      posted: "5 days ago"
    }
  ];

  const myApplications = [
    {
      id: 1,
      title: "Fix responsive layout issues",
      amount: "0.3 ETH",
      status: "In Review",
      submitted: "2 days ago"
    },
    {
      id: 2,
      title: "Database schema improvements",
      amount: "0.6 ETH",
      status: "Accepted",
      submitted: "1 week ago"
    }
  ];

  return (
    <div className="contributor-dashboard">
      {/* Header */}
      <div className="dashboard-header">
        <div className="header-content">
          <div className="user-section">
            <div className="user-avatar">
              {githubUser?.avatar_url ? (
                <img src={githubUser.avatar_url} alt="User Avatar" />
              ) : (
                <div className="avatar-placeholder">👤</div>
              )}
            </div>
            <div className="user-info">
              <h1>Welcome back, {githubUser?.name || githubUser?.login}!</h1>
              <p>Developer Dashboard</p>
              <div className="wallet-info">
                <span className="wallet-label">Wallet:</span>
                <span className="wallet-address">{walletAddress.slice(0, 6)}...{walletAddress.slice(-4)}</span>
              </div>
            </div>
          </div>
          
          <div className="header-actions">
            <button className="btn-primary">🔍 Browse Bounties</button>
            <button className="btn-secondary" onClick={logout}>Logout</button>
          </div>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">🎯</div>
            <div className="stat-content">
              <div className="stat-number">5</div>
              <div className="stat-label">Active Applications</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">💰</div>
            <div className="stat-content">
              <div className="stat-number">3.2 ETH</div>
              <div className="stat-label">Total Earned</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">✅</div>
            <div className="stat-content">
              <div className="stat-number">12</div>
              <div className="stat-label">Completed Bounties</div>
            </div>
          </div>
          
          <div className="stat-card">
            <div className="stat-icon">⭐</div>
            <div className="stat-content">
              <div className="stat-number">4.8</div>
              <div className="stat-label">Average Rating</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="content-grid">
          {/* Available Bounties */}
          <div className="section">
            <div className="section-header">
              <h2>Available Bounties</h2>
              <div className="filters">
                <select className="filter-select">
                  <option>All Difficulties</option>
                  <option>Easy</option>
                  <option>Medium</option>
                  <option>Hard</option>
                </select>
                <button className="btn-outline">View All</button>
              </div>
            </div>
            
            <div className="bounties-list">
              {mockBounties.map(bounty => (
                <div key={bounty.id} className="bounty-card">
                  <div className="bounty-header">
                    <h3>{bounty.title}</h3>
                    <span className={`difficulty ${bounty.difficulty.toLowerCase()}`}>
                      {bounty.difficulty}
                    </span>
                  </div>
                  
                  <div className="bounty-meta">
                    <div className="org-info">
                      <span className="org-name">{bounty.organization}</span>
                      <span className="repo-name">/{bounty.repository}</span>
                    </div>
                    <div className="amount">{bounty.amount}</div>
                  </div>
                  
                  <div className="bounty-tags">
                    {bounty.tags.map(tag => (
                      <span key={tag} className="tag">{tag}</span>
                    ))}
                  </div>
                  
                  <div className="bounty-footer">
                    <span className="posted-time">Posted {bounty.posted}</span>
                    <div className="bounty-actions">
                      <button className="btn-small primary">Apply</button>
                      <button className="btn-small secondary">View Details</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div className="section sidebar">
            {/* My Applications */}
            <div className="my-applications">
              <h2>My Applications</h2>
              <div className="applications-list">
                {myApplications.map(app => (
                  <div key={app.id} className="application-card">
                    <h4>{app.title}</h4>
                    <div className="app-details">
                      <div className="app-amount">{app.amount}</div>
                      <span className={`app-status ${app.status.toLowerCase().replace(' ', '-')}`}>
                        {app.status}
                      </span>
                    </div>
                    <div className="app-time">Submitted {app.submitted}</div>
                  </div>
                ))}
              </div>
              <button className="btn-outline small">View All Applications</button>
            </div>

            {/* Skills & Preferences */}
            <div className="skills-section">
              <h3>Your Skills</h3>
              <div className="skills-tags">
                <span className="skill-tag">React</span>
                <span className="skill-tag">Node.js</span>
                <span className="skill-tag">Python</span>
                <span className="skill-tag">TypeScript</span>
                <span className="skill-tag">Docker</span>
              </div>
              <button className="btn-action">Update Skills</button>
            </div>

            {/* Recommendations */}
            <div className="recommendations">
              <h3>Recommended for You</h3>
              <div className="recommendation-item">
                <div className="rec-icon">🎯</div>
                <div className="rec-content">
                  <p>React Performance Optimization</p>
                  <span className="rec-amount">0.9 ETH</span>
                </div>
              </div>
              <div className="recommendation-item">
                <div className="rec-icon">🔧</div>
                <div className="rec-content">
                  <p>API Integration Task</p>
                  <span className="rec-amount">0.5 ETH</span>
                </div>
              </div>
            </div>

            {/* Achievement */}
            <div className="achievement">
              <div className="achievement-icon">🏆</div>
              <h3>Achievement Unlocked!</h3>
              <p>Completed 10+ bounties</p>
              <span className="achievement-reward">+0.1 ETH Bonus</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContributorDashboard;