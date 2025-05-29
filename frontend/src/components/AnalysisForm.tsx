import { useState } from 'react'
import { useAnalysis } from '../hooks/useAnalysis'

export function AnalysisForm() {
  const { loading, analyzeProfile } = useAnalysis()
  const [githubProfile, setGithubProfile] = useState('')
  const [linkedinProfile, setLinkedinProfile] = useState('')
  const [repositories, setRepositories] = useState(['', '', ''])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const validRepos = repositories.filter(repo => repo.trim())
    if (validRepos.length === 0) return
    
    analyzeProfile({
      githubProfile,
      linkedinProfile,
      repositories: validRepos
    })
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md bg-zinc-800 p-6 rounded-lg space-y-4">
      <div>
        <label className="block text-sm font-medium text-white mb-2">GitHub Profile</label>
        <input
          type="url"
          value={githubProfile}
          onChange={(e) => setGithubProfile(e.target.value)}
          placeholder="https://github.com/username"
          className="w-full px-3 py-2 bg-zinc-700 text-white rounded-md border border-zinc-600 focus:border-purple-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">LinkedIn Profile</label>
        <input
          type="url"
          value={linkedinProfile}
          onChange={(e) => setLinkedinProfile(e.target.value)}
          placeholder="https://linkedin.com/in/username"
          className="w-full px-3 py-2 bg-zinc-700 text-white rounded-md border border-zinc-600 focus:border-purple-500 outline-none"
        />
      </div>

      {repositories.map((repo, index) => (
        <div key={index}>
          <label className="block text-sm font-medium text-white mb-2">
            Repository {index + 1}
          </label>
          <input
            type="url"
            value={repo}
            onChange={(e) => {
              const newRepos = [...repositories]
              newRepos[index] = e.target.value
              setRepositories(newRepos)
            }}
            placeholder="https://github.com/user/repo"
            className="w-full px-3 py-2 bg-zinc-700 text-white rounded-md border border-zinc-600 focus:border-purple-500 outline-none"
          />
        </div>
      ))}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Analyzing...' : 'Analyze Profile'}
      </button>
    </form>
  )
}