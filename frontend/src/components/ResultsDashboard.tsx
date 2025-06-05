import React from 'react';
import { motion } from 'framer-motion';
import { useAnalysisStore } from '../store/useAnalysisStore';
import { Star, Code, GitBranch, Award, TrendingUp, Download } from 'lucide-react';

const ResultsDashboard = () => {
  const { analysisResult, reset } = useAnalysisStore();

  if (!analysisResult) return null;

  const { skillAnalysis } = analysisResult.data;

  const generateResume = () => {
    const resumeData = {
      developer: analysisResult.data.username,
      skills: skillAnalysis,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(resumeData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${analysisResult.data.username}_skill_analysis.json`;
    a.click();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">
              Analysis Results for @{analysisResult.data.username}
            </h2>
            <p className="text-purple-200">AI-powered developer skill assessment</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={generateResume}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
            <button
              onClick={reset}
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              New Analysis
            </button>
          </div>
        </div>

        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-blue-500/20 rounded-xl p-4 border border-blue-500/30">
            <div className="flex items-center gap-3 mb-2">
              <GitBranch className="w-6 h-6 text-blue-400" />
              <span className="text-blue-200">Repositories</span>
            </div>
            <p className="text-2xl font-bold text-white">{skillAnalysis.totalRepos}</p>
          </div>
          
          <div className="bg-yellow-500/20 rounded-xl p-4 border border-yellow-500/30">
            <div className="flex items-center gap-3 mb-2">
              <Star className="w-6 h-6 text-yellow-400" />
              <span className="text-yellow-200">Total Stars</span>
            </div>
            <p className="text-2xl font-bold text-white">{skillAnalysis.totalStars}</p>
          </div>
          
          <div className="bg-green-500/20 rounded-xl p-4 border border-green-500/30">
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-6 h-6 text-green-400" />
              <span className="text-green-200">Skill Score</span>
            </div>
            <p className="text-2xl font-bold text-white">{skillAnalysis.averageScore.toFixed(1)}/10</p>
          </div>
          
          <div className="bg-purple-500/20 rounded-xl p-4 border border-purple-500/30">
            <div className="flex items-center gap-3 mb-2">
              <Code className="w-6 h-6 text-purple-400" />
              <span className="text-purple-200">Languages</span>
            </div>
            <p className="text-2xl font-bold text-white">{skillAnalysis.languages.length}</p>
          </div>
        </div>

        {/* Languages */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-white mb-4">Programming Languages</h3>
          <div className="flex flex-wrap gap-2">
            {skillAnalysis.languages.map((lang, index) => (
              <span
                key={index}
                className="bg-purple-600/30 text-purple-200 px-3 py-1 rounded-full text-sm border border-purple-500/30"
              >
                {lang}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Repository Analysis */}
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
        <h3 className="text-2xl font-bold text-white mb-6">Repository Analysis</h3>
        <div className="space-y-4">
          {skillAnalysis.repositories.map((repo, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 rounded-xl p-6 border border-white/10"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-bold text-white">{repo.repository}</h4>
                  <p className="text-purple-200">{repo.language}</p>
                </div>
                <div className="flex items-center gap-2 text-yellow-400">
                  <Star className="w-4 h-4" />
                  <span>{repo.stars}</span>
                </div>
              </div>
              
              {repo.analysis && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-gray-300 text-sm mb-1">Code Quality</p>
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-red-500 to-green-500 h-2 rounded-full"
                          style={{ width: `${(repo.analysis.codeQuality || 5) * 10}%` }}
                        />
                      </div>
                      <span className="text-white text-sm">{repo.analysis.codeQuality || 5}/10</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-gray-300 text-sm mb-1">Skill Level</p>
                    <span className="bg-blue-600/30 text-blue-200 px-2 py-1 rounded text-sm">
                      {repo.analysis.skillLevel || 'Intermediate'}
                    </span>
                  </div>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default ResultsDashboard;