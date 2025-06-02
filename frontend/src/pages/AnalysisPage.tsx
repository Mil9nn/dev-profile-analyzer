// AnalysisPage.tsx
import React, { useState, useEffect } from 'react';
import type { FormData, ProgressData, AnalysisResult } from '../types/analysis.ts';
import { AnalysisForm } from '../components/AnalysisForm';
import { AnalysisResults } from '../components/AnalysisResults';

const AnalysisPage: React.FC = () => {
  const [showForm, setShowForm] = useState(true);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [socket, setSocket] = useState<any>(null);

  useEffect(() => {
    // Initialize socket connection (you'll need to implement socket.io client)
    // const newSocket = io(process.env.REACT_APP_BACKEND_URL || 'http://localhost:5000');
    // setSocket(newSocket);

    // Simulated socket for demo
    const simulatedSocket = {
      id: 'demo-socket-id',
      on: (event: string, callback: Function) => {},
      close: () => {}
    };
    setSocket(simulatedSocket);

    return () => {
      socket?.close();
    };
  }, []);

  const handleSubmit = async (data: FormData) => {
    setIsAnalyzing(true);
    setError(null);
    setProgress({
      stage: 'start',
      message: 'Initializing analysis...',
      progress: 0
    });

    try {
      // Simulate progress updates
      const stages = [
        { stage: 'fetching_repos', message: 'Fetching repositories...', progress: 10 },
        { stage: 'analyzing_code', message: 'Analyzing code files...', progress: 40 },
        { stage: 'ai_analysis', message: 'Running AI analysis...', progress: 80 },
        { stage: 'complete', message: 'Analysis completed!', progress: 100 }
      ];

      for (const stage of stages) {
        await new Promise(resolve => setTimeout(resolve, 1500));
        setProgress(stage);
      }

      // Mock analysis result
      const mockResult: AnalysisResult = {
        score: 7.5,
        codeQualityBreakdown: {
          architecture: 8,
          implementation: 7,
          bestPractices: 7,
          complexity: 8
        },
        rationale: [
          "Well-structured Express.js backend with proper middleware setup",
          "Good use of modern ES6+ features and async/await patterns",
          "Comprehensive error handling and progress tracking implementation"
        ],
        technologies: ["Node.js", "Express.js", "Socket.io", "React", "TypeScript"],
        strengths: [
          "Clean separation of concerns with utility modules",
          "Real-time progress tracking via WebSocket",
          "Comprehensive error handling and validation"
        ],
        weaknesses: [
          "Could benefit from more comprehensive unit tests",
          "Some functions could be broken down further for better maintainability"
        ],
        improvements: [
          "Add comprehensive test coverage",
          "Implement request rate limiting",
          "Add more detailed API documentation"
        ],
        codeMetrics: {
          totalFiles: 15,
          avgComplexity: 3.2,
          avgFileSize: 180,
          techStackDiversity: 8
        },
        hiringPotential: {
          level: "Mid-Level",
          details: "Demonstrates solid understanding of full-stack development with good architectural decisions",
          watchAreas: ["Testing practices", "Performance optimization"],
          readiness: "production-ready"
        },
        conclusion: "Strong technical foundation with room for growth in testing and optimization practices"
      };

      setTimeout(() => {
        setAnalysisResult(mockResult);
        setShowForm(false);
        setIsAnalyzing(false);
        setProgress(null);
      }, 1000);

    } catch (err) {
      setError('Network error. Please try again.');
      setIsAnalyzing(false);
      setProgress(null);
    }
  };

  const handleReset = () => {
    setShowForm(true);
    setAnalysisResult(null);
    setError(null);
    setProgress(null);
  };

  if (showForm) {
    return (
      <AnalysisForm
        onSubmit={handleSubmit}
        isAnalyzing={isAnalyzing}
        error={error}
        progress={progress}
      />
    );
  }

  if (analysisResult) {
    return (
      <AnalysisResults
        result={analysisResult}
        onReset={handleReset}
      />
    );
  }

  return null;
};

export default AnalysisPage;