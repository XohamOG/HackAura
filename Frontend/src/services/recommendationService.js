import axios from 'axios';

class RecommendationService {
  constructor() {
    this.apiBase = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api';
  }

  /**
   * Get AI-powered repository recommendations for a developer
   * @param {string} githubUsername - Developer's GitHub username
   * @param {string} accessToken - GitHub access token (optional for better rate limits)
   * @returns {Promise<Object>} Recommendations response
   */
  async getRecommendations(githubUsername, accessToken = null) {
    try {
      console.log(`🤖 Fetching AI recommendations for: ${githubUsername}`);

      const response = await axios.post(`${this.apiBase}/recommendations/recommendations`, {
        githubUsername,
        accessToken
      });

      if (response.data.success) {
        console.log('✅ AI recommendations fetched successfully');
        return response.data;
      } else {
        throw new Error(response.data.error || 'Failed to fetch recommendations');
      }

    } catch (error) {
      console.error('❌ Error fetching recommendations:', error);
      
      if (error.response?.status === 404) {
        throw new Error('GitHub user not found. Please check the username.');
      } else if (error.response?.status === 403) {
        throw new Error('GitHub API rate limit exceeded. Please try again later.');
      } else if (error.response?.status === 500) {
        throw new Error('AI service temporarily unavailable. Please try again.');
      } else {
        throw new Error('Failed to fetch recommendations. Please check your connection.');
      }
    }
  }

  /**
   * Get trending repositories by language
   * @param {string} language - Programming language to filter by
   * @param {number} limit - Number of repositories to fetch
   * @returns {Promise<Array>} Trending repositories
   */
  async getTrendingRepositories(language = '', limit = 10) {
    try {
      const query = language ? `language:${language}` : '';
      const url = `https://api.github.com/search/repositories?q=${query}&sort=stars&order=desc&per_page=${limit}`;
      
      const response = await axios.get(url);
      
      return response.data.items.map(repo => ({
        repository: repo.full_name,
        title: repo.name,
        description: repo.description,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        language: repo.language,
        topics: repo.topics || [],
        url: repo.html_url,
        updatedAt: repo.updated_at
      }));

    } catch (error) {
      console.error('❌ Error fetching trending repositories:', error);
      return [];
    }
  }

  /**
   * Analyze a specific repository for contribution opportunities
   * @param {string} repoFullName - Repository full name (owner/repo)
   * @returns {Promise<Object>} Repository analysis
   */
  async analyzeRepository(repoFullName) {
    try {
      const [repoResponse, issuesResponse, contributorsResponse] = await Promise.all([
        axios.get(`https://api.github.com/repos/${repoFullName}`),
        axios.get(`https://api.github.com/repos/${repoFullName}/issues?state=open&labels=good%20first%20issue,help%20wanted&per_page=10`),
        axios.get(`https://api.github.com/repos/${repoFullName}/contributors?per_page=5`)
      ]);

      const repo = repoResponse.data;
      const issues = issuesResponse.data;
      const contributors = contributorsResponse.data;

      return {
        repository: repoFullName,
        name: repo.name,
        description: repo.description,
        language: repo.language,
        stars: repo.stargazers_count,
        forks: repo.forks_count,
        openIssues: repo.open_issues_count,
        topics: repo.topics || [],
        license: repo.license?.name,
        lastUpdated: repo.updated_at,
        contributorCount: contributors.length,
        hasContributingGuide: await this.hasContributingGuide(repoFullName),
        goodFirstIssues: issues.map(issue => ({
          title: issue.title,
          url: issue.html_url,
          labels: issue.labels.map(label => label.name),
          createdAt: issue.created_at
        })),
        difficulty: this.assessDifficulty(repo, issues),
        contributionScore: this.calculateContributionScore(repo, issues)
      };

    } catch (error) {
      console.error(`❌ Error analyzing repository ${repoFullName}:`, error);
      throw error;
    }
  }

