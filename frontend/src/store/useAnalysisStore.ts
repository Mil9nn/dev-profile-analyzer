import { create } from 'zustand';

export const useAnalysisStore = create((set, get) => ({
  // State
  username: '',
  isAnalyzing: false,
  progress: 0,
  currentStep: '',
  currentMessage: '',
  analysisResult: null,
  error: null,
  socket: null,

  // Actions
  setUsername: (username) => set({ username }),
  
  setSocket: (socket) => set({ socket }),
  
  startAnalysis: () => set({ 
    isAnalyzing: true, 
    progress: 0, 
    error: null,
    analysisResult: null 
  }),
  
  updateProgress: (step, progress, message) => set({ 
    currentStep: step, 
    progress, 
    currentMessage: message 
  }),
  
  setAnalysisResult: (result) => set({ 
    analysisResult: result, 
    isAnalyzing: false, 
    progress: 100 
  }),
  
  setError: (error) => set({ 
    error, 
    isAnalyzing: false 
  }),
  
  reset: () => set({ 
    progress: 0, 
    currentStep: '', 
    currentMessage: '', 
    analysisResult: null, 
    error: null, 
    isAnalyzing: false 
  })
}));