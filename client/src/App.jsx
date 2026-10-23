import { useEffect, useState } from 'react';

function App() {
  const [apiStatus, setApiStatus] = useState('checking...');

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setApiStatus(data.status))
      .catch(() => setApiStatus('unreachable'));
  }, []);

  return (
    <main className="app">
      <h1>Mock-Site Flow State</h1>
      <p>API status: {apiStatus}</p>
    </main>
  );
}

export default App;
