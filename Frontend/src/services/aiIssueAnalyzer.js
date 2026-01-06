// AI-powered Issue Analysis Service
import { generateText } from 'ai';
import { openai } from '@ai-sdk/openai';

class AIIssueAnalyzer {
  constructor() {
    this.model = openai('gpt-3.5-turbo');
    this.cache = new Map();
  }

  /**
   * Analyze GitHub issues and suggest the best matches based on developer skills
   * @param {Array} issues - Array of GitHub issues
   * @param {Object} developerProfile - Developer's skills and preferences
   * @returns {Array} Sorted array of issues with AI recommendations
   */
  async analyzeIssuesForDeveloper(issues, developerProfile) {
    try {
      const cacheKey = this.generateCacheKey(issues, developerProfile);
      
      if (this.cache.has(cacheKey)) {
        return this.cache.get(cacheKey);
      }

      const analysisPrompt = this.buildAnalysisPrompt(issues, developerProfile);
      
      const { text } = await generateText({
        model: this.model,
        prompt: analysisPrompt,
        maxTokens: 2000,
        temperature: 0.3
      });

      const suggestions = this.parseAISuggestions(text, issues);
      
      // Cache the results for 10 minutes
      this.cache.set(cacheKey, suggestions);
      setTimeout(() => this.cache.delete(cacheKey), 10 * 60 * 1000);
      
      return suggestions;
    } catch (error) {
      console.error('AI analysis failed:', error);
      return this.fallbackAnalysis(issues, developerProfile);
    }
  }

  /**
   * Build the prompt for AI analysis
   */
  buildAnalysisPrompt(issues, developerProfile) {
    const { skills = [], experience = 'intermediate', preferences = {} } = developerProfile;
    
    const issuesText = issues.map((issue, index) => 
      `Issue ${index + 1}:
      Title: ${issue.title}
      Description: ${issue.description || issue.body || 'No description'}
      Labels: ${issue.labels?.map(l => l.name || l).join(', ') || 'None'}
      Repository: ${issue.repository?.name || 'Unknown'}
      Language: ${issue.repository?.language || 'Not specified'}
      Bounty: $${issue.bounty_amount || 0}`
    ).join('\n\n');

    return `You are an expert developer consultant helping to match developers with suitable GitHub issues.

Developer Profile:
- Skills: ${skills.join(', ')}
- Experience Level: ${experience}
- Preferred Technologies: ${preferences.technologies?.join(', ') || 'Any'}
- Preferred Issue Types: ${preferences.issueTypes?.join(', ') || 'Any'}
- Time Availability: ${preferences.timeCommitment || 'Flexible'}

Available Issues:
${issuesText}

Please analyze each issue and provide recommendations in this exact JSON format:
{
  "recommendations": [
    {
      "issueIndex": 0,  
      "matchScore": 85,
      "reasoning": "Detailed explanation of why this is a good match",
      "skillsMatch": ["React", "TypeScript"],
      "difficultyLevel": "intermediate",
      "estimatedHours": 8,
      "learningOpportunities": ["New CSS Grid techniques"],
      "risks": ["Requires knowledge of older React patterns"]
    }
  ]
}

Scoring criteria:
- 90-100: Perfect match, developer is highly qualified
- 70-89: Good match, minor skill gaps
- 50-69: Moderate match, some learning required
- 30-49: Challenging match, significant skill development needed
- 0-29: Poor match, not recommended

Provide realistic assessments and highlight both opportunities and challenges.`;
  }

  /**
   * Parse AI response and match with original issues
   */
  parseAISuggestions(aiResponse, originalIssues) {
    try {
      // Extract JSON from AI response
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in AI response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      const recommendations = parsed.recommendations || [];

      return recommendations.map(rec => {
        const issue = originalIssues[rec.issueIndex];
        if (!issue) return null;

        return {
          ...issue,
          aiAnalysis: {
            matchScore: rec.matchScore,
            reasoning: rec.reasoning,
            skillsMatch: rec.skillsMatch || [],
            difficultyLevel: rec.difficultyLevel || 'unknown',
            estimatedHours: rec.estimatedHours || 0,
            learningOpportunities: rec.learningOpportunities || [],
            risks: rec.risks || [],
            recommendation: this.getRecommendationLevel(rec.matchScore)
          }
        };
      }).filter(Boolean).sort((a, b) => b.aiAnalysis.matchScore - a.aiAnalysis.matchScore);

    } catch (error) {
      console.error('Failed to parse AI suggestions:', error);
      return this.fallbackAnalysis(originalIssues);
    }
  }

