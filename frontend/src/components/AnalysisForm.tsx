import { useState } from 'react'
import { useAnalysisContext } from '../contexts/AnalysisContext'
import { FaFolderOpen, FaGithub, FaLinkedinIn } from "react-icons/fa"

export function AnalysisForm() {
  const { loading, analyzeProfile } = useAnalysisContext()
  const [githubProfile, setGithubProfile] = useState('')
  const [linkedinProfile, setLinkedinProfile] = useState('')
  const [repositories, setRepositories] = useState(['', '', ''])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted!')

    const validRepos = repositories.filter(repo => repo.trim())
    console.log('Valid repos:', validRepos)

    if (validRepos.length === 0) {
      alert('Please enter at least one repository URL')
      return
    }

    const formData = {
      githubProfile,
      linkedinProfile,
      repositories: validRepos
    }

    console.log('Submitting form data:', formData)
    analyzeProfile(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md bg-zinc-800 p-6 rounded-md space-y-4">
      <div className="relative">
        <label className="block text-sm font-medium text-white mb-2">GitHub Profile (Optional)</label>
        <input
          type="text"
          value={githubProfile}
          onChange={(e) => setGithubProfile(e.target.value)}
          placeholder="https://github.com/username"
          className="w-full px-10 py-2 bg-zinc-700 text-white rounded-md border border-zinc-600 focus:border-purple-500 outline-none"
        />
        <FaGithub size={20} className="absolute top-10 left-2 text-zinc-400" />
      </div>

      <div className="relative">
        <label className="block text-sm font-medium text-white mb-2">LinkedIn Profile (Optional)</label>
        <input
          type="text"
          value={linkedinProfile}
          onChange={(e) => setLinkedinProfile(e.target.value)}
          placeholder="https://linkedin.com/in/username"
          className="w-full px-10 py-2 bg-zinc-700 text-white rounded-md border border-zinc-600 focus:border-purple-500 outline-none"
        />
        <FaLinkedinIn size={20} className="absolute top-10 left-2 text-zinc-400" />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-white">Your Top 03 Repositories *</label>
        </div>

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
              className="w-full px-10 py-2 bg-zinc-700 text-white rounded-md border border-zinc-600 focus:border-purple-500 outline-none"
            />
            <FaFolderOpen size={20} className="absolute top-3 left-2 text-zinc-400" />
          </div>
        ))}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 bg-purple-600 text-white font-semibold rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {loading ? 'Analyzing...' : 'Analyze Profile'}
      </button>

      {loading && (
        <div className="text-center text-sm text-purple-300">
          Please wait while we analyze your repositories...
        </div>
      )}
    </form>
  )
}