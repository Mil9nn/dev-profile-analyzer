import { useState } from 'react'
import axios from 'axios'

export type FormData = {
  githubProfile: string
  linkedinProfile: string
  repositories: string[]
}

export type AnalysisResult = {
  success: boolean
  aiFeedback: {
    score: number
    rationale: string[]
    technologies: string[]
    strengths: string[]
    weaknesses: string[]
    improvements: string[]
    hiringPotential: {
      level: string
      details: string
      watchAreas: string[]
    }
    conclusion: string
  }
}

export function useAnalysis() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState('')

  const analyzeProfile = async (data: FormData) => {
    setLoading(true)
    setError('')
    
    try {
      const response = await axios.post<AnalysisResult>('http://localhost:5000/api/analyze', data)
      setResult(response.data)
    } catch (err: any) {
      setError(err.response?.data?.message || 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  return { loading, result, error, analyzeProfile }
}
