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
    console.log('Starting analysis with data:', data)
    
    setLoading(true)
    setError('')
    setResult(null)
    setProgress(null)
    
    try {
      // Make POST request to trigger analysis
      const response = await fetch('http://localhost:5000/api/analyze', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'text/event-stream',
          'Cache-Control': 'no-cache'
        },
        body: JSON.stringify(data)
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`)
      }

      // Handle the streaming response
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No response body reader available')
      }

      let buffer = ''

      while (true) {
        const { done, value } = await reader.read()
        
        if (done) {
          console.log('Stream ended')
          break
        }
        
        // Decode the chunk and add to buffer
        const chunk = decoder.decode(value, { stream: true })
        buffer += chunk
        
        // Process complete lines
        const lines = buffer.split('\n')
        buffer = lines.pop() || '' // Keep incomplete line in buffer
        
        for (const line of lines) {
          if (line.trim() === '') continue
          
          if (line.startsWith('data: ')) {
            try {
              const jsonStr = line.slice(6).trim()
              if (jsonStr === '') continue
              
              const update = JSON.parse(jsonStr)
              console.log('Progress update received:', update)
              
              setProgress(update)
              
              // Handle different stages
              if (update.stage === 'complete') {
                console.log('Analysis complete:', update)
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
                console.error('Analysis error:', update)
                setError(update.error || 'Analysis failed')
                setLoading(false)
                return
              }
            } catch (parseErr) {
              console.error('Failed to parse progress update:', parseErr, 'Raw line:', line)
            }
          }
        }
      }

      // If we reach here without getting a complete message, something went wrong
      if (loading) {
        setError('Analysis completed but no final result received')
        setLoading(false)
      }

    } catch (err: any) {
      console.error('Analysis error:', err)
      setError(err.message || 'Analysis failed')
      setLoading(false)
    }
  }

  return { loading, result, error, progress, analyzeProfile }
}