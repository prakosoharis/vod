import { Routes, Route } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import { LandingPage } from '../pages/LandingPage'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import BrowsePage from '../pages/BrowsePage'
import VideoPlayerPage from '../pages/VideoPlayerPage'
import NotFoundPage from '../pages/NotFoundPage'
import ProtectedRoute from '../components/auth/ProtectedRoute'

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout><LandingPage /></Layout>} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/browse" element={
        <ProtectedRoute>
          <Layout><BrowsePage /></Layout>
        </ProtectedRoute>
      } />
      <Route path="/watch/:id" element={
        <ProtectedRoute>
          <VideoPlayerPage />
        </ProtectedRoute>
      } />
      <Route path="*" element={<Layout><NotFoundPage /></Layout>} />
    </Routes>
  )
}

export default AppRoutes
