import { Target, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom"; // or use <a> if you're not using React Router

export function HeroSection() {
  return (
    <div className="relative h-screen pt-16 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 backdrop-blur-3xl"></div>
      
      <div className="relative max-w-4xl mx-auto text-center">
        {/* Branding */}
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 rounded-full text-sm text-slate-300 mb-6 backdrop-blur-sm border border-white/20">
          <Target className="w-4 h-4" />
          <code className="flex items-center text-white font-mono text-base">
            <span className="text-pink-500 font-bold text-lg">&lt;</span>
            <span className="text-white">DevProfile Analyzer</span>
            <span className="text-pink-500 font-bold text-lg"> /&gt;</span>
          </code>
        </div>

        {/* Heading */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-6 tracking-tight">
          Analyze Your
          <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent"> Developer Profile</span>
        </h1>

        {/* Description */}
        <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed mb-6">
          We take your <strong>top 3 GitHub repositories</strong> and <strong>LinkedIn profile</strong>, scan the source code and metadata using AI, and give you a detailed analysis of your skills, technologies used, and hiring potential.
        </p>

        {/* CTA Button */}
        <Link
          to="/analyze"
          className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-semibold rounded-full hover:bg-purple-700 transition-all duration-200 shadow-lg"
        >
          Get Started
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
