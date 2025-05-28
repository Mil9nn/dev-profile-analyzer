import { create } from 'zustand';
import { AnalysisService } from '../services/analysisService';
import type { AnalyzeResponse, FormData } from '../types';

type AnalysisState = {
  result: AnalyzeResponse | null;
  loading: boolean;
  error: string;
  analyzeProfile: (data: FormData) => Promise<void>;
  reset: () => void;
};

export const useAnalysisStore = create<AnalysisState>((set) => ({
  result: null,
  loading: false,
  error: '',

  analyzeProfile: async (data: FormData) => {
    set({ loading: true, error: '', result: null });

    try {
      const response = await AnalysisService.analyzeProfile(data);
      set({ result: response });
    } catch (err: any) {
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
    });
  },
}));
