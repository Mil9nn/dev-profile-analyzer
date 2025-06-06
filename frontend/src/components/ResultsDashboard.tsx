import { motion } from 'framer-motion';
import { useAnalysisStore } from '../store/useAnalysisStore';
import { Star, Code, GitBranch, Award, TrendingUp, Download, ExternalLink } from 'lucide-react';

const ResultsDashboard = () => {
  const { analysisResult, reset } = useAnalysisStore();

  if (!analysisResult?.data) return null;

  // Extract data from the actual structure
  const { skillAnalysis, resumeData } = analysisResult.data;
  
  // Calculate metrics from the actual data
  const totalRepos = skillAnalysis?.length || 0;
  const totalStars = skillAnalysis?.reduce((sum, repo) => sum + (repo.stars || 0), 0) || 0;
  const languages = [...new Set(skillAnalysis?.map(repo => repo.language).filter(Boolean))] || [];
  const averageScore = skillAnalysis?.length > 0 
    ? skillAnalysis.reduce((sum, repo) => sum + (repo.insights?.innovationScore || 5), 0) / skillAnalysis.length 
    : 0;

  const generateResume = () => {
    const resumeData = {
      developer: resumeData?.personalInfo?.name || 'Developer',
      skills: skillAnalysis,
      resumeData: resumeData,
      timestamp: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(resumeData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${resumeData.developer.replace(/\s+/g, '_')}_skill_analysis.json`;
    a.click();
    URL.revokeObjectURL(url);
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
              Analysis Results for @{resumeData?.personalInfo?.githubUsername || 'Developer'}
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
            <p className="text-2xl font-bold text-white">{totalRepos}</p>
          </div>
          
          <div className="bg-yellow-500/20 rounded-xl p-4 border border-yellow-500/30">
            <div className="flex items-center gap-3 mb-2">
              <Star className="w-6 h-6 text-yellow-400" />
              <span className="text-yellow-200">Total Stars</span>
            </div>
            <p className="text-2xl font-bold text-white">{totalStars}</p>
          </div>
          
          <div className="bg-green-500/20 rounded-xl p-4 border border-green-500/30">
            <div className="flex items-center gap-3 mb-2">
              <Award className="w-6 h-6 text-green-400" />
              <span className="text-green-200">Avg Innovation</span>
            </div>
            <p className="text-2xl font-bold text-white">{averageScore.toFixed(1)}/10</p>
          </div>
          
          <div className="bg-purple-500/20 rounded-xl p-4 border border-purple-500/30">
            <div className="flex items-center gap-3 mb-2">
              <Code className="w-6 h-6 text-purple-400" />
              <span className="text-purple-200">Languages</span>
            </div>
            <p className="text-2xl font-bold text-white">{languages.length}</p>
          </div>
        </div>

        {/* Languages */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-white mb-4">Programming Languages</h3>
          <div className="flex flex-wrap gap-2">
            {languages.map((lang, index) => (
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
          {skillAnalysis?.map((repo, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white/5 rounded-xl p-6 border border-white/10"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h4 className="text-lg font-bold text-white">{repo.name}</h4>
                  <p className="text-purple-200 mb-1">{repo.language}</p>
                  {repo.description && (
                    <p className="text-gray-300 text-sm">{repo.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-yellow-400">
                    <Star className="w-4 h-4" />
                    <span>{repo.stars}</span>
                  </div>
                  <a
                    href={repo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-purple-600/30 hover:bg-purple-600/50 text-purple-200 p-2 rounded-lg transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
              
              {repo.insights && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-gray-300 text-sm mb-1">Innovation Score</p>
                    <div className="flex items-center gap-2">
                      <div className="w-full bg-white/10 rounded-full h-2">
                        <div
                          className="bg-gradient-to-r from-orange-500 to-red-500 h-2 rounded-full"
                          style={{ width: `${repo.insights.innovationScore * 10}%` }}
                        />
                      </div>
                      <span className="text-white text-sm">{repo.insights.innovationScore}/10</span>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-gray-300 text-sm mb-1">Skill Level</p>
                    <span className={`px-2 py-1 rounded text-sm ${
                      repo.insights.skillLevel === 'Expert' ? 'bg-red-600/30 text-red-200' :
                      repo.insights.skillLevel === 'Advanced' ? 'bg-orange-600/30 text-orange-200' :
                      repo.insights.skillLevel === 'Intermediate' ? 'bg-yellow-600/30 text-yellow-200' :
                      'bg-green-600/30 text-green-200'
                    }`}>
                      {repo.insights.skillLevel}
                    </span>
                  </div>

                  <div>
                    <p className="text-gray-300 text-sm mb-1">Industry Relevance</p>
                    <span className="bg-purple-600/30 text-purple-200 px-2 py-1 rounded text-sm">
                      {repo.insights.industryRelevance}
                    </span>
                  </div>
                </div>
              )}

              {repo.insights?.technicalSkills && repo.insights.technicalSkills.length > 0 && (
                <div className="mt-4">
                  <p className="text-gray-300 text-sm mb-2">Technical Skills:</p>
                  <div className="flex flex-wrap gap-2">
                    {repo.insights.technicalSkills.map((skill, skillIndex) => (
                      <span
                        key={skillIndex}
                        className="bg-blue-600/30 text-blue-200 px-2 py-1 rounded text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          )) || (
            <div className="text-center text-gray-400 py-8">
              <p>No repository analysis data available</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default ResultsDashboard;