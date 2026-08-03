import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Navigate, createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import { BreedsPage } from './pages/BreedsPage/BreedsPage.tsx'
import { BreedPage } from './pages/BreedPage/BreedPage.tsx'
import { ErrorPage } from './pages/ErrorPage/ErrorPage.tsx'

const queryClient = new QueryClient()

const router = createBrowserRouter([
  {
    path: '/',
    Component: App,
    errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Navigate to="/breeds" replace /> },
      { path: 'breeds', Component: BreedsPage },
      { path: 'breeds/:breedId', Component: BreedPage },
    ],
  },
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
)
