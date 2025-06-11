// frontend/src/App.tsx
import { Routes, Route } from 'react-router-dom'
import MainLayout from './MainLayout'
import ResumeAnalyzer from './components/ResumeAnalyzer'
import HomePage from './pages/HomePage'
import AnalysisPage from './pages/AnalysisPage'
import ResumePage from './pages/ResumePage'

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<ResumeAnalyzer />} />
        <Route path="/analysis" element={<AnalysisPage />} />
        <Route path="/resume" element={<ResumePage />} />
      </Route>
    </Routes>
  )
}