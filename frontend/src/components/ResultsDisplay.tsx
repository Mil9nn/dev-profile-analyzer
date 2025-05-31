// Enhanced ProgressDisplay.tsx with granular progress tracking
import { Code, Database, Brain, CheckCircle, AlertTriangle, FileText, Download, Search, Zap } from 'lucide-react'
import { type ProgressUpdate } from '../hooks/useAnalysis'

interface ProgressDisplayProps {
  progress: ProgressUpdate | null
}

export function ResultsDisplay({ progress }: ProgressDisplayProps) {
  if (!progress) return null

  const getStageInfo = () => {
    switch (progress.stage) {
      case 'start-fetching':
        return {
          icon: <Database className="w-5 h-5 animate-pulse text-blue-400" />,
          title: 'Initializing Repository Analysis',
          color: 'blue'
        }
      case 'fetching-tree':
        return {
          icon: <Search className="w-5 h-5 animate-spin text-blue-400" />,
          title: 'Scanning Repository Structure',
          color: 'blue'
        }
      case 'fetching-files':
        return {
          icon: <Download className="w-5 h-5 animate-pulse text-blue-400" />,
          title: 'Downloading Source Files',
          color: 'blue'
        }
      case 'repo-complete':
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-400" />,
          title: 'Repository Downloaded',
          color: 'green'
        }
      case 'start-analysis':
        return {
          icon: <Code className="w-5 h-5 animate-pulse text-purple-400" />,
          title: 'Starting Code Analysis',
          color: 'purple'
        }
      case 'analyzing-file':
        return {
          icon: <Code className="w-5 h-5 animate-pulse text-purple-400" />,
          title: 'Analyzing Source Code',
          color: 'purple'
        }
      case 'found-tests':
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-400" />,
          title: 'Found Test Files',
          color: 'green'
        }
      case 'analyzing-dependencies':
        return {
          icon: <Code className="w-5 h-5 animate-pulse text-purple-400" />,
          title: 'Analyzing Dependencies',
          color: 'purple'
        }
      case 'analysis-complete':
        return {
          icon: <CheckCircle className="w-5 h-5 text-green-400" />,
          title: 'Code Analysis Complete',
          color: 'green'
        }
      case 'start-ai':
        return {
          icon: <Brain className="w-5 h-5 animate-pulse text-orange-400" />,
          title: 'Starting AI Evaluation',
          color: 'orange'
        }
      case 'ai-step':
        return {
          icon: <Brain className="w-5 h-5 animate-pulse text-orange-400" />,
          title: 'AI Skill Assessment',
          color: 'orange'
        }
      case 'ai-generating':
        return {
          icon: <Zap className="w-5 h-5 animate-bounce text-yellow-400" />,
          title: 'Generating Final Report',
          color: 'yellow'
        }
      case 'error':
      case 'repo-error':
        return {
          icon: <AlertTriangle className="w-5 h-5 text-red-400" />,
          title: 'Analysis Error',
          color: 'red'
        }
      default:
        return {
          icon: <FileText className="w-5 h-5 text-gray-400" />,
          title: 'Processing',
          color: 'gray'
        }
    }
  }

  const getMessage = () => {
    switch (progress.stage) {
      case 'start-fetching':
        return `Preparing to analyze ${progress.totalRepos} repositories...`
      
      case 'fetching-tree':
        return `Getting file structure from ${progress.repo?.split('/').slice(-2).join('/')} (${progress.repoIndex}/${progress.totalRepos})`
      
      case 'fetching-files':
        return `${progress.fileName} (${progress.fileIndex}/${progress.totalFiles} files)`
      
      case 'repo-complete':
        return `✓ ${progress.repo?.split('/').pop()} - Found ${progress.filesFound} analyzable files`
      
      case 'start-analysis':
        return `Beginning analysis of ${progress.totalFiles} source files...`
      
      case 'analyzing-file':
        return `Examining ${progress.fileName} (${progress.fileIndex}/${progress.totalFiles})`
      
      case 'found-tests':
        return `✓ Discovered test file: ${progress.fileName}`
      
      case 'analyzing-dependencies':
        return 'Cataloging project dependencies and frameworks...'
      
      case 'analysis-complete':
        return `✓ Found ${progress.stats?.components} components, ${progress.stats?.apis} APIs, ${progress.stats?.technologies} technologies`
      
      case 'start-ai':
        return 'Initializing AI-powered skill evaluation...'
      
      case 'ai-step':
        return progress.step || 'Processing developer profile...'
      
      case 'ai-generating':
        return 'Compiling final analysis report...'
      
      case 'error':
      case 'repo-error':
        return `Error: ${progress.error}`
      
      default:
        return progress.step || 'Processing your repositories...'
    }
  }

  const getProgressPercentage = () => {
    switch (progress.stage) {
      case 'fetching-files':
        return progress.fileProgress || 0
      case 'analyzing-file':
        return progress.progress || 0
      case 'ai-step':
        return progress.progress || 0
      default:
        return null
    }
  }

  const stageInfo = getStageInfo()
  const progressPercentage = getProgressPercentage()

  return (
    <div className="bg-zinc-800 p-6 rounded-lg border border-zinc-700">
      <div className="flex items-center gap-3 mb-4">
        {stageInfo.icon}
        <span className="text-white font-medium">{stageInfo.title}</span>
      </div>
      
      <p className="text-slate-300 text-sm mb-4">{getMessage()}</p>
      
      {/* Repository Progress Bar */}
      {progress.stage === 'fetching-tree' && progress.totalRepos && progress.repoIndex && (
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-xs text-slate-400">
            <span>Repository {progress.repoIndex} of {progress.totalRepos}</span>
            <span>{Math.round((progress.repoIndex / progress.totalRepos) * 100)}%</span>
          </div>
          <div className="bg-zinc-700 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${(progress.repoIndex / progress.totalRepos) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* File Progress Bar */}
      {progressPercentage !== null && (
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-xs text-slate-400">
            <span>
              {progress.stage === 'fetching-files' && `File ${progress.fileIndex} of ${progress.totalFiles}`}
              {progress.stage === 'analyzing-file' && `File ${progress.fileIndex} of ${progress.totalFiles}`}
              {progress.stage === 'ai-step' && `Step ${progress.stepIndex} of ${progress.totalSteps}`}
            </span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className="bg-zinc-700 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ease-out ${
                progress.stage === 'fetching-files' ? 'bg-blue-500' :
                progress.stage === 'analyzing-file' ? 'bg-purple-500' :
                progress.stage === 'ai-step' ? 'bg-orange-500' : 'bg-gray-500'
              }`}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      )}

      {/* Analysis Summary */}
      {progress.stage === 'analysis-complete' && progress.stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-slate-300 bg-zinc-700 p-3 rounded mt-4">
          <div className="text-center">
            <div className="text-white font-medium">{progress.stats.files}</div>
            <div>Files</div>
          </div>
          <div className="text-center">
            <div className="text-white font-medium">{progress.stats.components}</div>
            <div>Components</div>
          </div>
          <div className="text-center">
            <div className="text-white font-medium">{progress.stats.apis}</div>
            <div>APIs</div>
          </div>
          <div className="text-center">
            <div className="text-white font-medium">{progress.stats.technologies}</div>
            <div>Technologies</div>
          </div>
        </div>
      )}

      {/* Multi-stage Indicators */}
      {(progress.stage === 'analyzing-file' || progress.stage === 'found-tests') && (
        <div className="flex items-center gap-4 text-xs text-slate-400 mt-4">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
            <span>Components</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
            <span>APIs</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
            <span>Dependencies</span>
          </div>
          {progress.stage === 'found-tests' && (
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse" style={{ animationDelay: '0.6s' }} />
              <span>Tests Found!</span>
            </div>
          )}
        </div>
      )}

      {/* AI Processing Indicators */}
      {progress.stage === 'ai-step' && (
        <div className="flex items-center justify-center gap-2 text-xs text-orange-300 mt-4">
          <Brain className="w-4 h-4 animate-pulse" />
          <span>{progress.step}</span>
        </div>
      )}

      {/* Final Generation */}
      {progress.stage === 'ai-generating' && (
        <div className="flex items-center justify-center gap-2 text-xs text-yellow-300 mt-4">
          <Zap className="w-4 h-4 animate-bounce" />
          <span>Finalizing your developer profile...</span>
        </div>
      )}
    </div>
  )
}