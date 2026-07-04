import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import './index.css';
import { ThemeProvider } from './lib/theme';
import { PeriodProvider } from './lib/period';
import { initTelegram } from './lib/telegram';
import { ApiError } from './api';
import { AuthGate } from './ui/AuthGate';
import { ConfirmProvider } from './ui/confirm';
import { Layout } from './ui/Layout';
import { Home } from './pages/Home';
import { Clients } from './pages/Clients';
import { ClientNew } from './pages/ClientNew';
import { ClientDetail } from './pages/ClientDetail';
import { Purchases } from './pages/Purchases';
import { PurchaseNew } from './pages/PurchaseNew';
import { PurchaseDetail } from './pages/PurchaseDetail';
import { Products } from './pages/Products';
import { ProductNew } from './pages/ProductNew';
import { ProductDetail } from './pages/ProductDetail';

initTelegram();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 15_000,
      retry: (count, err) =>
        !(err instanceof ApiError && (err.status === 401 || err.status === 403)) && count < 2,
    },
  },
});

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: '/', element: <Home /> },
      { path: '/clients', element: <Clients /> },
      { path: '/clients/new', element: <ClientNew /> },
      { path: '/clients/:id', element: <ClientDetail /> },
      { path: '/clients/:id/edit', element: <ClientNew /> },
      { path: '/purchases', element: <Purchases /> },
      { path: '/purchases/new', element: <PurchaseNew /> },
      { path: '/purchases/:id', element: <PurchaseDetail /> },
      { path: '/purchases/:id/edit', element: <PurchaseNew /> },
      { path: '/products', element: <Products /> },
      { path: '/products/new', element: <ProductNew /> },
      { path: '/products/:id', element: <ProductDetail /> },
      { path: '/products/:id/edit', element: <ProductNew /> },
    ],
  },
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <QueryClientProvider client={queryClient}>
        <AuthGate>
          <ConfirmProvider>
            <PeriodProvider>
              <RouterProvider router={router} />
            </PeriodProvider>
          </ConfirmProvider>
        </AuthGate>
      </QueryClientProvider>
    </ThemeProvider>
  </StrictMode>,
);
