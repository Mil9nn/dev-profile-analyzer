import { Target } from "lucide-react"

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-zinc-950 backdrop-blur-lg px-6 py-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <a href="/" className="flex items-center gap-2 px-4 py-2 bg-purple-600 rounded-full">
          <Target className="w-5 h-5 text-white" />
          <span className="text-white font-mono">DevProfile Analyzer</span>
        </a>
        <div className="hidden md:flex gap-6">
          <a href="#" className="text-slate-200 hover:text-white">Sign in</a>
          <a href="#" className="px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700">
            Sign up
          </a>
        </div>
      </div>
    </nav>
  )
}