// frontend/src/hooks/useAnalysis.ts
import { useState } from 'react'

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
  metrics?: {
    files: number
    components: number
    apis: number
    technologies: string[]
    score: number
  }
}

export type ProgressUpdate = {
  stage: 'fetching' | 'fetched' | 'analyzing' | 'ai-processing' | 'complete' | 'error'
  repo?: string
  fileCount?: number
  index?: number
  total?: number
  error?: string
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
      const eventSource = new EventSource(`http://localhost:5000/api/analyze`)
      
      // Send the data via POST (we'll need to modify this)
      fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      eventSource.onmessage = (event) => {
        const update = JSON.parse(event.data)
        setProgress(update)
        
        if (update.stage === 'complete') {
          if (update.success) {
            setResult({
              success: true,
              aiFeedback: update.aiFeedback,
              metrics: update.metrics
            })
          } else {
            setError(update.error || 'Analysis failed')
          }
          setLoading(false)
          eventSource.close()
        } else if (update.stage === 'error') {
          setError(update.error || 'Analysis failed')
          setLoading(false)
          eventSource.close()
        }
      }

      eventSource.onerror = () => {
        setError('Connection error')
        setLoading(false)
        eventSource.close()
      }

    } catch (err: any) {
      setError(err.message || 'Analysis failed')
      setLoading(false)
    }
  }

  return { loading, result, error, progress, analyzeProfile }
}