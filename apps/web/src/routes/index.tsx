import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Layout } from '@/components/layout/Layout';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { BrowsePage } from '@/pages/BrowsePage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import App from '@/App'; // Import the test App component

const router = createBrowserRouter([
  {
    path: '/test',
    element: <App />, // Use the test App component for /test route
  },
  {
    path: '/',
    element: <Layout children={<LandingPage />} />, // Pass children directly
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}

