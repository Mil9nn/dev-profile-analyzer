import { axiosInstance } from '../lib/axios'
import type { AnalyzeResponse, FormData } from '../types'

export type ProgressCallbacks = {
  onFetchingFiles?: (repoUrl: string, fileCount: number) => void;
  onParsingStart?: () => void;
  onASTAnalysis?: () => void;
  onAIProcessing?: () => void;
  onFinalizing?: () => void;
};

export class AnalysisService {
  static async analyzeProfile(data: FormData): Promise<AnalyzeResponse> {
    const response = await axiosInstance.post<AnalyzeResponse>('/analyze', data);
    return response.data;
  }

  static async analyzeProfileWithProgress(
    data: FormData, 
    callbacks: ProgressCallbacks = {}
  ): Promise<AnalyzeResponse> {
    // Simulate progress tracking by adding delays and callbacks
    // In a real implementation, you'd modify the backend to support WebSocket or Server-Sent Events
    
    const { repositories } = data;
    const validRepos = repositories.filter(repo => repo && repo.trim() !== '');
    
    // Simulate file fetching for each repository
    for (let i = 0; i < validRepos.length; i++) {
      const repo = validRepos[i];
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 400));
      
      // Simulate random file counts
      const fileCount = Math.floor(Math.random() * 50) + 10;
      callbacks.onFetchingFiles?.(repo, fileCount);
    }

    // Simulate parsing phase
    await new Promise(resolve => setTimeout(resolve, 600));
    callbacks.onParsingStart?.();

    // Simulate AST analysis
    await new Promise(resolve => setTimeout(resolve, 1000));
    callbacks.onASTAnalysis?.();

    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 800));
    callbacks.onAIProcessing?.();

    // Simulate finalization
    await new Promise(resolve => setTimeout(resolve, 400));
    callbacks.onFinalizing?.();

    // Make the actual API call
    const response = await axiosInstance.post<AnalyzeResponse>('/analyze', data);
    return response.data;
  }
}