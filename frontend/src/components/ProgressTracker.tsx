// frontend/src/components/ProgressTracker.tsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Github, Code, Brain, FileCheck, AlertCircle } from 'lucide-react';

interface ProgressData {
  step: string;
  progress: number;
  message: string;
}

interface ProgressTrackerProps {
  isAnalyzing: boolean;
  progress: ProgressData;
  error?: string | null;
}

const ProgressTracker: React.FC<ProgressTrackerProps> = ({ 
  isAnalyzing, 
  progress, 
  error 
}) => {
  const steps = [
    { 
      key: 'fetching', 
      label: 'Fetching Repos', 
      icon: Github,
      description: 'Collecting repository data...'
    },
    { 
      key: 'analyzing', 
      label: 'Analyzing Code', 
      icon: Code,
      description: 'Examining code structure...'
    },
    { 
      key: 'generating', 
      label: 'AI Processing', 
      icon: Brain,
      description: 'Generating insights...'
    },
    { 
      key: 'complete', 
      label: 'Complete', 
      icon: FileCheck,
      description: 'Analysis finished!'
    }
  ];

  const getCurrentStepIndex = () => {
    return steps.findIndex(step => step.key === progress.step);
  };

  const currentStepIndex = getCurrentStepIndex();

  if (!isAnalyzing && !error && progress.step !== 'complete') {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="w-full max-w-2xl mx-auto"
      >
        <div className="bg-zinc-900/95 backdrop-blur-lg rounded-xl p-8 border border-zinc-700 shadow-2xl">
          {error ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/30">
                <AlertCircle className="w-8 h-8 text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-red-400 mb-2">Analysis Failed</h3>
              <p className="text-red-300 text-sm">{error}</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-white">
                  {progress.step === 'complete' ? 'Analysis Complete!' : 'Analyzing Your Profile'}
                </h3>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-400">
                    {Math.round(progress.progress)}%
                  </div>
                  <div className="text-sm text-zinc-400">Progress</div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mb-8">
                <div className="flex justify-between text-sm text-purple-200 mb-3">
                  <span className="font-medium">{progress.message}</span>
                </div>
                <div className="w-full bg-zinc-800 rounded-full h-3 overflow-hidden">
                  <motion.div
                    className="bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 h-full rounded-full relative"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress.progress}%` }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                  >
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                      animate={{ x: [-100, 300] }}
                      transition={{ 
                        repeat: Infinity, 
                        duration: 2, 
                        ease: "easeInOut",
                        repeatDelay: 1
                      }}
                      style={{ width: '100px' }}
                    />
                  </motion.div>
                </div>
              </div>

              {/* Step Indicators */}
              <div className="grid grid-cols-4 gap-4">
                {steps.map((step, index) => {
                  const isActive = progress.step === step.key;
                  const isCompleted = currentStepIndex > index || progress.step === 'complete';
                  const Icon = step.icon;

                  return (
                    <div key={step.key} className="text-center">
                      <motion.div
                        className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 border-2 transition-all duration-300 ${
                          isCompleted
                            ? 'bg-green-500 border-green-400 text-white shadow-lg shadow-green-500/30'
                            : isActive
                            ? 'bg-purple-500 border-purple-400 text-white shadow-lg shadow-purple-500/30'
                            : 'bg-zinc-800 border-zinc-600 text-zinc-400'
                        }`}
                        animate={isActive ? { 
                          scale: [1, 1.1, 1],
                          boxShadow: [
                            '0 0 0 0 rgba(168, 85, 247, 0.4)',
                            '0 0 0 10px rgba(168, 85, 247, 0)',
                            '0 0 0 0 rgba(168, 85, 247, 0)'
                          ]
                        } : {}}
                        transition={{ 
                          repeat: isActive ? Infinity : 0, 
                          duration: 2,
                          ease: "easeInOut"
                        }}
                      >
                        <Icon className="w-6 h-6" />
                      </motion.div>
                      
                      <div>
                        <p className={`text-sm font-medium mb-1 ${
                          isActive ? 'text-white' : isCompleted ? 'text-green-300' : 'text-zinc-400'
                        }`}>
                          {step.label}
                        </p>
                        <p className="text-xs text-zinc-500">
                          {step.description}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Additional Info */}
              {isAnalyzing && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6 text-center"
                >
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/10 rounded-full border border-blue-500/20">
                    <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                    <span className="text-blue-300 text-sm font-medium">
                      This may take 30-60 seconds...
                    </span>
                  </div>
                </motion.div>
              )}
            </>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ProgressTracker;