  /**
   * Fallback analysis when AI fails
   */
  fallbackAnalysis(issues, developerProfile = {}) {
    const { skills = [] } = developerProfile;
    
    return issues.map(issue => {
      const matchingSkills = this.findMatchingSkills(issue, skills);
      const score = this.calculateFallbackScore(issue, matchingSkills, skills);

      return {
        ...issue,
        aiAnalysis: {
          matchScore: score,
          reasoning: `Based on skill matching: ${matchingSkills.length}/${skills.length} skills match`,
          skillsMatch: matchingSkills,
          difficultyLevel: 'unknown',
          estimatedHours: Math.ceil((issue.bounty_amount || 100) / 25), // Rough estimate
          learningOpportunities: [],
          risks: [],
          recommendation: this.getRecommendationLevel(score),
          fallback: true
        }
      };
    }).sort((a, b) => b.aiAnalysis.matchScore - a.aiAnalysis.matchScore);
  }

  /**
   * Find matching skills between issue and developer
   */
  findMatchingSkills(issue, developerSkills) {
    const issueSkills = [
      ...(issue.tech_stack || []),
      ...(issue.labels?.map(l => l.name || l) || []),
      issue.repository?.language
    ].filter(Boolean).map(s => s.toLowerCase());

    return developerSkills.filter(skill => 
      issueSkills.some(issueSkill => 
        issueSkill.includes(skill.toLowerCase()) || 
        skill.toLowerCase().includes(issueSkill)
      )
    );
  }

  /**
   * Calculate fallback score
   */
  calculateFallbackScore(issue, matchingSkills, allSkills) {
    const skillsRatio = allSkills.length > 0 ? matchingSkills.length / allSkills.length : 0;
    const bountyBonus = Math.min((issue.bounty_amount || 0) / 1000 * 10, 20); // Max 20 points for bounty
    const baseScore = skillsRatio * 60 + bountyBonus + 20; // Base 20 points
    
    return Math.min(Math.round(baseScore), 100);
  }

  /**
   * Get recommendation level based on score
   */
  getRecommendationLevel(score) {
    if (score >= 90) return 'highly-recommended';
    if (score >= 70) return 'recommended';
    if (score >= 50) return 'consider';
    if (score >= 30) return 'challenging';
    return 'not-recommended';
  }

  /**
   * Generate cache key
   */
  generateCacheKey(issues, profile) {
    const issueIds = issues.map(i => i.id).sort().join(',');
    const profileHash = JSON.stringify(profile);
    return `${issueIds}-${btoa(profileHash)}`;
  }

  /**
   * Fetch GitHub issue details
   */
  async fetchGitHubIssues(repositories, accessToken) {
    try {
      const allIssues = [];
      
      for (const repo of repositories) {
        const [owner, repoName] = repo.github_repo_url
          .replace('https://github.com/', '')
          .split('/');
          
        const response = await fetch(
          `https://api.github.com/repos/${owner}/${repoName}/issues?state=open&per_page=50`,
          {
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Accept': 'application/vnd.github.v3+json'
            }
          }
        );

        if (response.ok) {
          const issues = await response.json();
          allIssues.push(...issues.map(issue => ({
            ...issue,
            repository: {
              name: repoName,
              owner: owner,
              language: repo.language,
              url: repo.github_repo_url
            },
            bounty_amount: this.estimateBountyFromLabels(issue.labels)
          })));
        }
      }

      return allIssues;
    } catch (error) {
      console.error('Failed to fetch GitHub issues:', error);
      return [];
    }
  }

  /**
   * Estimate bounty amount from issue labels
   */
  estimateBountyFromLabels(labels = []) {
    const bountyLabels = labels.filter(label => 
      label.name.toLowerCase().includes('bounty') || 
      label.name.toLowerCase().includes('reward')
    );

    if (bountyLabels.length > 0) {
      const amounts = bountyLabels.map(label => {
        const match = label.name.match(/\$?(\d+)/);
        return match ? parseInt(match[1]) : 0;
      });
      return Math.max(...amounts);
    }

    // Default bounty estimation based on labels
    const difficultyLabels = labels.map(l => l.name.toLowerCase());
    if (difficultyLabels.includes('hard') || difficultyLabels.includes('complex')) return 500;
    if (difficultyLabels.includes('medium')) return 300;
    if (difficultyLabels.includes('easy') || difficultyLabels.includes('good first issue')) return 100;
    
    return 250; // Default bounty
  }
}

export default new AIIssueAnalyzer();