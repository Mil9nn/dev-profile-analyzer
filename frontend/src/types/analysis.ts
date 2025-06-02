// types/analysis.ts
export interface FormData {
  githubProfile: string;
  linkedinProfile: string;
  repositories: string[];
}

export interface ProgressData {
  stage: string;
  message: string;
  progress: number;
  details?: any;
  error?: boolean;
}

export interface AnalysisResult {
  score: number;
  codeQualityBreakdown: {
    architecture: number;
    implementation: number;
    bestPractices: number;
    complexity: number;
  };
  rationale: string[];
  technologies: string[];
  strengths: string[];
  weaknesses: string[];
  improvements: string[];
  codeMetrics: {
    totalFiles: number;
    avgComplexity: number;
    avgFileSize: number;
    techStackDiversity: number;
  };
  hiringPotential: {
    level: string;
    details: string;
    watchAreas: string[];
    readiness: string;
  };
  conclusion: string;
}