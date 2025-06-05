import React from 'react';
import { motion } from 'framer-motion';
import { Github, Search, Sparkles } from 'lucide-react';
import { useAnalysisStore } from '../store/useAnalysisStore';
import axios from 'axios';

const AnalysisForm = () => {
  const { 
    username, 
    setUsername, 
    isAnalyzing, 
    startAnalysis, 
    socket,
    analysisResult 
  } = useAnalysisStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!username.trim() || isAnalyzing) return;

    startAnalysis();

    try {
      const response = await axios.post('http://localhost:5000/api/analyze', 
        { username },
        { headers: { 'socket-id': socket.id } }
      );
    } catch (error) {
      console.error('Analysis failed:', error);
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
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-white text-lg font-medium mb-3">
              GitHub Username
            </label>
            <div className="relative">
              <Github className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                name="url"
                autoComplete='url'
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter GitHub username..."
                className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                disabled={isAnalyzing}
              />
            </div>
          </div>

          <motion.button
            type="submit"
            disabled={!username.trim() || isAnalyzing}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-4 px-8 rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {isAnalyzing ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                Analyze Skills
              </>
            )}
          </motion.button>
        </form>
      </div>
    </motion.div>
  );
};

export default AnalysisForm;
