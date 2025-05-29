import { useEffect, useState } from 'react';
import { CheckCircle, Clock, AlertCircle, Loader2, Code, Brain, FileText, Search, Zap, Target } from 'lucide-react';

type ProgressStep = {
  id: string;
  label: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  details?: string;
  timestamp?: Date;
};

interface EnhancedLoadingStateProps {
  progress: ProgressStep[];
  currentStep: string | null;
}

const stepIcons = {
  validation: Search,
  fetching: FileText,
  parsing: Code,
  'ast-analysis': Zap,
  'ai-processing': Brain,
  finalizing: Target,
};

export function LoadingState({ progress, currentStep }: EnhancedLoadingStateProps) {
  const [dots, setDots] = useState('');
  const [elapsedTime, setElapsedTime] = useState(0);

  // Animate dots for current step
  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  // Track elapsed time
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return mins > 0 ? `${mins}m ${secs}s` : `${secs}s`;
  };

  const getStatusIcon = (step: ProgressStep) => {
    const IconComponent = stepIcons[step.id as keyof typeof stepIcons] || FileText;
    
    switch (step.status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'in-progress':
        return <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />;
      case 'error':
        return <AlertCircle className="w-5 h-5 text-red-400" />;
      default:
        return <IconComponent className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusColor = (step: ProgressStep) => {
    switch (step.status) {
      case 'completed':
        return 'text-green-400 border-green-400/30 bg-green-400/10';
      case 'in-progress':
        return 'text-blue-400 border-blue-400/30 bg-blue-400/10';
      case 'error':
        return 'text-red-400 border-red-400/30 bg-red-400/10';
      default:
        return 'text-gray-500 border-gray-500/30 bg-gray-500/10';
    }
  };

  const completedSteps = progress.filter(step => step.status === 'completed').length;
  const progressPercentage = (completedSteps / progress.length) * 100;

  return (
    <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="relative mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <Brain className="w-8 h-8 text-white animate-pulse" />
          </div>
          <div className="absolute -top-1 -right-1 w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
            <Loader2 className="w-3 h-3 text-white animate-spin" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-white mb-2">Analyzing Your Code</h3>
        <p className="text-slate-400 text-sm">
          AI is evaluating your repositories{dots}
        </p>
      </div>

      {/* Progress Bar */}
      <div className="w-full mb-6">
        <div className="flex justify-between text-xs text-slate-400 mb-2">
          <span>{completedSteps}/{progress.length} steps completed</span>
          <span>{formatTime(elapsedTime)} elapsed</span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* Progress Steps */}
      <div className="w-full space-y-3">
        {progress.map((step, index) => (
          <div 
            key={step.id}
            className={`flex items-start gap-3 p-3 rounded-lg border transition-all duration-300 ${getStatusColor(step)}`}
          >
            <div className="flex-shrink-0 mt-0.5">
              {getStatusIcon(step)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="font-medium text-sm">
                  {step.label}
                  {step.status === 'in-progress' && (
                    <span className="ml-1 text-xs opacity-60">{dots}</span>
                  )}
                </p>
                {step.timestamp && step.status === 'completed' && (
                  <span className="text-xs opacity-60">
                    {step.timestamp.toLocaleTimeString([], { 
                      hour: '2-digit', 
                      minute: '2-digit', 
                      second: '2-digit' 
                    })}
                  </span>
                )}
              </div>
              {step.details && (
                <p className="text-xs opacity-80 mt-1">
                  {step.details}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Fun Facts */}
      <div className="mt-8 p-4 bg-white/5 rounded-lg border border-white/10 w-full">
        <div className="text-center">
          <Clock className="w-5 h-5 text-blue-400 mx-auto mb-2" />
          <p className="text-xs text-slate-400">
            💡 Did you know? Our AI analyzes code complexity, architecture patterns, 
            and best practices to give you comprehensive feedback.
          </p>
        </div>
      </div>

      {/* Estimated time remaining */}
      {currentStep && (
        <div className="mt-4 text-center">
          <p className="text-xs text-slate-500">
            ⏱️ Estimated time remaining: {Math.max(0, 30 - elapsedTime)}s
          </p>
        </div>
      )}
    </div>
  );
}