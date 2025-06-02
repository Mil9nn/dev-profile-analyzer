// frontend/src/App.tsx
import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AnalysisPage from './pages/AnalysisPage'
import MainLayout from './MainLayout'

export default function App() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/analyze" element={<AnalysisPage />} />
      </Route>
      <Route path="/" element={<HomePage />} />
    </Routes>
  )
}