import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@workos-inc/authkit-react';

function App() {
  const [apiStatus, setApiStatus] = useState('checking...');
  const { isLoading, user, signIn, signOut } = useAuth();
  const loginInitiated = useRef(false);

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setApiStatus(data.status))
      .catch(() => setApiStatus('unreachable'));
  }, []);

  // Handle /login route: auto-trigger signIn for Initiate login URI
  useEffect(() => {
    if (window.location.pathname === '/login' && !isLoading && !user && !loginInitiated.current) {
      loginInitiated.current = true;
      signIn();
    }
  }, [isLoading, user, signIn]);

  if (isLoading) {
    return (
      <main className="app">
        <h1>Mock-Site Flow State</h1>
        <p>Loading...</p>
      </main>
    );
  }

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
    </main>
  );
}

export default App;
