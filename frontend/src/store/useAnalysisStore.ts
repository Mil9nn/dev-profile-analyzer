import { create } from 'zustand';

export const useAppStore = create((set) => ({
  // Resume data
  resumeData: null,
  setResumeData: (data) => set({ resumeData: data }),

  // Loading state
  loading: false,
  setLoading: (value) => set({ loading: value }),

  // Error state
  error: null,
  setError: (value) => set({ error: value }),

  // Progress tracking
  progress: { step: '', progress: 0, message: '' },
  setProgress: (newProgress) => set({ progress: newProgress }),

  // Print mode
  isPrintMode: false,
  setIsPrintMode: (value) => set({ isPrintMode: value }),
}));
