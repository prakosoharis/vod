import { Routes, Route } from 'react-router-dom'
import Layout from '../components/layout/Layout'
import { LandingPage } from '../pages/LandingPage'
import LoginPage from '../pages/LoginPage'
import RegisterPage from '../pages/RegisterPage'
import BrowsePage from '../pages/BrowsePage'
import NotFoundPage from '../pages/NotFoundPage'

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Layout><LandingPage /></Layout>} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/browse" element={<Layout><BrowsePage /></Layout>} />
      <Route path="*" element={<Layout><NotFoundPage /></Layout>} />
    </Routes>
  )
}

export default AppRoutes
