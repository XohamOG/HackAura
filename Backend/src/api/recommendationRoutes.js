const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const router = express.Router();

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Get AI-powered repository recommendations for a developer
 * Analyzes their GitHub profile, repositories, and skill set
 */
router.post('/recommendations', async (req, res) => {
  try {
    const { githubUsername, accessToken } = req.body;

    if (!githubUsername) {
      return res.status(400).json({ error: 'GitHub username is required' });
    }

    console.log(`🤖 Generating AI recommendations for: ${githubUsername}`);

    // 1. Fetch developer's GitHub profile and skills
    const developerProfile = await fetchDeveloperProfile(githubUsername, accessToken);
    
    // 2. Get AI-powered recommendations
    const recommendations = await generateAIRecommendations(developerProfile);
    
    // 3. Enhance recommendations with real GitHub data
    const enhancedRecommendations = await enhanceWithGitHubData(recommendations);

    res.json({
      success: true,
      data: {
        profile: developerProfile,
        recommendations: enhancedRecommendations,
        generatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Recommendation error:', error);
    res.status(500).json({ 
      error: 'Failed to generate recommendations',
      details: error.message 
    });
  }
});

/**
 * Fetch comprehensive developer profile from GitHub
 */
async function fetchDeveloperProfile(username, accessToken) {
  try {
    const headers = accessToken ? {
      'Authorization': `token ${accessToken}`,
      'Accept': 'application/vnd.github.v3+json'
    } : {
      'Accept': 'application/vnd.github.v3+json'
    };

    // Fetch user profile
    const profileResponse = await axios.get(`https://api.github.com/users/${username}`, { headers });
    const profile = profileResponse.data;

    // Fetch user's repositories
    const reposResponse = await axios.get(`https://api.github.com/users/${username}/repos?sort=updated&per_page=50`, { headers });
    const repositories = reposResponse.data;

    // Fetch user's events (contributions, issues solved)
    const eventsResponse = await axios.get(`https://api.github.com/users/${username}/events?per_page=100`, { headers });
    const events = eventsResponse.data;

    // Analyze the data
    const skills = analyzeSkills(repositories, events);
    const activityPattern = analyzeActivity(events);
    const collaborations = analyzeCollaborations(events);

    return {
      username: profile.login,
      name: profile.name,
      bio: profile.bio,
      location: profile.location,
      publicRepos: profile.public_repos,
      followers: profile.followers,
      following: profile.following,
      createdAt: profile.created_at,
      skills,
      activityPattern,
      collaborations,
      repositories: repositories.slice(0, 10), // Top 10 recent repos
      totalCommits: calculateTotalCommits(events),
      issuesSolved: countIssuesSolved(events),
      pullRequestsMerged: countPullRequestsMerged(events)
    };

  } catch (error) {
    console.error('❌ Error fetching developer profile:', error);
    throw error;
  }
}

/**
 * Analyze programming languages and skills from repositories
 */
function analyzeSkills(repositories, events) {
  const languages = {};
  const frameworks = new Set();
  const topics = new Set();

  // Analyze repository languages
  repositories.forEach(repo => {
    if (repo.language) {
      languages[repo.language] = (languages[repo.language] || 0) + 1;
    }

    // Analyze topics/tags
    if (repo.topics) {
      repo.topics.forEach(topic => topics.add(topic));
    }

    // Detect frameworks from repo names and descriptions
    const text = `${repo.name} ${repo.description || ''}`.toLowerCase();
    detectFrameworks(text, frameworks);
  });

  // Analyze activity events for additional skills
  events.forEach(event => {
    if (event.payload && event.payload.commits) {
      event.payload.commits.forEach(commit => {
        const message = commit.message.toLowerCase();
        detectFrameworks(message, frameworks);
      });
    }
  });

  return {
    languages: Object.entries(languages)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10)
      .map(([lang, count]) => ({ language: lang, repos: count })),
    frameworks: Array.from(frameworks).slice(0, 10),
    topics: Array.from(topics).slice(0, 15),
    primaryLanguage: Object.keys(languages).reduce((a, b) => languages[a] > languages[b] ? a : b, 'JavaScript')
  };
}

/**
 * Detect frameworks and technologies from text
 */
function detectFrameworks(text, frameworks) {
  const frameworkPatterns = {
    'React': /react|reactjs|jsx/,
    'Vue.js': /vue|vuejs|nuxt/,
    'Angular': /angular|ng-/,
    'Node.js': /node|express|nodejs/,
    'Django': /django/,
    'Flask': /flask/,
    'Spring': /spring|springboot/,
    'Laravel': /laravel/,
    'Ruby on Rails': /rails|ruby/,
    'Next.js': /next\.?js|nextjs/,
    'Svelte': /svelte/,
    'FastAPI': /fastapi/,
    'TensorFlow': /tensorflow/,
    'PyTorch': /pytorch/,
    'Docker': /docker|container/,
    'Kubernetes': /k8s|kubernetes/,
    'AWS': /aws|amazon/,
    'MongoDB': /mongo|mongodb/,
    'PostgreSQL': /postgres|postgresql/,
    'Redis': /redis/,
    'GraphQL': /graphql/,
    'TypeScript': /typescript|ts/
  };

  Object.entries(frameworkPatterns).forEach(([framework, pattern]) => {
    if (pattern.test(text)) {
      frameworks.add(framework);
    }
  });
}

/**
 * Analyze activity patterns
 */
function analyzeActivity(events) {
  const activityByType = {};
  const recentActivity = events.filter(event => {
    const eventDate = new Date(event.created_at);
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    return eventDate > sixMonthsAgo;
  });

  recentActivity.forEach(event => {
    activityByType[event.type] = (activityByType[event.type] || 0) + 1;
  });

  return {
    totalRecentEvents: recentActivity.length,
    activityTypes: activityByType,
    isActiveContributor: recentActivity.length > 50,
    averageEventsPerMonth: Math.round(recentActivity.length / 6)
  };
}

/**
 * Analyze collaborations and contributions
 */
function analyzeCollaborations(events) {
  const repositories = new Set();
  const organizations = new Set();

  events.forEach(event => {
    if (event.repo) {
      repositories.add(event.repo.name);
      const owner = event.repo.name.split('/')[0];
      if (owner !== event.actor.login) {
        organizations.add(owner);
      }
    }
  });

  return {
    contributedRepos: repositories.size,
    collaboratedOrgs: organizations.size,
    repositories: Array.from(repositories).slice(0, 10),
    organizations: Array.from(organizations).slice(0, 5)
  };
}

/**
 * Calculate total commits from events
 */
function calculateTotalCommits(events) {
  return events
    .filter(event => event.type === 'PushEvent')
    .reduce((total, event) => total + (event.payload.commits ? event.payload.commits.length : 0), 0);
}

/**
 * Count issues solved
 */
function countIssuesSolved(events) {
  return events.filter(event => 
    event.type === 'IssuesEvent' && 
    event.payload.action === 'closed'
  ).length;
}

/**
 * Count merged pull requests
 */
function countPullRequestsMerged(events) {
  return events.filter(event => 
    event.type === 'PullRequestEvent' && 
    event.payload.action === 'closed' &&
    event.payload.pull_request.merged
  ).length;
}

/**
 * Generate AI-powered recommendations using Gemini
 */
async function generateAIRecommendations(profile) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `
As an AI assistant specializing in open source development, analyze this developer's profile and recommend repositories for them to contribute to.

Developer Profile:
- Username: ${profile.username}
- Name: ${profile.name || 'Not provided'}
- Bio: ${profile.bio || 'Not provided'}
- Location: ${profile.location || 'Not provided'}
- Primary Language: ${profile.skills.primaryLanguage}
- Languages: ${profile.skills.languages.map(l => `${l.language} (${l.repos} repos)`).join(', ')}
- Frameworks: ${profile.skills.frameworks.join(', ')}
- Topics of Interest: ${profile.skills.topics.join(', ')}
- Recent Activity: ${profile.activityPattern.totalRecentEvents} events in last 6 months
- Issues Solved: ${profile.issuesSolved}
- Pull Requests Merged: ${profile.pullRequestsMerged}
- Collaboration Experience: ${profile.collaborations.contributedRepos} repositories

Based on this profile, recommend 5-8 specific open source repositories that would be perfect for this developer to contribute to. For each recommendation, provide:

1. Repository name (real GitHub repositories only)
2. Why it matches their skills (be specific)
3. Potential contribution areas
4. Learning opportunities
5. Difficulty level (beginner/intermediate/advanced)

Focus on repositories that:
- Match their primary programming languages
- Align with their experience level
- Offer good learning opportunities
- Have active communities
- Need contributions in areas matching their skills

Please respond in JSON format:
{
  "recommendations": [
    {
      "repository": "owner/repo-name",
      "title": "Repository Title",
      "description": "Brief description",
      "matchReason": "Why this matches their skills",
      "contributionAreas": ["area1", "area2"],
      "learningOpportunities": ["opportunity1", "opportunity2"],
      "difficultyLevel": "intermediate",
      "primaryLanguage": "JavaScript",
      "tags": ["react", "frontend"]
    }
  ]
}
`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the JSON response
    let recommendations;
    try {
      // Extract JSON from the response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        recommendations = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('❌ Error parsing AI response:', parseError);
      // Fallback recommendations
      recommendations = generateFallbackRecommendations(profile);
    }

    return recommendations.recommendations || [];

  } catch (error) {
    console.error('❌ Error generating AI recommendations:', error);
    return generateFallbackRecommendations(profile);
  }
}

