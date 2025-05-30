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
    console.log('Starting analysis with data:', data) // Debug log
    
    setLoading(true)
    setError('')
    setResult(null)
    setProgress(null)
    
    try {
      // Create EventSource for progress updates
      const eventSource = new EventSource('http://localhost:5000/api/analyze', {
        withCredentials: false
      })
      
      // Send the POST request with data
      const response = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream'
        },
        body: JSON.stringify(data)
      })

      console.log('Response status:', response.status) // Debug log

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Handle the streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No response body reader available')
      }

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break
        
        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')
        
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const update = JSON.parse(line.slice(6))
              console.log('Progress update:', update) // Debug log
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
                return
              } else if (update.stage === 'error') {
                setError(update.error || 'Analysis failed')
                setLoading(false)
                return
              }
            } catch (parseErr) {
              console.error('Failed to parse progress update:', parseErr)
            }
          }
        }
      }

    } catch (err: any) {
      console.error('Analysis error:', err) // Debug log
      setError(err.message || 'Analysis failed')
      setLoading(false)
    }
  }

  return { loading, result, error, progress, analyzeProfile }
}