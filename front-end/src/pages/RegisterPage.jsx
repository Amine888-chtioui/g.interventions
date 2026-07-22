import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { register as apiRegister } from '../api/authApi';

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    nom: '', prenom: '', email: '', password: '', role: 'TECHNICIEN',
  });

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
      await apiRegister(form);
      const role = await login(form.email, form.password);
      navigate(role === 'ADMIN' ? '/admin' : '/technicien');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de l\'inscription.');
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
              Rejoignez la plateforme et suivez vos interventions techniques en toute simplicité.
            </p>
          </div>

          <div className="col-lg-7">
            <div className="auth-form-panel">
              <h4 className="fw-bold mb-1">Créer un compte</h4>
              <p className="text-muted mb-4">Renseignez vos informations pour commencer.</p>

              {error && <div className="alert alert-danger py-2">{error}</div>}

              <form onSubmit={handleSubmit}>
                <div className="row g-3 mb-3">
                  <div className="col-12 col-sm-6">
                    <label className="form-label">Nom</label>
                    <input
                      type="text"
                      name="nom"
                      className="form-control"
                      value={form.nom}
                      onChange={handleChange}
                      required
                      autoFocus
                    />
                  </div>
                  <div className="col-12 col-sm-6">
                    <label className="form-label">Prénom</label>
                    <input
                      type="text"
                      name="prenom"
                      className="form-control"
                      value={form.prenom}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    value={form.email}
                    onChange={handleChange}
                    required
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
                    minLength={6}
                  />
                </div>

                <button
                  type="submit"
                  className="btn btn-primary w-100 py-2"
                  disabled={loading}
                >
                  {loading ? 'Inscription...' : "S'inscrire"}
                </button>
              </form>

              <hr className="my-4" />
              <p className="text-center text-muted small mb-0">
                Déjà un compte ?{' '}
                <Link to="/login" className="text-primary fw-semibold text-decoration-none">Se connecter</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
