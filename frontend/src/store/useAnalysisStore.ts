// frontend/src/store/useAnalysisStore.ts
import { create } from 'zustand';
import { io, Socket } from 'socket.io-client';

interface ProgressData {
  step: string;
  progress: number;
  message: string;
}

interface ResumeData {
  personalInfo: {
    name: string;
    githubUsername: string;
    linkedinUrl?: string;
    professionalSummary: string;
    valueProposition: string;
  };
  skills: {
    core: Record<string, string[]>;
    specializations: string[];
    experienceLevel: string;
  };
  projects: Array<{
    name: string;
    description: string;
    technologies: string[];
    githubUrl: string;
    keyFeatures: string[];
    innovationScore: number;
  }>;
  technicalProfile: {
    totalProjects: number;
    languages: string[];
    avgInnovationScore: number;
    industryStrengths: string[];
  };
}

interface AnalysisStore {
  // Resume data
  resumeData: ResumeData | null;
  setResumeData: (data: ResumeData | null) => void;

  // Loading and progress
  isAnalyzing: boolean;
  setIsAnalyzing: (value: boolean) => void;
  progress: ProgressData;
  setProgress: (progress: ProgressData) => void;

  // Error handling
  error: string | null;
  setError: (error: string | null) => void;

  // Print mode
  isPrintMode: boolean;
  setIsPrintMode: (value: boolean) => void;

  // Socket connection
  socket: Socket | null;
  initializeSocket: () => void;
  disconnectSocket: () => void;

  // Analysis actions
  startAnalysis: (formData: {
    username: string;
    linkedinUrl: string;
    repositories: string[];
  }) => Promise<void>;
  
  resetAnalysis: () => void;
}

export const useAnalysisStore = create<AnalysisStore>((set, get) => ({
  // Initial state
  resumeData: null,
  isAnalyzing: false,
  progress: { step: '', progress: 0, message: '' },
  error: null,
  isPrintMode: false,
  socket: null,

  // Setters
  setResumeData: (data) => set({ resumeData: data }),
  setIsAnalyzing: (value) => set({ isAnalyzing: value }),
  setProgress: (progress) => set({ progress }),
  setError: (error) => set({ error }),
  setIsPrintMode: (value) => set({ isPrintMode: value }),

  // Socket management
  initializeSocket: () => {
    const socket = io('http://localhost:5000');
    set({ socket });

    socket.on('analysisProgress', (data: ProgressData) => {
      set({ progress: data });
    });

    socket.on('analysisComplete', (data) => {
      if (data.success) {
        set({ 
          resumeData: data.data.resumeData,
          isAnalyzing: false,
          progress: { step: 'complete', progress: 100, message: 'Analysis complete!' }
        });
      }
    });

    socket.on('analysisError', (data) => {
      set({ 
        error: data.error,
        isAnalyzing: false,
        progress: { step: 'error', progress: 0, message: 'Analysis failed' }
      });
    });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null });
    }
  },

  // Analysis action
  startAnalysis: async (formData) => {
    const { socket, initializeSocket } = get();
    
    try {
      // Initialize socket if not connected
      if (!socket) {
        initializeSocket();
      }

      set({ 
        isAnalyzing: true, 
        error: null, 
        resumeData: null,
        progress: { step: 'starting', progress: 0, message: 'Initializing analysis...' }
      });

      const response = await fetch('http://localhost:5000/api/analyze-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'socket-id': socket?.id || ''
        },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Analysis failed');
      }

      // Socket will handle the success response
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
      set({ 
        error: errorMessage,
        isAnalyzing: false,
        progress: { step: 'error', progress: 0, message: 'Analysis failed' }
      });
    }
  },

  resetAnalysis: () => {
    set({ 
      resumeData: null,
      isAnalyzing: false,
      progress: { step: '', progress: 0, message: '' },
      error: null
    });
  }
}));