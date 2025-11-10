import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Layout from '@/components/layout/Layout';
import LandingPage from '@/pages/LandingPage';
import App from '@/App';

const router = createBrowserRouter([
  {
    path: '/test',
    element: <App />, // Use the test App component for /test route
  },
  {
    path: '/',
    element: <Layout><LandingPage /></Layout>,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}

