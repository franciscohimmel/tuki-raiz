import React, { useState } from 'react';
import { directusApi } from '../../services/directus';
import { User, Lock, Eye, EyeOff } from 'lucide-react';
import './Login.css';

interface LoginProps {
  onLogin: (userData: any) => void;
}

const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [formData, setFormData] = useState({
    Usuario: '',
    Password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Buscar usuario en la tabla de usuarios
      const usuarios = await directusApi.getUsuarios();
      const usuario = usuarios.find((u: any) => 
        u.Usuario === formData.Usuario && u.Password === formData.Password
      );

      if (usuario) {
        // Login exitoso
        localStorage.setItem('raiz_user', JSON.stringify({
          id: usuario.id,
          nombre: usuario.Nombre,
          usuario: usuario.Usuario
        }));
        onLogin(usuario);
      } else {
        setError('Usuario o contraseña incorrectos');
      }
    } catch (error) {
      console.error('Error en login:', error);
      setError('Error de conexión. Intenta nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
            <h1>
              <img
                src="/logo.png" // Apunta a 'public/logo.png'
                alt="TUKI"
                style={{ height: '90px', width: 'auto' }} // Añade estilos para controlar el tamaño
              />
            </h1>
            <p>Ingresa a tu cuenta</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Usuario</label>
            <div className="input-with-icon">
              <User size={18} className="input-icon" />
              <input
                type="text"
                value={formData.Usuario}
                onChange={(e) => setFormData({...formData, Usuario: e.target.value})}
                className="form-input"
                placeholder="Ingresa tu usuario"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Contraseña</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={formData.Password}
                onChange={(e) => setFormData({...formData, Password: e.target.value})}
                className="form-input"
                placeholder="Ingresa tu contraseña"
                required
              />
              <button
                type="button"
                className="password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {error && (
            <div className="error-message">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            className="login-button"
            disabled={isLoading}
          >
            {isLoading ? 'Ingresando...' : 'Ingresar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;