import { create } from 'zustand';
import { AnalysisService } from '../services/analysisService';
import type { AnalyzeResponse, FormData } from '../types';

export type ProgressStep = {
  id: string;
  label: string;
  status: 'pending' | 'in-progress' | 'completed' | 'error';
  details?: string;
  timestamp?: Date;
};

type AnalysisState = {
  result: AnalyzeResponse | null;
  loading: boolean;
  error: string;
  progress: ProgressStep[];
  currentStep: string | null;
  analyzeProfile: (data: FormData) => Promise<void>;
  reset: () => void;
  updateProgress: (stepId: string, status: ProgressStep['status'], details?: string) => void;
};

const initialProgressSteps: ProgressStep[] = [
  { id: 'validation', label: 'Validating repositories', status: 'pending' },
  { id: 'fetching', label: 'Fetching repository files', status: 'pending' },
  { id: 'parsing', label: 'Parsing code structure', status: 'pending' },
  { id: 'ast-analysis', label: 'Running AST analysis', status: 'pending' },
  { id: 'ai-processing', label: 'Processing with AI', status: 'pending' },
  { id: 'finalizing', label: 'Generating report', status: 'pending' },
];

export const useAnalysisStore = create<AnalysisState>((set, get) => ({
  result: null,
  loading: false,
  error: '',
  progress: initialProgressSteps,
  currentStep: null,

  updateProgress: (stepId: string, status: ProgressStep['status'], details?: string) => {
    set((state) => ({
      progress: state.progress.map(step => 
        step.id === stepId 
          ? { ...step, status, details, timestamp: new Date() }
          : step
      ),
      currentStep: status === 'in-progress' ? stepId : state.currentStep
    }));
  },

  analyzeProfile: async (data: FormData) => {
    const { updateProgress } = get();
    
    set({ 
      loading: true, 
      error: '', 
      result: null, 
      progress: initialProgressSteps.map(step => ({ ...step, status: 'pending' as const })),
      currentStep: null 
    });

    try {
      // Step 1: Validation
      updateProgress('validation', 'in-progress', 'Checking repository URLs...');
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate validation time
      updateProgress('validation', 'completed', 'All repositories validated');

      // Step 2: Fetching
      updateProgress('fetching', 'in-progress', 'Connecting to GitHub API...');
      
      // Enhanced service call with progress tracking
      const response = await AnalysisService.analyzeProfileWithProgress(data, {
        onFetchingFiles: (repoUrl: string, fileCount: number) => {
          updateProgress('fetching', 'in-progress', `Fetched ${fileCount} files from ${repoUrl.split('/').pop()}`);
        },
        onParsingStart: () => {
          updateProgress('fetching', 'completed', 'Files fetched successfully');
          updateProgress('parsing', 'in-progress', 'Analyzing code structure...');
        },
        onASTAnalysis: () => {
          updateProgress('parsing', 'completed', 'Code structure parsed');
          updateProgress('ast-analysis', 'in-progress', 'Running complexity analysis...');
        },
        onAIProcessing: () => {
          updateProgress('ast-analysis', 'completed', 'AST analysis complete');
          updateProgress('ai-processing', 'in-progress', 'AI is evaluating your code...');
        },
        onFinalizing: () => {
          updateProgress('ai-processing', 'completed', 'AI analysis complete');
          updateProgress('finalizing', 'in-progress', 'Preparing your report...');
        }
      });

      updateProgress('finalizing', 'completed', 'Report generated successfully');
      
      set({ result: response, currentStep: null });
    } catch (err: any) {
      const currentStep = get().currentStep;
      if (currentStep) {
        updateProgress(currentStep, 'error', err.message || 'An error occurred');
      }
      
      set({
        error: err.response?.data?.message || err.message || 'Something went wrong.',
      });
    } finally {
      set({ loading: false });
    }
  },

  reset: () => {
    set({
      result: null,
      loading: false,
      error: '',
      progress: initialProgressSteps,
      currentStep: null,
    });
  },
}));