import { useState } from 'react';
import { motion } from 'framer-motion';
import { Github, Plus, Trash2, Linkedin, Sparkles, User } from 'lucide-react';
import { useAnalysisStore } from '../store/useAnalysisStore';
import axios from 'axios';

const EnhancedAnalysisForm = () => {
  const { 
    isAnalyzing, 
    startAnalysis, 
    socket,
    analysisResult,
    setAnalysisResult,
    setError
  } = useAnalysisStore();

  const [formData, setFormData] = useState({
    username: '',
    repositories: [''],
    linkedinUrl: ''
  });

  const [errors, setErrors] = useState({});

  const validateGitHubUrl = (url) => {
    const githubRegex = /^https:\/\/github\.com\/[a-zA-Z0-9-_]+\/[a-zA-Z0-9-_]+\/?$/;
    return githubRegex.test(url);
  };

  const validateLinkedInUrl = (url) => {
    if (!url) return true; // Optional field
    const linkedinRegex = /^https:\/\/(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9-_]+\/?$/;
    return linkedinRegex.test(url);
  };

  const validateForm = () => {
    const newErrors = {};

    // Username validation
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    }

    // Repository validation
    const validRepos = formData.repositories.filter(repo => repo.trim());
    if (validRepos.length === 0) {
      newErrors.repositories = 'At least one repository is required';
    } else if (validRepos.length > 3) {
      newErrors.repositories = 'Maximum 3 repositories allowed';
    } else {
      validRepos.forEach((repo, index) => {
        if (!validateGitHubUrl(repo)) {
          newErrors[`repo_${index}`] = 'Invalid GitHub repository URL';
        }
      });
    }

    // LinkedIn validation
    if (formData.linkedinUrl && !validateLinkedInUrl(formData.linkedinUrl)) {
      newErrors.linkedinUrl = 'Invalid LinkedIn profile URL';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddRepository = () => {
    if (formData.repositories.length < 3) {
      setFormData({
        ...formData,
        repositories: [...formData.repositories, '']
      });
    }
  };

  const handleRemoveRepository = (index) => {
    if (formData.repositories.length > 1) {
      const newRepos = formData.repositories.filter((_, i) => i !== index);
      setFormData({
        ...formData,
        repositories: newRepos
      });
    }
  };

  const handleRepositoryChange = (index, value) => {
    const newRepos = [...formData.repositories];
    newRepos[index] = value;
    setFormData({
      ...formData,
      repositories: newRepos
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm() || isAnalyzing || !socket) return;

    startAnalysis();

    try {
      const validRepos = formData.repositories.filter(repo => repo.trim());
      
      const response = await axios.post('http://localhost:5000/api/analyze-resume', 
        {
          username: formData.username,
          repositories: validRepos,
          linkedinUrl: formData.linkedinUrl || null
        },
        { headers: { 'socket-id': socket.id } }
      );
      
      if (response.data.success) {
        setAnalysisResult(response.data);
      }
    } catch (error) {
      console.error('Analysis failed:', error);
      setError(error.response?.data?.error || 'Analysis failed');
    }
  };

  if (analysisResult) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="mb-8"
    >
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-2">Create Your Developer Resume</h2>
          <p className="text-purple-200">
            Provide your GitHub repositories (1-3) and optional LinkedIn profile for AI-powered resume generation
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Field */}
          <div>
            <label className="block text-white text-lg font-medium mb-3">
              GitHub Username *
            </label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder="Enter your GitHub username..."
                className={`w-full pl-12 pr-4 py-4 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                  errors.username ? 'border-red-500' : 'border-white/20'
                }`}
                disabled={isAnalyzing}
              />
            </div>
            {errors.username && (
              <p className="text-red-400 text-sm mt-2">{errors.username}</p>
            )}
          </div>

          {/* Repository URLs */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="block text-white text-lg font-medium">
                GitHub Repositories * (1-3 required)
              </label>
              {formData.repositories.length < 3 && (
                <button
                  type="button"
                  onClick={handleAddRepository}
                  className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded-lg flex items-center gap-1 text-sm transition-colors"
                  disabled={isAnalyzing}
                >
                  <Plus className="w-4 h-4" />
                  Add Repo
                </button>
              )}
            </div>
            
            {formData.repositories.map((repo, index) => (
              <div key={index} className="flex gap-3 mb-3">
                <div className="relative flex-1">
                  <Github className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="url"
                    value={repo}
                    onChange={(e) => handleRepositoryChange(index, e.target.value)}
                    placeholder="https://github.com/username/repository"
                    className={`w-full pl-12 pr-4 py-4 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                      errors[`repo_${index}`] ? 'border-red-500' : 'border-white/20'
                    }`}
                    disabled={isAnalyzing}
                  />
                </div>
                {formData.repositories.length > 1 && (
                  <button
                    type="button"
                    onClick={() => handleRemoveRepository(index)}
                    className="bg-red-600 hover:bg-red-700 text-white p-3 rounded-xl transition-colors"
                    disabled={isAnalyzing}
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
            
            {errors.repositories && (
              <p className="text-red-400 text-sm mt-2">{errors.repositories}</p>
            )}
            {Object.keys(errors).some(key => key.startsWith('repo_')) && (
              <p className="text-red-400 text-sm mt-2">Please provide valid GitHub repository URLs</p>
            )}
          </div>

          {/* LinkedIn URL (Optional) */}
          <div>
            <label className="block text-white text-lg font-medium mb-3">
              LinkedIn Profile (Optional)
            </label>
            <div className="relative">
              <Linkedin className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="url"
                value={formData.linkedinUrl}
                onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                placeholder="https://linkedin.com/in/your-profile"
                className={`w-full pl-12 pr-4 py-4 bg-white/5 border rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all ${
                  errors.linkedinUrl ? 'border-red-500' : 'border-white/20'
                }`}
                disabled={isAnalyzing}
              />
            </div>
            {errors.linkedinUrl && (
              <p className="text-red-400 text-sm mt-2">{errors.linkedinUrl}</p>
            )}
          </div>

          <motion.button
            type="submit"
            disabled={isAnalyzing || !socket}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-8 rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Generating Resume...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Generate AI Resume
              </>
            )}
          </motion.button>
        </form>

        <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <h4 className="text-blue-200 font-medium mb-2">What we'll analyze:</h4>
          <ul className="text-blue-100 text-sm space-y-1">
            <li>• Code quality and architecture patterns</li>
            <li>• Technical skills and proficiency levels</li>
            <li>• Project complexity and innovation</li>
            <li>• Professional summary generation</li>
            <li>• Resume-ready project descriptions</li>
          </ul>
        </div>
      </div>
    </motion.div>
  );
};

export default EnhancedAnalysisForm;