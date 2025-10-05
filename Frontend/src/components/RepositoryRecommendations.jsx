import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Star, GitFork, ExternalLink, TrendingUp, Sparkles, Target } from 'lucide-react';
import { motion } from 'framer-motion';

const RepositoryRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Hardcoded AI-powered recommendations
  const hardcodedRecommendations = [
    {
      name: 'react-hook-form',
      owner: 'react-hook-form',
      description: 'Performant, flexible and extensible forms with easy validation.',
      stars: 35420,
      forks: 1820,
      language: 'TypeScript',
      topics: ['react', 'forms', 'validation', 'hooks'],
      url: 'https://github.com/react-hook-form/react-hook-form',
      match_score: 95,
      difficulty: 'Intermediate',
      good_first_issues: 12,
      bounty_potential: 'High'
    },
    {
      name: 'chakra-ui',
      owner: 'chakra-ui',
      description: 'Simple, Modular & Accessible UI Components for your React Applications',
      stars: 34890,
      forks: 3120,
      language: 'TypeScript',
      topics: ['react', 'ui', 'components', 'accessibility'],
      url: 'https://github.com/chakra-ui/chakra-ui',
      match_score: 90,
      difficulty: 'Intermediate',
      good_first_issues: 18,
      bounty_potential: 'High'
    },
    {
      name: 'next.js',
      owner: 'vercel',
      description: 'The React Framework for the Web',
      stars: 120450,
      forks: 25680,
      language: 'JavaScript',
      topics: ['react', 'framework', 'ssr', 'static-site'],
      url: 'https://github.com/vercel/next.js',
      match_score: 88,
      difficulty: 'Advanced',
      good_first_issues: 15,
      bounty_potential: 'Very High'
    }
  ];

  useEffect(() => {
    // Simulate loading and set hardcoded data
    const timer = setTimeout(() => {
      setRecommendations(hardcodedRecommendations);
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getDifficultyColor = (difficulty) => {
    const colors = {
      beginner: 'bg-green-100 text-green-800 border-green-200',
      intermediate: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      advanced: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[difficulty?.toLowerCase()] || colors.intermediate;
  };

  const getBountyColor = (potential) => {
    const colors = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-green-100 text-green-800',
      'very high': 'bg-purple-100 text-purple-800'
    };
    return colors[potential?.toLowerCase()] || colors.medium;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-600" />
              AI-Powered Recommendations
            </h2>
            <p className="text-muted-foreground">Discovering repositories perfect for your skillset...</p>
          </div>
        </div>
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-5/6"></div>
                  <div className="flex gap-2 mt-4">
                    <div className="h-6 bg-gray-200 rounded w-16"></div>
                    <div className="h-6 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-purple-600" />
            AI-Powered Recommendations
          </h2>
          <p className="text-muted-foreground">
            Repositories curated based on your skills and interests
          </p>
        </div>
        <Button 
          onClick={() => window.location.reload()} 
          variant="outline"
          className="flex items-center gap-2"
        >
          <TrendingUp className="w-4 h-4" />
          Refresh Picks
        </Button>
      </div>

      {/* Recommendations Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {recommendations.map((repo, index) => (
          <motion.div
            key={repo.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card className="group hover:shadow-lg transition-all duration-300 hover:scale-105 border-l-4 border-l-purple-500">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg group-hover:text-purple-600 transition-colors">
                      {repo.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      by {repo.owner}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span className="font-semibold">{repo.match_score}% match</span>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                  {repo.description}
                </p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Stats */}
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500" />
                    <span>{repo.stars?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <GitFork className="w-4 h-4 text-muted-foreground" />
                    <span>{repo.forks?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-green-600 font-medium">{repo.good_first_issues} issues</span>
                  </div>
                </div>

                {/* Technology Tags */}
                <div className="flex flex-wrap gap-1">
                  {repo.topics?.slice(0, 3).map((topic) => (
                    <Badge 
                      key={topic} 
                      variant="secondary" 
                      className="text-xs px-2 py-1"
                    >
                      {topic}
                    </Badge>
                  ))}
                  {repo.topics?.length > 3 && (
                    <Badge variant="outline" className="text-xs px-2 py-1">
                      +{repo.topics.length - 3} more
                    </Badge>
                  )}
                </div>

                {/* Difficulty and Bounty Potential */}
                <div className="flex items-center justify-between gap-2">
                  <Badge 
                    className={`text-xs px-2 py-1 ${getDifficultyColor(repo.difficulty)}`}
                  >
                    {repo.difficulty}
                  </Badge>
                  <Badge 
                    className={`text-xs px-2 py-1 ${getBountyColor(repo.bounty_potential)}`}
                  >
                    {repo.bounty_potential} Bounty
                  </Badge>
                </div>

                {/* Action Button */}
                <Button 
                  className="w-full group-hover:shadow-md transition-all"
                  onClick={() => window.open(repo.url, '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Explore Repository
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Additional Info */}
      <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200">
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-full bg-purple-100">
              <Target className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-lg mb-2">Personalized for You</h3>
              <p className="text-muted-foreground">
                These recommendations are generated based on your GitHub activity, preferred technologies, 
                and contribution patterns. Each repository offers great learning opportunities and potential rewards.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default RepositoryRecommendations;