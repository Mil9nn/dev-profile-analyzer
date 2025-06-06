// frontend/src/App.tsx
import { Routes, Route } from 'react-router-dom'
import MainLayout from './MainLayout'
import EnhancedAnalysisForm from './components/AnalysisForm'

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<EnhancedAnalysisForm />} />
      </Route>
    </Routes>
  )
}