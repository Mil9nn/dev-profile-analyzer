import { useEffect } from 'react';
import { useAnalysisStore } from '@/store/useAnalysisStore';
import InputForm from '../components/InputForm';
import { EmptyState } from '@/components/EmptyState';

interface FormData {
  username: string;
  linkedinUrl: string;
  repositories: string[];
}

const HomePage = () => {
  const {
    resumeData,
    isAnalyzing,
    error,
    progress,
    startAnalysis,
    resetAnalysis,
    initializeSocket,
    disconnectSocket
  } = useAnalysisStore();

  // Initialize socket connection on mount
  useEffect(() => {
    initializeSocket();
    
    // Cleanup socket on unmount
    return () => {
      disconnectSocket();
    };
  }, [initializeSocket, disconnectSocket]);

  const handleAnalyze = async (formData: FormData) => {
    console.log('Starting analysis with data:', formData);
    try {
      await startAnalysis(formData);
    } catch (error) {
      console.error('Analysis failed:', error);
    }
  };

  const handleRetry = () => {
    resetAnalysis();
  };

  // Show loading state during analysis
  if (isAnalyzing) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-xl font-semibold text-white mb-4">Analyzing Your Repositories</h2>
          <div className="w-full bg-zinc-700 rounded-full h-2 mb-4">
            <div
              className="bg-blue-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress.progress}%` }}
            />
          </div>
          <p className="text-sm text-zinc-400 mt-2">{progress.step}: {progress.message}</p>
        </div>
      </div>
    );
  }

  // Show error state with retry option
  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-8">
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-6 mb-6">
          <h3 className="text-red-300 font-semibold mb-2">Analysis Failed</h3>
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={handleRetry}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Try Again
          </button>
        </div>
        <InputForm onSubmit={handleAnalyze} loading={isAnalyzing} error={error} />
      </div>
    );
  }

  // Show resume data if available
  if (resumeData) {
    return (
      <div className="max-w-5xl mx-auto p-4">
        {/* Add your resume display components here */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">Resume Generated Successfully!</h2>
          <p className="text-zinc-400 mb-4">Your developer profile has been analyzed.</p>
          <button
            onClick={handleRetry}
            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Generate Another Resume
          </button>
        </div>
        {/* You can integrate your ResumeAnalyzer component here */}
      </div>
    );
  }

  // Default state - show input form
  return (
    <div className="max-w-5xl mx-auto flex items-center justify-center min-h-screen p-4">
      <div className="w-full">
        <InputForm onSubmit={handleAnalyze} loading={isAnalyzing} error={error} />
        <EmptyState />
      </div>
    </div>
  );
};

export default HomePage;