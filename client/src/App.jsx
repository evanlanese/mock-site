import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@workos-inc/authkit-react';
import UserManagementPage from './UserManagementPage.jsx';

const PROTECTED_PATHS = ['/widgets', '/user-management'];

// AuthKit widgets; only those with an href are enabled for now
const WIDGETS = [
  { name: 'User Management', description: 'Org admins invite, remove and change roles of members', href: '/user-management' },
  { name: 'User Profile', description: 'View and edit your own profile' },
  { name: 'User Security', description: 'Your password, MFA (TOTP) and passkeys' },
  { name: 'User Sessions', description: 'See and revoke your signed-in sessions and devices' },
  { name: 'API Keys', description: 'Create and manage API keys for this product' },
];

function HomePage() {
  return (
    <nav className="options">
      <a className="option" href="/widgets">Widget setup</a>
      <button className="option" disabled>Backend setup (coming soon)</button>
    </nav>
  );
}

function WidgetsPage() {
  const { organizationId, role } = useAuth();

  return (
    <section className="page">
      <h2>AuthKit widgets</h2>
      <p>Organization: {organizationId ?? 'none'} · Role: {role ?? 'none'}</p>
      <button disabled>Switch organization</button>
      <ul className="widgets">
        {WIDGETS.map((widget) => (
          <li key={widget.name}>
            {widget.href ? <a href={widget.href}>{widget.name}</a> : <button disabled>{widget.name}</button>}
            <span>{widget.description}</span>
          </li>
        ))}
      </ul>
      <a href="/">Back to home</a>
    </section>
  );
}

function App() {
  const [apiStatus, setApiStatus] = useState('checking...');
  const { isLoading, user, signIn, signOut } = useAuth();
  const loginInitiated = useRef(false);
  const path = window.location.pathname;

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setApiStatus(data.status))
      .catch(() => setApiStatus('unreachable'));
  }, []);

  // /login (Initiate login URI) and protected pages auto-trigger signIn
  useEffect(() => {
    const needsLogin = path === '/login' || PROTECTED_PATHS.includes(path);
    if (needsLogin && !isLoading && !user && !loginInitiated.current) {
      loginInitiated.current = true;
      signIn();
    }
  }, [path, isLoading, user, signIn]);

  if (isLoading) {
    return (
      <main className="app">
        <h1>Mock-Site Flow State</h1>
        <p>Loading...</p>
      </main>
    );
  }

  let page = <HomePage />;
  if (user && path === '/widgets') page = <WidgetsPage />;
  if (user && path === '/user-management') page = <UserManagementPage />;

  return (
    <main className="app">
      <h1>Mock-Site Flow State</h1>
      <p>API status: {apiStatus}</p>

      {user ? (
        <div>
          <p>Welcome, {user.firstName ?? user.email}!</p>
          <button onClick={() => signOut({ returnTo: window.location.origin })}>Sign Out</button>
        </div>
      ) : (
        <div>
          <button onClick={() => signIn()}>Sign In</button>
        </div>
      )}

      {page}
    </main>
  );
}

export default App;
