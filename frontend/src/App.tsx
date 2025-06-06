// frontend/src/App.tsx
import { Routes, Route } from 'react-router-dom'
import MainLayout from './MainLayout'
import ResumeAnalyzer from './components/ResumeAnalyzer'
import HomePage from './pages/HomePage'

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/analysis" element={<ResumeAnalyzer />} />
      </Route>
    </Routes>
  )
}