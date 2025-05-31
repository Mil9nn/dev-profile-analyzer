// frontend/src/components/ProgressDisplay.tsx
import { Database, Code, Brain, CheckCircle, AlertCircle } from 'lucide-react'
import type { Progress } from '../hooks/useAnalysis'

interface Props {
  progress: Progress
}

export function ProgressDisplay({ progress }: Props) {
  const getIcon = () => {
    switch (progress.stage) {
      case 'fetching': return <Database className="w-5 h-5 animate-pulse text-blue-400" />
      case 'fetched': return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'analyzing': return <Code className="w-5 h-5 animate-pulse text-purple-400" />
      case 'ai-processing': return <Brain className="w-5 h-5 animate-pulse text-orange-400" />
      case 'error': return <AlertCircle className="w-5 h-5 text-red-400" />
      default: return <Database className="w-5 h-5 text-gray-400" />
    }
  }

  const getMessage = () => {
    switch (progress.stage) {
      case 'fetching': 
        return `Fetching ${progress.repo} (${progress.current}/${progress.total})`
      case 'fetched': 
        return `✓ Found ${progress.fileCount} files`
      case 'analyzing': 
        return 'Analyzing code structure...'
      case 'ai-processing': 
        return 'AI evaluation in progress...'
      case 'error':
        return `Error: ${progress.error}`
      default: 
        return 'Processing...'
    }
  }

  const getProgressPercentage = () => {
    switch (progress.stage) {
      case 'fetching': return ((progress.current || 0) / (progress.total || 1)) * 30
      case 'fetched': return 30
      case 'analyzing': return 60
      case 'ai-processing': return 85
      case 'complete': return 100
      default: return 0
    }
  }

  return (
    <div className="bg-zinc-800 p-6 rounded-lg max-w-md w-full">
      <div className="flex items-center gap-3 mb-4">
        {getIcon()}
        <span className="text-white font-medium">Analysis in Progress</span>
      </div>
      
      <p className="text-slate-300 text-sm mb-4">{getMessage()}</p>
      
      <div className="space-y-2">
        <div className="bg-zinc-700 rounded-full h-2">
          <div 
            className="bg-purple-500 h-2 rounded-full transition-all duration-500"
            style={{ width: `${getProgressPercentage()}%` }}
          />
        </div>
        <div className="text-xs text-slate-400 text-right">
          {Math.round(getProgressPercentage())}%
        </div>
      </div>
    </div>
  )
}