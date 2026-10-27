import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@workos-inc/authkit-react';
import { OrganizationSwitcher, WorkOsWidgets } from '@workos-inc/widgets';
import '@radix-ui/themes/styles.css';
import '@workos-inc/widgets/styles.css';
import UserManagementPage from './UserManagementPage.jsx';
import MembersPage from './MembersPage.jsx';

const PROTECTED_PATHS = ['/widgets', '/user-management', '/members'];

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
    <section className="page">
      <div>
        <h1>Manage your workspace</h1>
        <p className="muted">Choose how members of your organization are managed.</p>
      </div>
      <div className="cards">
        <a className="card" href="/widgets">
          <h2>Widget setup</h2>
          <p>WorkOS AuthKit widgets embedded in the app. No backend required.</p>
          <span className="badge active">Available</span>
        </a>
        <a className="card" href="/members">
          <h2>Backend setup</h2>
          <p>Custom permissions enforced by our own API.</p>
          <span className="badge active">Available</span>
        </a>
      </div>
    </section>
  );
}

function WidgetsPage() {
  const { organizationId, role, getAccessToken, switchToOrganization } = useAuth();

  return (
    <section className="page">
      <a className="back-link" href="/">← Home</a>
      <div className="page-header">
        <div>
          <h1>AuthKit widgets</h1>
          <div className="chips">
            <span className="chip">Organization: {organizationId ?? 'none'}</span>
            <span className="chip">Role: {role ?? 'none'}</span>
          </div>
        </div>
        <WorkOsWidgets>
          <OrganizationSwitcher authToken={getAccessToken} switchToOrganization={switchToOrganization} />
        </WorkOsWidgets>
      </div>
      <div className="cards">
        {WIDGETS.map((widget) =>
          widget.href ? (
            <a key={widget.name} className="card" href={widget.href}>
              <h2>{widget.name}</h2>
              <p>{widget.description}</p>
              <span className="badge active">Open</span>
            </a>
          ) : (
            <div key={widget.name} className="card disabled" aria-disabled="true">
              <h2>{widget.name}</h2>
              <p>{widget.description}</p>
              <span className="badge">Coming soon</span>
            </div>
          )
        )}
      </div>
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

  let page = <HomePage />;
  if (isLoading) page = <p className="muted">Loading...</p>;
  else if (user && path === '/widgets') page = <WidgetsPage />;
  else if (user && path === '/user-management') page = <UserManagementPage />;
  else if (user && path === '/members') page = <MembersPage />;

  return (
    <div className="layout">
      <header className="header">
        <a className="brand" href="/">Mock-Site Flow State</a>
        {isLoading ? null : user ? (
          <div className="account">
            <span>{user.firstName ?? user.email}</span>
            <button className="button secondary" onClick={() => signOut({ returnTo: window.location.origin })}>
              Sign out
            </button>
          </div>
        ) : (
          <button className="button" onClick={() => signIn()}>Sign in</button>
        )}
      </header>
      <main className="main">{page}</main>
      <footer className="footer">API status: {apiStatus}</footer>
    </div>
  );
}

export default App;
