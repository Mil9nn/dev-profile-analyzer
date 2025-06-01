// frontend/src/components/ProgressDisplay.tsx
import { Database, Code, Brain, CheckCircle, AlertCircle } from 'lucide-react'
import { type ProgressUpdate } from '../hooks/useAnalysis'

interface Props {
  progress: ProgressUpdate
}

export function ProgressDisplay({ progress }: Props) {
  const stageConfig = {
    fetching: { 
      icon: <Database className="w-5 h-5 animate-pulse text-blue-400" />,
      title: 'Fetching Repository',
      progress: progress.current && progress.total ? (progress.current / progress.total) * 40 : 0
    },
    fetched: { 
      icon: <CheckCircle className="w-5 h-5 text-green-400" />,
      title: 'Files Retrieved',
      progress: 40
    },
    analyzing: { 
      icon: <Code className="w-5 h-5 animate-pulse text-purple-400" />,
      title: 'Analyzing Code',
      progress: 70
    },
    'ai-processing': { 
      icon: <Brain className="w-5 h-5 animate-pulse text-orange-400" />,
      title: 'AI Evaluation',
      progress: 90
    },
    error: { 
      icon: <AlertCircle className="w-5 h-5 text-red-400" />,
      title: 'Error Occurred',
      progress: 0
    },
    complete: { 
      icon: <CheckCircle className="w-5 h-5 text-green-400" />,
      title: 'Analysis Complete',
      progress: 100
    }
  }

  const config = stageConfig[progress.stage] || stageConfig.fetching

  const getMessage = () => {
    switch (progress.stage) {
      case 'fetching':
        return progress.repo && progress.current && progress.total
          ? `${progress.repo.split('/').pop()} (${progress.current}/${progress.total})`
          : 'Downloading repository files...'
      case 'fetched':
        return `✓ Found ${progress.fileCount || 0} files to analyze`
      case 'analyzing':
        return 'Examining code structure and patterns...'
      case 'ai-processing':
        return 'Generating insights and recommendations...'
      case 'error':
        return progress.error || 'Something went wrong'
      default:
        return 'Processing...'
    }
  }

  return (
    <div className="bg-zinc-800 p-6 rounded-lg border border-zinc-700 max-w-md w-full">
      <div className="flex items-center gap-3 mb-4">
        {config.icon}
        <span className="text-white font-medium">{config.title}</span>
      </div>
      
      <p className="text-slate-300 text-sm mb-4">{getMessage()}</p>
      
      {progress.stage !== 'error' && (
        <div className="space-y-2">
          <div className="bg-zinc-700 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${config.progress}%` }}
            />
          </div>
          <div className="text-xs text-slate-400 text-right">
            {Math.round(config.progress)}%
          </div>
        </div>
      )}
    </div>
  )
}