/**
 * Generate fallback recommendations when AI fails
 */
function generateFallbackRecommendations(profile) {
  const fallbackRepos = {
    'JavaScript': [
      {
        repository: 'freeCodeCamp/freeCodeCamp',
        title: 'freeCodeCamp',
        description: 'The leading open source coding curriculum',
        matchReason: 'Great for JavaScript developers to contribute to educational content',
        contributionAreas: ['Documentation', 'Curriculum', 'Bug fixes'],
        learningOpportunities: ['Open source best practices', 'Educational content creation'],
        difficultyLevel: 'beginner',
        primaryLanguage: 'JavaScript',
        tags: ['education', 'javascript', 'react']
      }
    ],
    'Python': [
      {
        repository: 'python/cpython',
        title: 'CPython',
        description: 'The Python programming language',
        matchReason: 'Perfect for Python enthusiasts to contribute to the core language',
        contributionAreas: ['Core development', 'Documentation', 'Testing'],
        learningOpportunities: ['Language internals', 'C programming'],
        difficultyLevel: 'advanced',
        primaryLanguage: 'Python',
        tags: ['python', 'core', 'language']
      }
    ]
  };

  const primaryLang = profile.skills.primaryLanguage;
  return fallbackRepos[primaryLang] || fallbackRepos['JavaScript'];
}

