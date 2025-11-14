import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import Layout from '../components/layout/Layout'
import ProtectedRoute from '../components/auth/ProtectedRoute'
import LoadingSpinner from '../components/ui/LoadingSpinner'

// Lazy load pages untuk code splitting
const LandingPage = lazy(() => import('../pages/LandingPage').then(module => ({ default: module.LandingPage })))
const LoginPage = lazy(() => import('../pages/LoginPage'))
const RegisterPage = lazy(() => import('../pages/RegisterPage'))
const BrowsePage = lazy(() => import('../pages/BrowsePage'))
const VideoPlayerPage = lazy(() => import('../pages/VideoPlayerPage'))
const MyListPage = lazy(() => import('../pages/MyListPage'))
const LiveStreamingPage = lazy(() => import('../pages/LiveStreamingPage'))
const NotFoundPage = lazy(() => import('../pages/NotFoundPage'))

const AppRoutes = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        <Route path="/" element={
          <Layout>
            <Suspense fallback={<LoadingSpinner />}>
              <LandingPage />
            </Suspense>
          </Layout>
        } />
        <Route path="/login" element={
          <Suspense fallback={<LoadingSpinner />}>
            <LoginPage />
          </Suspense>
        } />
        <Route path="/register" element={
          <Suspense fallback={<LoadingSpinner />}>
            <RegisterPage />
          </Suspense>
        } />
        <Route path="/browse" element={
          <ProtectedRoute>
            <Layout>
              <Suspense fallback={<LoadingSpinner />}>
                <BrowsePage />
              </Suspense>
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/live" element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <LiveStreamingPage />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route path="/watch/:id" element={
          <ProtectedRoute>
            <Suspense fallback={<LoadingSpinner />}>
              <VideoPlayerPage />
            </Suspense>
          </ProtectedRoute>
        } />
        <Route
          path="/my-list"
          element={
            <ProtectedRoute>
              <Suspense fallback={<LoadingSpinner />}>
                <MyListPage />
              </Suspense>
            </ProtectedRoute>
          }
        />
        <Route path="*" element={
          <Layout>
            <Suspense fallback={<LoadingSpinner />}>
              <NotFoundPage />
            </Suspense>
          </Layout>
        } />
      </Routes>
    </Suspense>
  )
}

export default AppRoutes
