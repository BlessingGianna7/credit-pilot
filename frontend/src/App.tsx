import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import { AppLayout } from './components/AppLayout'
import { ProtectedRoute } from './components/ProtectedRoute'
import { AddCardPage } from './pages/AddCardPage'
import { CardDetailPage } from './pages/CardDetailPage'
import { DashboardPage } from './pages/DashboardPage'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { RemindersPage } from './pages/RemindersPage'
import { SimulatorPage } from './pages/SimulatorPage'
import { TipsPage } from './pages/TipsPage'
import { UtilizationPage } from './pages/UtilizationPage'

/**
 * App.tsx = the map of pages (routes).
 *
 * Public: /login, /register
 * Protected (need JWT): everything under AppLayout
 */
function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/" element={<DashboardPage />} />
            <Route path="/utilization" element={<UtilizationPage />} />
            <Route path="/simulator" element={<SimulatorPage />} />
            <Route path="/tips" element={<TipsPage />} />
            <Route path="/reminders" element={<RemindersPage />} />
            <Route path="/cards/new" element={<AddCardPage />} />
            <Route path="/cards/:cardId" element={<CardDetailPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