/**
 * Enhance AI recommendations with real GitHub data
 */
async function enhanceWithGitHubData(recommendations) {
  const enhanced = [];

  for (const rec of recommendations) {
    try {
      const repoResponse = await axios.get(`https://api.github.com/repos/${rec.repository}`);
      const repo = repoResponse.data;

      // Get recent issues for contribution opportunities
      const issuesResponse = await axios.get(`https://api.github.com/repos/${rec.repository}/issues?state=open&labels=good%20first%20issue,help%20wanted&per_page=3`);
      const goodFirstIssues = issuesResponse.data;

      enhanced.push({
        ...rec,
        githubData: {
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          language: repo.language,
          description: repo.description,
          topics: repo.topics || [],
          updatedAt: repo.updated_at,
          openIssues: repo.open_issues_count,
          url: repo.html_url,
          hasGoodFirstIssues: goodFirstIssues.length > 0,
          goodFirstIssues: goodFirstIssues.slice(0, 2).map(issue => ({
            title: issue.title,
            url: issue.html_url,
            labels: issue.labels.map(label => label.name)
          }))
        }
      });

    } catch (error) {
      console.error(`❌ Error fetching GitHub data for ${rec.repository}:`, error.message);
      // Include recommendation without GitHub data
      enhanced.push(rec);
    }
  }

  return enhanced;
}

module.exports = router;
