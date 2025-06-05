import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import io from 'socket.io-client';
import { useAnalysisStore } from './store/useAnalysisStore';
import AnalysisForm from './components/AnalysisForm';
import ProgressTracker from './components/ProgressTracker';
import ResultsDashboard from './components/ResultsDashboard';
import { Github, Code, TrendingUp } from 'lucide-react';

const App = () => {
  const { socket, setSocket, updateProgress, setAnalysisResult, setError } = useAnalysisStore();

  useEffect(() => {
    // Initialize socket connection
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Socket event listeners
    newSocket.on('analysisProgress', (data) => {
      updateProgress(data.step, data.progress, data.message);
    });

    newSocket.on('analysisComplete', (data) => {
      setAnalysisResult(data);
      toast.success('Analysis completed successfully!');
    });

    newSocket.on('analysisError', (data) => {
      setError(data.error);
      toast.error(`Analysis failed: ${data.error}`);
    });

    return () => {
      newSocket.close();
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-purple-600 rounded-xl">
              <Code className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-5xl font-bold text-white">DevSkill Analyzer</h1>
          </div>
          <p className="text-xl text-purple-200 max-w-2xl mx-auto">
            Analyze your GitHub repositories with AI-powered insights and get detailed skill assessments
          </p>
        </motion.header>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto">
          <AnimatePresence mode="wait">
            <AnalysisForm />
            <ProgressTracker />
            <ResultsDashboard />
          </AnimatePresence>
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="dark"
      />
    </div>
  );
};

export default App;