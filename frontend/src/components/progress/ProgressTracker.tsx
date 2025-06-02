// components/progress/ProgressTracker.tsx
import React from 'react';
import { GitBranch, Database, FileCode, Activity, Code, Zap, Globe } from 'lucide-react';
import type { ProgressData } from '../../types/analysis';

interface ProgressTrackerProps {
  progress: ProgressData;
}

export const ProgressTracker: React.FC<ProgressTrackerProps> = ({ progress }) => {
  const getStageIcon = (stage: string) => {
    switch (stage) {
      case 'fetching_repos': return <GitBranch className="w-5 h-5" />;
      case 'fetching_repo_data': return <Database className="w-5 h-5" />;
      case 'fetching_file_tree': return <FileCode className="w-5 h-5" />;
      case 'categorizing_files': return <Activity className="w-5 h-5" />;
      case 'analyzing_code': return <Code className="w-5 h-5" />;
      case 'ai_analysis': return <Zap className="w-5 h-5" />;
      default: return <Globe className="w-5 h-5" />;
    }
  };

  return (
    <div className="border rounded-sm shadow-lg p-6">
      <div className="flex items-center gap-3 mb-4">
        {getStageIcon(progress.stage)}
        <div>
          <div className="font-medium text-gray-400">{progress.message}</div>
          {progress.details && (
            <div className="text-sm text-gray-300">
              {progress.details.repoName && `Repository: ${progress.details.repoName}`}
              {progress.details.totalFiles && ` • Files: ${progress.details.totalFiles}`}
            </div>
          )}
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
          style={{ width: `${progress.progress}%` }}
        ></div>
      </div>
      <div className="text-sm text-gray-600 mt-2">{progress.progress}% complete</div>
    </div>
  );
};