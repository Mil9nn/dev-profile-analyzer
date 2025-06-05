import React from 'react';
import { motion } from 'framer-motion';
import { useAnalysisStore } from '../store/useAnalysisStore';
import { Github, Code, Brain, FileCheck } from 'lucide-react';

const ProgressTracker = () => {
  const { isAnalyzing, progress, currentStep, currentMessage, analysisResult } = useAnalysisStore();

  if (!isAnalyzing && !analysisResult) return null;

  const steps = [
    { key: 'fetching', label: 'Fetching Repos', icon: Github },
    { key: 'analyzing', label: 'Analyzing Code', icon: Code },
    { key: 'generating', label: 'AI Processing', icon: Brain },
    { key: 'complete', label: 'Complete', icon: FileCheck }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="mb-8"
    >
      <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
        <h3 className="text-2xl font-bold text-white mb-6">Analysis Progress</h3>
        
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between text-sm text-purple-200 mb-2">
            <span>{currentMessage}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-3">
            <motion.div
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-3 rounded-full"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Step Indicators */}
        <div className="grid grid-cols-4 gap-4">
          {steps.map((step, index) => {
            const isActive = currentStep === step.key;
            const isCompleted = steps.findIndex(s => s.key === currentStep) > index;
            const Icon = step.icon;

            return (
              <div key={step.key} className="text-center">
                <motion.div
                  className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-2 ${
                    isCompleted
                      ? 'bg-green-500 text-white'
                      : isActive
                      ? 'bg-purple-500 text-white'
                      : 'bg-white/10 text-gray-400'
                  }`}
                  animate={isActive ? { scale: [1, 1.1, 1] } : {}}
                  transition={{ repeat: Infinity, duration: 2 }}
                >
                  <Icon className="w-6 h-6" />
                </motion.div>
                <p className={`text-sm ${isActive ? 'text-white' : 'text-gray-400'}`}>
                  {step.label}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};

export default ProgressTracker;