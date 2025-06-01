// frontend/src/contexts/AnalysisContext.tsx
import React, { createContext, useContext, ReactNode } from 'react'
import { useAnalysis, type FormData, type AnalysisResult, type ProgressUpdate } from '../hooks/useAnalysis'

interface AnalysisContextType {
  loading: boolean
  result: AnalysisResult | null
  error: string
  progress: ProgressUpdate | null
  analyzeProfile: (data: FormData) => Promise<void>
}

const AnalysisContext = createContext<AnalysisContextType | undefined>(undefined)

export function AnalysisProvider({ children }: { children: ReactNode }) {
  const analysis = useAnalysis()
  
  return (
    <AnalysisContext.Provider value={analysis}>
      {children}
    </AnalysisContext.Provider>
  )
}

export function useAnalysisContext() {
  const context = useContext(AnalysisContext)
  if (!context) {
    throw new Error('useAnalysisContext must be used within AnalysisProvider')
  }
  return context
}