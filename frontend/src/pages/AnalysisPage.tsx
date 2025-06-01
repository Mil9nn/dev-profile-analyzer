// frontend/src/pages/AnalysisPage.tsx
import Navbar from '../components/Navbar'
import { AnalysisForm } from '../components/AnalysisForm'
import { ProgressDisplay } from '../components/ProgressDisplay'
import { ResultsDisplay } from '../components/ResultsDisplay'
import { EmptyState } from '../components/states/EmptyState'
import { useAnalysis } from '../hooks/useAnalysis'

export default function AnalysisPage() {
  const { loading, result, error, progress, analyzeProfile } = useAnalysis()
  
  const renderRightPanel = () => {
    if (error) {
      return (
        <div className="text-center p-6 bg-red-500/10 rounded-lg border border-red-500/20 max-w-md w-full">
          <div className="text-red-400 font-medium mb-2">Analysis Failed</div>
          <p className="text-red-300 text-sm">{error}</p>
        </div>
      )
    }
    
    if (loading && progress) {
      return <ProgressDisplay progress={progress} />
    }
    
    if (result) {
      return <ResultsDisplay result={result} />
    }
    
    return <EmptyState />
  }
  
  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <Navbar />
      <div className="container mx-auto p-6">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          <div>
            <h1 className="text-3xl font-bold mb-6">Profile Analysis</h1>
            <AnalysisForm onSubmit={analyzeProfile} loading={loading} />
          </div>
          
          <div className="flex items-center justify-center min-h-[400px]">
            {renderRightPanel()}
          </div>
        </div>
      </div>
    </div>
  )
}