import { Target, ArrowRight } from "lucide-react"
import { Link } from "react-router-dom"

export function HeroSection() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-900 to-purple-900 flex items-center justify-center px-6">
      <div className="max-w-4xl text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full mb-6">
          <Target className="w-4 h-4 text-purple-400" />
          <span className="text-purple-300">DevProfile Analyzer</span>
        </div>
        
        <h1 className="text-5xl lg:text-6xl font-bold text-white mb-6">
          Analyze Your{" "}
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Developer Profile
          </span>
        </h1>
        
        <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
          AI-powered analysis of your GitHub repositories and LinkedIn profile. 
          Get detailed insights on your skills and hiring potential.
        </p>
        
        <Link
          to="/analyze"
          className="inline-flex items-center gap-2 px-8 py-4 bg-purple-600 text-white font-semibold rounded-full hover:bg-purple-700 transition-all shadow-lg"
        >
          Get Started <ArrowRight className="w-5 h-5" />
        </Link>
      </div>
    </div>
  )
}