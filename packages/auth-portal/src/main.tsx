import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthProvider } from './context/AuthContext';
import { PortalRouter } from './router/PortalRouter';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <PortalRouter />
    </AuthProvider>
  </StrictMode>
);