  /**
   * Check if repository has contributing guidelines
   * @param {string} repoFullName - Repository full name
   * @returns {Promise<boolean>} Whether contributing guide exists
   */
  async hasContributingGuide(repoFullName) {
    try {
      const possibleFiles = ['CONTRIBUTING.md', 'CONTRIBUTING.rst', 'CONTRIBUTING.txt', '.github/CONTRIBUTING.md'];
      
      for (const file of possibleFiles) {
        try {
          await axios.get(`https://api.github.com/repos/${repoFullName}/contents/${file}`);
          return true;
        } catch (e) {
          // File doesn't exist, continue checking
        }
      }
      
      return false;
    } catch (error) {
      return false;
    }
  }

  /**
   * Assess repository difficulty level
   * @param {Object} repo - Repository data
   * @param {Array} issues - Repository issues
   * @returns {string} Difficulty level
   */
  assessDifficulty(repo, issues) {
    const factors = {
      hasGoodFirstIssues: issues.length > 0 ? 1 : 0,
      isPopular: repo.stargazers_count > 1000 ? 1 : 0,
      recentActivity: new Date(repo.updated_at) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) ? 1 : 0,
      hasDocumentation: repo.has_wiki || repo.description ? 1 : 0
    };

    const score = Object.values(factors).reduce((sum, val) => sum + val, 0);

    if (score >= 3) return 'beginner';
    if (score >= 2) return 'intermediate';
    return 'advanced';
  }

  /**
   * Calculate contribution score for repository
   * @param {Object} repo - Repository data
   * @param {Array} issues - Repository issues
   * @returns {number} Contribution score (0-100)
   */
  calculateContributionScore(repo, issues) {
    let score = 0;

    // Activity score (0-30)
    const daysSinceUpdate = (Date.now() - new Date(repo.updated_at)) / (1000 * 60 * 60 * 24);
    if (daysSinceUpdate < 7) score += 30;
    else if (daysSinceUpdate < 30) score += 20;
    else if (daysSinceUpdate < 90) score += 10;

    // Popularity score (0-25)
    if (repo.stargazers_count > 5000) score += 25;
    else if (repo.stargazers_count > 1000) score += 20;
    else if (repo.stargazers_count > 100) score += 15;
    else if (repo.stargazers_count > 10) score += 10;

    // Beginner-friendly score (0-25)
    if (issues.length > 5) score += 25;
    else if (issues.length > 2) score += 20;
    else if (issues.length > 0) score += 15;

    // Maintenance score (0-20)
    if (repo.open_issues_count < 50) score += 20;
    else if (repo.open_issues_count < 100) score += 15;
    else if (repo.open_issues_count < 200) score += 10;

    return Math.min(score, 100);
  }

  /**
   * Get personalized learning path recommendations
   * @param {Object} profile - Developer profile
   * @returns {Array} Learning path recommendations
   */
  getPersonalizedLearningPath(profile) {
    const paths = [];

    // Analyze current skills and suggest progression
    const primaryLang = profile.skills?.primaryLanguage;
    const experience = profile.activityPattern?.totalRecentEvents || 0;

    if (experience < 50) {
      paths.push({
        title: 'Open Source Contributor Path',
        description: 'Start with documentation and small bug fixes',
        steps: [
          'Find repositories with "good first issue" labels',
          'Read contributing guidelines carefully',
          'Start with documentation improvements',
          'Fix small bugs and typos',
          'Gradually take on feature implementations'
        ],
        estimatedTime: '2-3 months',
        difficulty: 'beginner'
      });
    }

    if (primaryLang && ['JavaScript', 'TypeScript'].includes(primaryLang)) {
      paths.push({
        title: 'Frontend Development Path',
        description: 'Contribute to popular frontend frameworks and tools',
        steps: [
          'Contribute to React ecosystem projects',
          'Help with Vue.js community tools',
          'Work on developer tooling',
          'Build component libraries',
          'Create educational content'
        ],
        estimatedTime: '3-6 months',
        difficulty: 'intermediate'
      });
    }

    return paths;
  }
}

export default new RecommendationService();
