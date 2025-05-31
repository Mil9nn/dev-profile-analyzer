// frontend/src/hooks/useAnalysis.ts
import { useState } from 'react'

export type FormData = {
  githubProfile: string
  linkedinProfile: string
  repositories: string[]
}

export type AnalysisResult = {
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
  metrics: {
    totalFiles: number
    components: number
    apiEndpoints: number
    technologies: string[]
    score: number
  }
}

export type Progress = {
  stage: 'fetching' | 'fetched' | 'analyzing' | 'ai-processing' | 'complete' | 'error'
  repo?: string
  current?: number
  total?: number
  fileCount?: number
  error?: string
}

export function useAnalysis() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState<Progress | null>(null)

  const analyzeProfile = async (data: FormData) => {
    setLoading(true)
    setError('')
    setResult(null)
    setProgress(null)
    
    try {
      const response = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response reader')

      const decoder = new TextDecoder()
      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        
        for (const line of lines) {
          if (!line.trim() || !line.startsWith('data: ')) continue
          
          try {
            const update = JSON.parse(line.slice(6))
            setProgress(update)
            
            if (update.stage === 'complete') {
              if (update.success) {
                setResult(update.result)
              } else {
                setError(update.error || 'Analysis failed')
              }
              setLoading(false)
              return
            } else if (update.stage === 'error') {
              setError(update.error || 'Analysis failed')
              setLoading(false)
              return
            }
          } catch (parseErr) {
            console.error('Parse error:', parseErr)
          }
        }
      }

      if (loading) {
        setError('Analysis incomplete')
        setLoading(false)
      }

    } catch (err: any) {
      setError(err.message || 'Analysis failed')
      setLoading(false)
    }
  }

  return { loading, result, error, progress, analyzeProfile }
}