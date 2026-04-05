import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import Login from './pages/Login';
import Home from './pages/Home';

const AppInner = () => {
  const [loggedIn, setLoggedIn] = useState(
    () => localStorage.getItem('zv_loggedIn') === 'true'
  );

  const handleLogin  = () => { localStorage.setItem('zv_loggedIn', 'true');  setLoggedIn(true); };
  const handleLogout = () => { localStorage.setItem('zv_loggedIn', 'false'); setLoggedIn(false); };

  return loggedIn
    ? <Home onLogout={handleLogout} />
    : <Login onLogin={handleLogin} />;
}

const App = () => {
  return (
    <AppProvider>
      <AppInner />
    </AppProvider>
  );
}


export default App;