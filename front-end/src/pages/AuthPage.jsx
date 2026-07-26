import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiEye, FiEyeOff, FiAlertCircle, FiKey } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { register as apiRegister } from '../api/authApi';

function initialModeFromLocation() {
  return window.location.pathname.startsWith('/register') ? 'register' : 'login';
}

export default function AuthPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState(initialModeFromLocation);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginShowPassword, setLoginShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  const [registerForm, setRegisterForm] = useState({
    nom: '', prenom: '', email: '', password: '', role: 'TECHNICIEN',
  });
  const [registerShowPassword, setRegisterShowPassword] = useState(false);
  const [registerError, setRegisterError] = useState('');
  const [registerLoading, setRegisterLoading] = useState(false);

  function switchMode(next) {
    setMode(next);
    window.history.pushState(null, '', next === 'register' ? '/register' : '/login');
  }

  function handleLoginChange(e) {
    setLoginForm({ ...loginForm, [e.target.name]: e.target.value });
  }

  async function handleLoginSubmit(e) {
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);
    try {
      const role = await login(loginForm.email, loginForm.password);
      navigate(role === 'ADMIN' ? '/admin' : '/technicien');
    } catch {
      setLoginError('Email ou mot de passe incorrect.');
    } finally {
      setLoginLoading(false);
    }
  }

  function handleRegisterChange(e) {
    setRegisterForm({ ...registerForm, [e.target.name]: e.target.value });
  }

  async function handleRegisterSubmit(e) {
    e.preventDefault();
    setRegisterError('');
    setRegisterLoading(true);
    try {
      await apiRegister(registerForm);
      const role = await login(registerForm.email, registerForm.password);
      navigate(role === 'ADMIN' ? '/admin' : '/technicien');
    } catch (err) {
      setRegisterError(err.response?.data?.message || "Erreur lors de l'inscription.");
    } finally {
      setRegisterLoading(false);
    }
  }

  return (
    <div className="auth2-page">
      <div className={`authp-card shadow-lg ${mode === 'register' ? 'is-register' : ''}`}>
        <div className="authp-form authp-form--login">
          <h2 className="auth2-title">Connexion</h2>

          {loginError && (
            <div className="auth-alert alert alert-danger py-2">
              <FiAlertCircle /> {loginError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit}>
            <div className="mb-3">
              <input
                type="email"
                name="email"
                className="auth2-input"
                placeholder="Email"
                value={loginForm.email}
                onChange={handleLoginChange}
                required
              />
            </div>
            <div className="mb-3 auth2-input-group">
              <input
                type={loginShowPassword ? 'text' : 'password'}
                name="password"
                className="auth2-input"
                placeholder="Mot de passe"
                value={loginForm.password}
                onChange={handleLoginChange}
                required
              />
              <button
                type="button"
                className="auth2-password-toggle"
                onClick={() => setLoginShowPassword((v) => !v)}
                aria-label={loginShowPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {loginShowPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            <button type="submit" className="auth2-submit-btn" disabled={loginLoading}>
              {loginLoading && <span className="btn-spinner" />}
              {loginLoading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          <Link to="/forgot-password" className="auth2-forgot-link">
            <FiKey /> Mot de passe oublié ?
          </Link>

          <p className="authp-mobile-toggle">
            Pas encore de compte ?{' '}
            <button type="button" onClick={() => switchMode('register')}>Créer un compte</button>
          </p>
        </div>

        <div className="authp-form authp-form--register">
          <h2 className="auth2-title">Créer un compte</h2>

          {registerError && (
            <div className="auth-alert alert alert-danger py-2">
              <FiAlertCircle /> {registerError}
            </div>
          )}

          <form onSubmit={handleRegisterSubmit}>
            <div className="row g-2 mb-3">
              <div className="col-6">
                <input
                  type="text"
                  name="nom"
                  className="auth2-input"
                  placeholder="Nom"
                  value={registerForm.nom}
                  onChange={handleRegisterChange}
                  required
                />
              </div>
              <div className="col-6">
                <input
                  type="text"
                  name="prenom"
                  className="auth2-input"
                  placeholder="Prénom"
                  value={registerForm.prenom}
                  onChange={handleRegisterChange}
                  required
                />
              </div>
            </div>
            <div className="mb-3">
              <input
                type="email"
                name="email"
                className="auth2-input"
                placeholder="Email"
                value={registerForm.email}
                onChange={handleRegisterChange}
                required
              />
            </div>
            <div className="mb-3 auth2-input-group">
              <input
                type={registerShowPassword ? 'text' : 'password'}
                name="password"
                className="auth2-input"
                placeholder="Mot de passe (min. 6 caractères)"
                value={registerForm.password}
                onChange={handleRegisterChange}
                required
                minLength={6}
              />
              <button
                type="button"
                className="auth2-password-toggle"
                onClick={() => setRegisterShowPassword((v) => !v)}
                aria-label={registerShowPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {registerShowPassword ? <FiEyeOff /> : <FiEye />}
              </button>
            </div>

            <button type="submit" className="auth2-submit-btn" disabled={registerLoading}>
              {registerLoading && <span className="btn-spinner" />}
              {registerLoading ? 'Inscription...' : "S'inscrire"}
            </button>
          </form>

          <p className="authp-mobile-toggle">
            Déjà un compte ?{' '}
            <button type="button" onClick={() => switchMode('login')}>Se connecter</button>
          </p>
        </div>

        <div className="authp-overlay-container">
          <div className="authp-overlay">
            <div className="authp-overlay-panel authp-overlay-panel--left">
              <h2 className="auth2-brand-title">Content de vous revoir !</h2>
              <p className="auth2-brand-text">
                Connectez-vous pour accéder à votre espace de gestion des interventions.
              </p>
              <button type="button" className="auth2-outline-btn" onClick={() => switchMode('login')}>
                Connexion
              </button>
            </div>
            <div className="authp-overlay-panel authp-overlay-panel--right">
              <h2 className="auth2-brand-title">Bienvenue !</h2>
              <p className="auth2-brand-text">
                Suivez, assignez et gérez les interventions techniques en toute simplicité.
              </p>
              <button type="button" className="auth2-outline-btn" onClick={() => switchMode('register')}>
                Créer un compte
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
