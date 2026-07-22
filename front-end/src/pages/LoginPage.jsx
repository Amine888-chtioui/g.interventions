import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const role = await login(form.email, form.password);
      navigate(role === 'ADMIN' ? '/admin' : '/technicien');
    } catch {
      setError('Email ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card shadow-lg">
        <div className="row g-0">
          <div className="col-lg-5 d-none d-lg-flex auth-brand-panel flex-column justify-content-center p-5">
            <div className="auth-brand-icon mb-4">🔧</div>
            <h2 className="fw-bold mb-3">Gestion des Interventions</h2>
            <p className="opacity-75 mb-0">
              Suivez, assignez et gérez les interventions techniques en toute simplicité, où que vous soyez.
            </p>
          </div>

          <div className="col-lg-7">
            <div className="auth-form-panel">
              <h4 className="fw-bold mb-1">Connexion</h4>
              <p className="text-muted mb-4">Accédez à votre espace de gestion.</p>

              {error && <div className="alert alert-danger py-2">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={form.email}
                    onChange={handleChange}
                    required
                    autoFocus
                  />
                </div>
                <div className="mb-4">
                  <label className="form-label">Mot de passe</label>
                  <input
                    type="password"
                    name="password"
                    className="form-control"
                    value={form.password}
                    onChange={handleChange}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2"
                  disabled={loading}
                >
                  {loading ? 'Connexion...' : 'Se connecter'}
                </button>
              </form>

              <hr className="my-4" />
              <p className="text-center text-muted small mb-0">
                Pas encore de compte ?{' '}
                <Link to="/register" className="text-primary fw-semibold text-decoration-none">S'inscrire</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
