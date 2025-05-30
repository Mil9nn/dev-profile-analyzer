import { useState } from 'react'
import { useAnalysis } from '../hooks/useAnalysis'

export function AnalysisForm() {
  const { loading, analyzeProfile } = useAnalysis()
  const [githubProfile, setGithubProfile] = useState('')
  const [linkedinProfile, setLinkedinProfile] = useState('')
  const [repositories, setRepositories] = useState(['', '', ''])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted!') // Debug log
    
    const validRepos = repositories.filter(repo => repo.trim())
    console.log('Valid repos:', validRepos) // Debug log
    
    if (validRepos.length === 0) {
      alert('Please enter at least one repository URL')
      return
    }
    
    const formData = {
      githubProfile,
      linkedinProfile,
      repositories: validRepos
    }
    
    console.log('Submitting form data:', formData) // Debug log
    analyzeProfile(formData)
  }

  const addRepository = () => {
    setRepositories([...repositories, ''])
  }

  const removeRepository = (index: number) => {
    if (repositories.length > 1) {
      const newRepos = repositories.filter((_, i) => i !== index)
      setRepositories(newRepos)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-md bg-zinc-800 p-6 rounded-md space-y-4">
      <div>
        <label className="block text-sm font-medium text-white mb-2">GitHub Profile (Optional)</label>
        <input
          type="text"
          value={githubProfile}
          onChange={(e) => setGithubProfile(e.target.value)}
          placeholder="https://github.com/username"
          className="w-full px-3 py-2 bg-zinc-700 text-white rounded-md border border-zinc-600 focus:border-purple-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-white mb-2">LinkedIn Profile (Optional)</label>
        <input
          type="text"
          value={linkedinProfile}
          onChange={(e) => setLinkedinProfile(e.target.value)}
          placeholder="https://linkedin.com/in/username"
          className="w-full px-3 py-2 bg-zinc-700 text-white rounded-md border border-zinc-600 focus:border-purple-500 outline-none"
        />
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium text-white">Repositories *</label>
          <button
            type="button"
            onClick={addRepository}
            className="text-xs px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Add Repo
          </button>
        </div>
        
        {repositories.map((repo, index) => (
          <div key={index} className="flex gap-2">
            <input
              type="text"
              value={repo}
              onChange={(e) => {
                const newRepos = [...repositories]
                newRepos[index] = e.target.value
                setRepositories(newRepos)
              }}
              placeholder="https://github.com/user/repo"
              className="flex-1 px-3 py-2 bg-zinc-700 text-white rounded-md border border-zinc-600 focus:border-purple-500 outline-none"
            />
            {repositories.length > 1 && (
              <button
                type="button"
                onClick={() => removeRepository(index)}
                className="px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                ×
              </button>
            )}
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