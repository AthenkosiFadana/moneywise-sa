import { Navigate, Route, Routes } from 'react-router-dom'
import AppShell from './components/AppShell'
import Landing from './pages/Landing'
import Dashboard from './pages/Dashboard'
import Budget from './pages/Budget'
import Goals from './pages/Goals'
import Insights from './pages/Insights'
import Learn from './pages/Learn'
import LearnArticle from './pages/LearnArticle'
import Calculators from './pages/Calculators'
import Assistant from './pages/Assistant'
import Profile from './pages/Profile'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route
        path="/app/*"
        element={
          <AppShell>
            <Routes>
              <Route index element={<Dashboard />} />
              <Route path="budget" element={<Budget />} />
              <Route path="goals" element={<Goals />} />
              <Route path="insights" element={<Insights />} />
              <Route path="learn" element={<Learn />} />
              <Route path="learn/:slug" element={<LearnArticle />} />
              <Route path="calculators" element={<Calculators />} />
              <Route path="assistant" element={<Assistant />} />
              <Route path="profile" element={<Profile />} />
              <Route path="*" element={<Navigate to="/app" replace />} />
            </Routes>
          </AppShell>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
