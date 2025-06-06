import { Link } from "react-router-dom"
import { Menu, X } from "lucide-react"
import { useState } from "react"

export function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="bg-zinc-900 text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo & Links */}
          <div className="flex items-center gap-8">
            <Link to="/" className="text-2xl font-bold text-purple-400">
              DevProfile
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm">
              <Link to="/" className="hover:text-purple-400 transition">Home</Link>
              <Link to="/analysis" className="hover:text-purple-400 transition">Analysis</Link>
              <Link to="/" className="hover:text-purple-400 transition">Features</Link>
              <Link to="/" className="hover:text-purple-400 transition">About</Link>
            </nav>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-4">
            <Link
              to="/login"
              className="px-4 py-2 rounded-full text-sm font-semibold hover:bg-purple-700 bg-purple-600 transition"
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 rounded-full text-sm bg-white text-purple-700 font-semibold hover:bg-purple-100 transition"
            >
              Sign Up
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-purple-400"
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 space-y-2 bg-zinc-800">
          <Link to="/" className="block hover:text-purple-400">Home</Link>
          <Link to="/analyze" className="block hover:text-purple-400">Analyze</Link>
          <Link to="/features" className="block hover:text-purple-400">Features</Link>
          <Link to="/about" className="block hover:text-purple-400">About</Link>
          <div className="pt-2 border-t border-zinc-700">
            <Link
              to="/login"
              className="block w-full text-left py-2 text-sm hover:bg-zinc-700 rounded px-2"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="block w-full text-left py-2 text-sm bg-purple-600 rounded px-2 mt-1 hover:bg-purple-700"
            >
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}
