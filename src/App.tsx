import React, { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './components/Dashboard/Dashboard';
import Login from './components/Login/Login';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay una sesión guardada
    const savedUser = localStorage.getItem('raiz_user');
    if (savedUser) {
      try {
        const userData = JSON.parse(savedUser);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        localStorage.removeItem('raiz_user');
      }
    }
    setIsLoading(false);
  }, []);

  const handleLogin = (userData: any) => {
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('raiz_user');
    setUser(null);
    setIsAuthenticated(false);
  };

  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh',
        fontSize: '18px',
        color: '#7c98b6'
      }}>
        Cargando...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Login onLogin={handleLogin} />;
  }

  return <Dashboard user={user} onLogout={handleLogout} />;
}

export default App;