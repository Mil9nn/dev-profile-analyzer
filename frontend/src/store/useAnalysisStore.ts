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

interface FormData {
  username: string;
  linkedinUrl: string;
  repositories: string[];
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
  startAnalysis: (formData: FormData) => Promise<void>;
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
    const { socket } = get();
    
    // Don't create multiple connections
    if (socket && socket.connected) {
      return;
    }

    console.log('Initializing socket connection...');
    const newSocket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      timeout: 20000,
    });

    set({ socket: newSocket });

    newSocket.on('connect', () => {
      console.log('Socket connected:', newSocket.id);
    });

    newSocket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    newSocket.on('analysisProgress', (data: ProgressData) => {
      console.log('Analysis progress:', data);
      set({ progress: data });
    });

    newSocket.on('analysisComplete', (response) => {
      console.log('Analysis complete:', response);
      if (response.success) {
        set({ 
          resumeData: response.data.resumeData,
          isAnalyzing: false,
          progress: { step: 'complete', progress: 100, message: 'Analysis complete!' },
          error: null
        });
      } else {
        set({ 
          error: response.error || 'Analysis failed',
          isAnalyzing: false,
          progress: { step: 'error', progress: 0, message: 'Analysis failed' }
        });
      }
    });

    newSocket.on('analysisError', (data) => {
      console.log('Analysis error:', data);
      set({ 
        error: data.error || 'Analysis failed',
        isAnalyzing: false,
        progress: { step: 'error', progress: 0, message: 'Analysis failed' }
      });
    });

    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      set({ 
        error: 'Failed to connect to server. Please check if the backend is running.',
        isAnalyzing: false
      });
    });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      console.log('Disconnecting socket...');
      socket.disconnect();
      set({ socket: null });
    }
  },

  // Analysis action
  startAnalysis: async (formData: FormData) => {
    const { socket } = get();
    
    console.log('Starting analysis with form data:', formData);

    try {
      // Reset state
      set({ 
        isAnalyzing: true, 
        error: null, 
        resumeData: null,
        progress: { step: 'starting', progress: 0, message: 'Initializing analysis...' }
      });

      // Ensure socket is connected
      if (!socket || !socket.connected) {
        throw new Error('Socket connection not established. Please refresh the page.');
      }

      const response = await fetch('http://localhost:5000/api/analyze-resume', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'socket-id': socket.id
        },
        body: JSON.stringify(formData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('API response:', result);

      if (!result.success) {
        throw new Error(result.error || 'Analysis failed');
      }

      // Success case is handled by socket events
      // The socket will emit 'analysisComplete' when done
      
    } catch (error) {
      console.error('Analysis error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Analysis failed';
      set({ 
        error: errorMessage,
        isAnalyzing: false,
        progress: { step: 'error', progress: 0, message: 'Analysis failed' }
      });
    }
  },

  resetAnalysis: () => {
    console.log('Resetting analysis state');
    set({ 
      resumeData: null,
      isAnalyzing: false,
      progress: { step: '', progress: 0, message: '' },
      error: null
    });
  }
}));