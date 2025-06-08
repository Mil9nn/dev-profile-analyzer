import React, { useState } from 'react';
import { Github, Linkedin, Loader2, AlertCircle } from 'lucide-react';

interface FormData {
  username: string;
  linkedinUrl: string;
  repositories: string[];
}

interface InputFormProps {
  onSubmit: (formData: FormData) => void;
  loading: boolean;
  error?: string | null;
}

const InputForm: React.FC<InputFormProps> = ({ onSubmit, loading, error }) => {
  const [formData, setFormData] = useState<FormData>({
    username: '',
    linkedinUrl: '',
    repositories: ['', '', '']
  });

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Validate username
    if (!formData.username.trim()) {
      errors.username = 'GitHub username is required';
    }

    // Validate repositories
    const validRepos = formData.repositories.filter(repo => repo.trim() !== '');
    if (validRepos.length === 0) {
      errors.repositories = 'At least one repository is required';
    }

    // Validate repository URLs
    const invalidRepos = validRepos.filter(repo => {
      const githubUrlPattern = /^https:\/\/github\.com\/[\w\-\.]+\/[\w\-\.]+\/?$/;
      return !githubUrlPattern.test(repo.trim());
    });

    if (invalidRepos.length > 0) {
      errors.repositories = 'Please enter valid GitHub repository URLs';
    }

    // Validate LinkedIn URL if provided
    if (formData.linkedinUrl && formData.linkedinUrl.trim()) {
      const linkedinPattern = /^https:\/\/(www\.)?linkedin\.com\/in\/[\w\-]+\/?$/;
      if (!linkedinPattern.test(formData.linkedinUrl.trim())) {
        errors.linkedinUrl = 'Please enter a valid LinkedIn profile URL';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    const cleanedData = {
      ...formData,
      repositories: formData.repositories.filter(repo => repo.trim() !== '')
    };

    onSubmit(cleanedData);
  };

  const updateRepository = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      repositories: prev.repositories.map((repo, i) => i === index ? value : repo)
    }));
    
    // Clear validation error when user types
    if (validationErrors.repositories) {
      setValidationErrors(prev => ({ ...prev, repositories: '' }));
    }
  };

  const handleUsernameChange = (value: string) => {
    setFormData(prev => ({ ...prev, username: value }));
    if (validationErrors.username) {
      setValidationErrors(prev => ({ ...prev, username: '' }));
    }
  };

  const handleLinkedInChange = (value: string) => {
    setFormData(prev => ({ ...prev, linkedinUrl: value }));
    if (validationErrors.linkedinUrl) {
      setValidationErrors(prev => ({ ...prev, linkedinUrl: '' }));
    }
  };

  return (
    <div className="max-w-2xl w-full mx-auto p-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">
          Analyze Your Developer Profile
        </h2>
        <p className="text-zinc-400">
          Get AI-powered insights on your GitHub repositories and skills
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-red-300 font-medium">Analysis Failed</p>
            <p className="text-red-400 text-sm mt-1">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* GitHub Username */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            <Github className="w-4 h-4 inline mr-2" />
            GitHub Username *
          </label>
          <input
            name="username"
            type="text"
            value={formData.username}
            onChange={(e) => handleUsernameChange(e.target.value)}
            className={`w-full px-4 py-3 bg-zinc-800 border rounded-lg text-white focus:outline-none focus:ring-2 transition-colors ${
              validationErrors.username 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-zinc-600 focus:ring-purple-500'
            }`}
            placeholder="your-github-username"
            disabled={loading}
          />
          {validationErrors.username && (
            <p className="text-red-400 text-sm mt-1">{validationErrors.username}</p>
          )}
        </div>

        {/* LinkedIn URL */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            <Linkedin className="w-4 h-4 inline mr-2" />
            LinkedIn Profile URL (Optional)
          </label>
          <input
            name="url"
            type="url"
            value={formData.linkedinUrl}
            onChange={(e) => handleLinkedInChange(e.target.value)}
            className={`w-full px-4 py-3 bg-zinc-800 border rounded-lg text-white focus:outline-none focus:ring-2 transition-colors ${
              validationErrors.linkedinUrl 
                ? 'border-red-500 focus:ring-red-500' 
                : 'border-zinc-600 focus:ring-purple-500'
            }`}
            placeholder="https://linkedin.com/in/your-profile"
            disabled={loading}
          />
          {validationErrors.linkedinUrl && (
            <p className="text-red-400 text-sm mt-1">{validationErrors.linkedinUrl}</p>
          )}
        </div>

        {/* Repository URLs */}
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            GitHub Repository URLs (your top 3) *
          </label>
          <div className="space-y-3">
            {formData.repositories.map((repo, index) => (
              <input
                name="url"
                key={index}
                type="url"
                value={repo}
                onChange={(e) => updateRepository(index, e.target.value)}
                className={`w-full px-4 py-3 bg-zinc-800 border rounded-lg text-white focus:outline-none focus:ring-2 transition-colors ${
                  validationErrors.repositories 
                    ? 'border-red-500 focus:ring-red-500' 
                    : 'border-zinc-600 focus:ring-purple-500'
                }`}
                placeholder={`https://github.com/username/repository-${index + 1}`}
                disabled={loading}
              />
            ))}
          </div>
          {validationErrors.repositories && (
            <p className="text-red-400 text-sm mt-1">{validationErrors.repositories}</p>
          )}
          <p className="text-zinc-500 text-sm mt-2">
            Add your best repositories to showcase your skills
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 disabled:cursor-not-allowed"
        >
          {loading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Analyzing...
            </>
          ) : (
            'Start Analysis'
          )}
        </button>
      </form>
    </div>
  );
};

export default InputForm;