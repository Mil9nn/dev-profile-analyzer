import { Loader2 } from 'lucide-react'
import Navbar from '../components/Navbar'
import { AnalysisForm } from '../components/AnalysisForm'
import { ResultsDisplay } from '../components/ResultsDisplay'
import { useAnalysis } from '../hooks/useAnalysis'

export default function AnalysisPage() {
  const { loading, result, error } = useAnalysis()
  
  return (
    <div className="min-h-screen bg-zinc-900 text-white">
      <Navbar />
      <div className="container mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <h1 className="text-3xl font-bold mb-6">Profile Analysis</h1>
            <AnalysisForm />
          </div>
          
          <div className="flex items-center justify-center">
            {error ? (
              <div className="text-center p-8 bg-red-500/10 rounded-lg border border-red-500/20">
                <p className="text-red-400">{error}</p>
              </div>
            ) : loading ? (
              <div className="text-center p-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-purple-400" />
                <p className="text-slate-400">Analyzing your profile...</p>
              </div>
            ) : result ? (
              <ResultsDisplay result={result} />
            ) : (
              <div className="text-center p-8">
                <p className="text-slate-400">Fill out the form to get your analysis</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}