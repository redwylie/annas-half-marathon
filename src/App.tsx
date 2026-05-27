import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header'
import BottomNav from './components/BottomNav'
import TodayPage from './pages/TodayPage'
import PlanPage from './pages/PlanPage'
import ProgressPage from './pages/ProgressPage'
import SettingsPage from './pages/SettingsPage'

export default function App() {
  return (
    <HashRouter>
      <div className="flex min-h-full flex-col bg-zinc-50 dark:bg-zinc-950">
        <Header />
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 pb-28">
          <Routes>
            <Route path="/" element={<TodayPage />} />
            <Route path="/plan" element={<PlanPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <BottomNav />
      </div>
    </HashRouter>
  )
}
