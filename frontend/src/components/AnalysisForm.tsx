// frontend/src/components/AnalysisForm.tsx
import { useState } from 'react'
import { FaGithub, FaLinkedinIn, FaFolder } from "react-icons/fa"
import type { FormData } from '../hooks/useAnalysis'

interface Props {
  onSubmit: (data: FormData) => void
  loading: boolean
}

export function AnalysisForm({ onSubmit, loading }: Props) {
  const [githubProfile, setGithubProfile] = useState('')
  const [linkedinProfile, setLinkedinProfile] = useState('')
  const [repositories, setRepositories] = useState(['', '', ''])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const validRepos = repositories.filter(repo => repo.trim())
    if (!validRepos.length) {
      alert('Please enter at least one repository URL')
      return
    }

    onSubmit({ githubProfile, linkedinProfile, repositories: validRepos })
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md bg-zinc-800 p-6 rounded-lg space-y-4">
      <div className="relative">
        <label className="block text-sm font-medium text-white mb-2">
          GitHub Profile (Optional)
        </label>
        <input
          type="text"
          value={githubProfile}
          onChange={(e) => setGithubProfile(e.target.value)}
          placeholder="https://github.com/username"
          className="w-full pl-10 pr-3 py-2 bg-zinc-700 text-white rounded border border-zinc-600 focus:border-purple-500 outline-none"
        />
        <FaGithub className="absolute top-10 left-3 text-zinc-400" size={16} />
      </div>

      <div className="relative">
        <label className="block text-sm font-medium text-white mb-2">
          LinkedIn Profile (Optional)
        </label>
        <input
          type="text"
          value={linkedinProfile}
          onChange={(e) => setLinkedinProfile(e.target.value)}
          placeholder="https://linkedin.com/in/username"
          className="w-full pl-10 pr-3 py-2 bg-zinc-700 text-white rounded border border-zinc-600 focus:border-purple-500 outline-none"
        />
        <FaLinkedinIn className="absolute top-10 left-3 text-zinc-400" size={16} />
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-white">
          Your Top 3 Repositories *
        </label>
        
        {repositories.map((repo, index) => (
          <div key={index} className="relative">
            <input
              type="text"
              value={repo}
              onChange={(e) => {
                const newRepos = [...repositories]
                newRepos[index] = e.target.value
                setRepositories(newRepos)
              }}
              placeholder="https://github.com/user/repo"
              className="w-full pl-10 pr-3 py-2 bg-zinc-700 text-white rounded border border-zinc-600 focus:border-purple-500 outline-none"
            />
            <FaFolder className="absolute top-3 left-3 text-zinc-400" size={16} />
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-purple-600 text-white font-semibold rounded hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Analyzing...' : 'Analyze Profile'}
      </button>
    </form>
  )
}