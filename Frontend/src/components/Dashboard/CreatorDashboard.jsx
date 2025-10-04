import React, { useState, useContext, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { AuthContext } from '../../context/AuthContext';
import IPFSIntegration from '../IPFS/IPFSIntegration';
import githubOAuth from '../../services/githubOAuth';
import './CreatorDashboard.css';

const CreatorDashboard = () => {
  const { user } = useContext(AuthContext);
  const [repositories, setRepositories] = useState([]);
  const [bounties, setBounties] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalRepos: 0,
    activeBounties: 0,
    totalRewards: '0',
    successfulBounties: 0
  });

  useEffect(() => {
    if (user) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load user's repositories and bounties from backend API
      await Promise.all([
        loadRepositories(),
        loadBounties(),
        loadStats()
      ]);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRepositories = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/repositories?owner=${user.login}`);
      if (response.ok) {
        const data = await response.json();
        setRepositories(data.repositories || []);
      }
    } catch (error) {
      console.error('Failed to load repositories:', error);
      setRepositories([]);
    }
  };

  const loadBounties = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/bounties?creator=${user.login}`);
      if (response.ok) {
        const data = await response.json();
        setBounties(data.bounties || []);
      }
    } catch (error) {
      console.error('Failed to load bounties:', error);
      setBounties([]);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/stats/creator/${user.login}`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const handleMetaMaskConnect = async () => {
    try {
      await githubOAuth.connectMetaMask();
      // Refresh data after connecting
      loadDashboardData();
    } catch (error) {
      console.error('Failed to connect MetaMask:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="creator-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="creator-dashboard">
      <div className="dashboard-header">
        <h1>Creator Dashboard</h1>
        <p>Manage your repositories and bounties on HelaChain</p>
      </div>

      {/* Statistics Cards */}
      <div className="stats-grid">
        <Card>
          <CardHeader>
            <CardTitle>Repositories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stat-value">{stats.totalRepos}</div>
            <div className="stat-label">Total Registered</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active Bounties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stat-value">{stats.activeBounties}</div>
            <div className="stat-label">Currently Open</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Rewards</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stat-value">{stats.totalRewards} HELA</div>
            <div className="stat-label">In Active Bounties</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Success Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="stat-value">
              {stats.activeBounties > 0 ? 
                Math.round((stats.successfulBounties / (stats.activeBounties + stats.successfulBounties)) * 100) : 0}%
            </div>
            <div className="stat-label">Completed Bounties</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="repositories" className="dashboard-tabs">
        <TabsList>
          <TabsTrigger value="repositories">Repositories</TabsTrigger>
          <TabsTrigger value="bounties">Bounties</TabsTrigger>
          <TabsTrigger value="ipfs">IPFS Setup</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="repositories">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Your Repositories
                <Button onClick={loadRepositories}>Refresh</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {repositories.length === 0 ? (
                <div className="empty-state">
                  <p>No repositories registered yet.</p>
                  <p>Use the IPFS Setup tab to register your first repository!</p>
                </div>
              ) : (
                <div className="repositories-grid">
                  {repositories.map((repo) => (
                    <Card key={repo.id} className="repository-card">
                      <CardContent>
                        <div className="repo-header">
                          <h3>{repo.name}</h3>
                          <Badge variant={repo.isPublic ? 'default' : 'secondary'}>
                            {repo.isPublic ? 'Public' : 'Private'}
                          </Badge>
                        </div>
                        <p className="repo-description">{repo.description}</p>
                        <div className="repo-stats">
                          <span>⭐ {repo.stars || 0}</span>
                          <span>🏆 {repo.activeBounties || 0} bounties</span>
                          <span>💰 {repo.totalRewards || '0'} HELA</span>
                        </div>
                        <div className="repo-actions">
                          <Button variant="outline" size="sm">
                            View Details
                          </Button>
                          <Button size="sm">
                            Create Bounty
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bounties">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Your Bounties
                <Button onClick={loadBounties}>Refresh</Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {bounties.length === 0 ? (
                <div className="empty-state">
                  <p>No bounties created yet.</p>
                  <p>Create your first bounty to start attracting contributors!</p>
                </div>
              ) : (
                <div className="bounties-list">
                  {bounties.map((bounty) => (
                    <Card key={bounty.id} className="bounty-card">
                      <CardContent>
                        <div className="bounty-header">
                          <h3>{bounty.title}</h3>
                          <div className="bounty-badges">
                            <Badge variant={bounty.status === 'open' ? 'default' : 'secondary'}>
                              {bounty.status}
                            </Badge>
                            <Badge variant="outline">
                              {bounty.amount} HELA
                            </Badge>
                          </div>
                        </div>
                        <p className="bounty-description">{bounty.description}</p>
                        <div className="bounty-meta">
                          <span>Repository: {bounty.repository}</span>
                          <span>Deadline: {new Date(bounty.deadline).toLocaleDateString()}</span>
                          <span>Applications: {bounty.applications || 0}</span>
                        </div>
                        <div className="bounty-actions">
                          <Button variant="outline" size="sm">
                            View Applications
                          </Button>
                          <Button size="sm">
                            Edit Bounty
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ipfs">
          <IPFSIntegration />
        </TabsContent>

        <TabsContent value="settings">
          <Card>
            <CardHeader>
              <CardTitle>Creator Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* MetaMask Connection */}
              <div>
                <h3 className="text-lg font-medium mb-2">Wallet Connection</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Connect your MetaMask wallet to interact with HelaChain smart contracts.
                </p>
                <Button onClick={handleMetaMaskConnect}>
                  Connect MetaMask to HelaChain
                </Button>
              </div>

              {/* Account Information */}
              <div>
                <h3 className="text-lg font-medium mb-2">Account Information</h3>
                <div className="space-y-2">
                  <div><strong>GitHub:</strong> {user?.login}</div>
                  <div><strong>Email:</strong> {user?.email}</div>
                  <div><strong>Member Since:</strong> {new Date(user?.created_at).toLocaleDateString()}</div>
                </div>
              </div>

              {/* Notification Preferences */}
              <div>
                <h3 className="text-lg font-medium mb-2">Notifications</h3>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    Email notifications for new bounty applications
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" defaultChecked />
                    Browser notifications for bounty updates
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="mr-2" />
                    Weekly summary emails
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CreatorDashboard;