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

// Sync with backend progress structure
export type ProgressUpdate = {
  stage: 'fetching' | 'fetched' | 'analyzing' | 'ai-processing' | 'complete' | 'error'
  repo?: string
  current?: number
  total?: number
  fileCount?: number
  error?: string
  success?: boolean
  result?: AnalysisResult
}

export function useAnalysis() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisResult | null>(null)
  const [error, setError] = useState('')
  const [progress, setProgress] = useState<ProgressUpdate | null>(null)

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
        throw new Error(`Server error: ${response.status}`)
      }

      const reader = response.body?.getReader()
      if (!reader) throw new Error('No response stream')

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
            const update: ProgressUpdate = JSON.parse(line.slice(6))
            setProgress(update)
            
            if (update.stage === 'complete') {
              if (update.success && update.result) {
                setResult(update.result)
              } else {
                setError(update.error || 'Analysis failed')
              }
              setLoading(false)
              return
            } else if (update.stage === 'error') {
              setError(update.error || 'Unknown error occurred')
              setLoading(false)
              return
            }
          } catch (parseErr) {
            console.warn('Failed to parse progress update:', parseErr)
          }
        }
      }

    } catch (err: any) {
      setError(err.message || 'Connection failed')
      setLoading(false)
    }
  }

  return { loading, result, error, progress, analyzeProfile }
}