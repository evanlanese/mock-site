import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { AuthKitProvider } from '@workos-inc/authkit-react';
import App from './App.jsx';
import './index.css';

const clientId = import.meta.env.VITE_WORKOS_CLIENT_ID;
const redirectUri = import.meta.env.VITE_WORKOS_REDIRECT_URI;

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthKitProvider clientId={clientId} redirectUri={redirectUri}>
      <App />
    </AuthKitProvider>
  </StrictMode>
);
