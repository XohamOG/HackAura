import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { 
  User, 
  Settings, 
  Plus, 
  X, 
  Download, 
  Upload, 
  RotateCcw,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Clock,
  Code,
  Target
} from "lucide-react";
import { motion } from "framer-motion";
import developerProfileService from "../../services/developerProfileService";

const DeveloperProfileSettings = ({ onProfileUpdate }) => {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  const [newTechnology, setNewTechnology] = useState('');
  const [completeness, setCompleteness] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = () => {
    const currentProfile = developerProfileService.getProfile();
    setProfile(currentProfile);
    setCompleteness(developerProfileService.getProfileCompleteness(currentProfile));
  };

  const saveProfile = () => {
    if (developerProfileService.saveProfile(profile)) {
      setIsEditing(false);
      loadProfile();
      onProfileUpdate?.(profile);
    }
  };

  const addSkill = () => {
    if (newSkill.length > 2 && !profile.skills.includes(newSkill)) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill]
      }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const addTechnology = () => {
    if (newTechnology.length > 1 && !profile.preferences.technologies.includes(newTechnology)) {
      setProfile(prev => ({
        ...prev,
        preferences: {
          ...prev.preferences,
          technologies: [...prev.preferences.technologies, newTechnology]
        }
      }));
      setNewTechnology('');
    }
  };

  const removeTechnology = (tech) => {
    setProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        technologies: prev.preferences.technologies.filter(t => t !== tech)
      }
    }));
  };

  const toggleIssueType = (type) => {
    const current = profile.preferences.issueTypes;
    const updated = current.includes(type) 
      ? current.filter(t => t !== type)
      : [...current, type];
    
    setProfile(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        issueTypes: updated
      }
    }));
  };

  const exportProfile = () => {
    developerProfileService.exportProfile();
  };

  const importProfile = (event) => {
    const file = event.target.files[0];
    if (file) {
      developerProfileService.importProfile(file)
        .then(importedProfile => {
          setProfile(importedProfile);
          loadProfile();
          onProfileUpdate?.(importedProfile);
        })
        .catch(error => {
          alert('Failed to import profile: ' + error.message);
        });
    }
  };

  const resetProfile = () => {
    if (confirm('Are you sure you want to reset your profile? This cannot be undone.')) {
      const defaultProfile = developerProfileService.resetProfile();
      setProfile(defaultProfile);
      loadProfile();
      onProfileUpdate?.(defaultProfile);
    }
  };

  if (!profile) return null;

  const experienceLevels = developerProfileService.getExperienceLevels();
  const commonTechnologies = developerProfileService.getCommonTechnologies();
  const issueTypes = developerProfileService.getCommonIssueTypes();

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
            <User className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Developer Profile</h2>
            <p className="text-muted-foreground">
              Customize your skills and preferences for better AI recommendations
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsEditing(!isEditing)}
          >
            <Settings className="w-4 h-4 mr-1" />
            {isEditing ? 'Cancel' : 'Edit'}
          </Button>
          {isEditing && (
            <Button size="sm" onClick={saveProfile}>
              <CheckCircle className="w-4 h-4 mr-1" />
              Save
            </Button>
          )}
        </div>
      </motion.div>

      {/* Profile Completeness */}
      {completeness && (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <Card className={`border-2 ${
            completeness.isComplete ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'
          }`}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                {completeness.isComplete ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">
                      Profile Completeness: {completeness.score}%
                    </span>
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all ${
                          completeness.isComplete ? 'bg-green-500' : 'bg-yellow-500'
                        }`}
                        style={{ width: `${completeness.score}%` }}
                      />
                    </div>
                  </div>
                  {!completeness.isComplete && completeness.missing.length > 0 && (
                    <p className="text-sm text-muted-foreground">
                      Missing: {completeness.missing.join(', ')}
                    </p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="w-5 h-5" />
              Technical Skills
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {profile.skills.map(skill => (
                <Badge key={skill} variant="secondary" className="flex items-center gap-1">
                  {skill}
                  {isEditing && (
                    <X 
                      className="w-3 h-3 cursor-pointer hover:text-red-500" 
                      onClick={() => removeSkill(skill)}
                    />
                  )}
                </Badge>
              ))}
            </div>
            
            {isEditing && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill..."
                  className="flex-1 px-3 py-2 border rounded-md"
                  onKeyPress={(e) => e.key === 'Enter' && addSkill()}
                />
                <Button size="sm" onClick={addSkill}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}

            {isEditing && (
              <div className="space-y-2">
                <p className="text-sm font-medium">Suggested Skills:</p>
                <div className="flex flex-wrap gap-1">
                  {commonTechnologies.filter(tech => !profile.skills.includes(tech)).slice(0, 10).map(tech => (
                    <Button
                      key={tech}
                      variant="outline"
                      size="sm"
                      className="text-xs h-6"
                      onClick={() => {
                        setProfile(prev => ({
                          ...prev,
                          skills: [...prev.skills, tech]
                        }));
                      }}
                    >
                      + {tech}
                    </Button>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Experience Level */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Experience Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-3">
                {experienceLevels.map(level => (
                  <label key={level.value} className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="radio"
                      name="experience"
                      value={level.value}
                      checked={profile.experience === level.value}
                      onChange={(e) => setProfile(prev => ({ ...prev, experience: e.target.value }))}
                      className="mt-1"
                    />
                    <div>
                      <div className="font-medium">{level.label}</div>
                      <div className="text-sm text-muted-foreground">{level.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            ) : (
              <div>
                <Badge variant="outline" className="text-sm">
                  {experienceLevels.find(l => l.value === profile.experience)?.label || profile.experience}
                </Badge>
                <p className="text-sm text-muted-foreground mt-2">
                  {experienceLevels.find(l => l.value === profile.experience)?.description}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preferred Technologies */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Preferred Technologies
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {profile.preferences.technologies.map(tech => (
                <Badge key={tech} className="flex items-center gap-1">
                  {tech}
                  {isEditing && (
                    <X 
                      className="w-3 h-3 cursor-pointer hover:text-red-200" 
                      onClick={() => removeTechnology(tech)}
                    />
                  )}
                </Badge>
              ))}
            </div>
            
            {isEditing && (
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTechnology}
                  onChange={(e) => setNewTechnology(e.target.value)}
                  placeholder="Add preferred technology..."
                  className="flex-1 px-3 py-2 border rounded-md"
                  onKeyPress={(e) => e.key === 'Enter' && addTechnology()}
                />
                <Button size="sm" onClick={addTechnology}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Issue Type Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Issue Type Preferences
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {issueTypes.map(type => (
                <label key={type} className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={profile.preferences.issueTypes.includes(type)}
                    onChange={() => isEditing && toggleIssueType(type)}
                    disabled={!isEditing}
                  />
                  <span className="capitalize">{type.replace('/', ' / ')}</span>
                </label>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Time Commitment */}
        <Card>
          <CardHeader>
            <CardTitle>Time Commitment</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <select
                value={profile.preferences.timeCommitment}
                onChange={(e) => setProfile(prev => ({
                  ...prev,
                  preferences: { ...prev.preferences, timeCommitment: e.target.value }
                }))}
                className="w-full px-3 py-2 border rounded-md"
              >
                <option value="flexible">Flexible</option>
                <option value="part-time">Part-time (10-20 hours/week)</option>
                <option value="full-time">Full-time (40+ hours/week)</option>
                <option value="weekend">Weekends only</option>
                <option value="evening">Evenings only</option>
              </select>
            ) : (
              <Badge variant="outline" className="capitalize">
                {profile.preferences.timeCommitment.replace('-', ' ')}
              </Badge>
            )}
          </CardContent>
        </Card>

        {/* Bounty Range */}
        <Card>
          <CardHeader>
            <CardTitle>Preferred Bounty Range</CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Minimum Bounty: ${profile.preferences.minBounty}</label>
                  <input
                    type="range"
                    min="0"
                    max="1000"
                    step="50"
                    value={profile.preferences.minBounty}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, minBounty: parseInt(e.target.value) }
                    }))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Maximum Bounty: ${profile.preferences.maxBounty}</label>
                  <input
                    type="range"
                    min="100"
                    max="10000"
                    step="100"
                    value={profile.preferences.maxBounty}
                    onChange={(e) => setProfile(prev => ({
                      ...prev,
                      preferences: { ...prev.preferences, maxBounty: parseInt(e.target.value) }
                    }))}
                    className="w-full"
                  />
                </div>
              </div>
            ) : (
              <p>${profile.preferences.minBounty} - ${profile.preferences.maxBounty}</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Profile Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button variant="outline" onClick={exportProfile}>
              <Download className="w-4 h-4 mr-1" />
              Export Profile
            </Button>
            
            <label className="inline-flex">
              <Button variant="outline" className="cursor-pointer">
                <Upload className="w-4 h-4 mr-1" />
                Import Profile
              </Button>
              <input
                type="file"
                accept=".json"
                onChange={importProfile}
                className="hidden"
              />
            </label>
            
            <Button variant="outline" onClick={resetProfile} className="text-red-600 hover:text-red-700">
              <RotateCcw className="w-4 h-4 mr-1" />
              Reset Profile
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeveloperProfileSettings;