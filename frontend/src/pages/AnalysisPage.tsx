// frontend/src/pages/AnalysisPage.tsx
import { Code, Database, Brain, CheckCircle } from 'lucide-react'
import Navbar from '../components/Navbar'
import { AnalysisForm } from '../components/AnalysisForm'
import { ResultsDisplay } from '../components/ResultsDisplay'
import { EmptyState } from '../components/states/EmptyState'
import { useAnalysis } from '../hooks/useAnalysis'

function ProgressDisplay() {
  const { progress } = useAnalysis()
  
  if (!progress) return null

  const getIcon = () => {
    switch (progress.stage) {
      case 'fetching': return <Database className="w-5 h-5 animate-pulse text-blue-400" />
      case 'fetched': return <CheckCircle className="w-5 h-5 text-green-400" />
      case 'analyzing': return <Code className="w-5 h-5 animate-pulse text-purple-400" />
      case 'ai-processing': return <Brain className="w-5 h-5 animate-pulse text-orange-400" />
      default: return <Database className="w-5 h-5 text-gray-400" />
    }
  }

  const getMessage = () => {
    switch (progress.stage) {
      case 'fetching': 
        return `Fetching repository ${progress.index}/${progress.total}: ${progress.repo?.split('/').pop()}`
      case 'fetched': 
        return `✓ Found ${progress.fileCount} files in ${progress.repo?.split('/').pop()}`
      case 'analyzing': 
        return 'Analyzing code structure and patterns...'
      case 'ai-processing': 
        return 'AI is evaluating your skills...'
      case 'error':
        return `Error: ${progress.error}`
      default: 
        return 'Processing...'
    }
  }

  return (
    <div className="bg-zinc-800 p-6 rounded-lg">
      <div className="flex items-center gap-3 mb-4">
        {getIcon()}
        <span className="text-white font-medium">Analysis in Progress</span>
      </div>
      <p className="text-slate-300 text-sm">{getMessage()}</p>
      
      {progress.stage === 'fetching' && progress.total && (
        <div className="mt-3">
          <div className="bg-zinc-700 rounded-full h-2">
            <div 
              className="bg-purple-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((progress.index || 0) / progress.total) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default function AnalysisPage() {
  const { loading, result, error } = useAnalysis()
  
  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <Navbar />
      <div className="container mx-auto p-6">
        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <h1 className="text-3xl font-bold mb-3">Profile Analysis</h1>
            <AnalysisForm />
          </div>
          
          <div className="flex items-center justify-center">
            {error ? (
              <div className="text-center p-8 bg-red-500/10 rounded-lg border border-red-500/20">
                <p className="text-red-400">{error}</p>
              </div>
            ) : loading ? (
              <ProgressDisplay />
            ) : result ? (
              <ResultsDisplay result={result} />
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}