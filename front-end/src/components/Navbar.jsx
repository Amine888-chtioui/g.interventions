import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <nav className="navbar navbar-expand-md navbar-dark bg-primary shadow-sm sticky-top">
      <div className="container-fluid px-3 px-md-4">
        <span className="navbar-brand fw-bold d-flex align-items-center gap-2 mb-0">
          <span className="navbar-brand-icon">🔧</span>
          <span>Gestion Interventions</span>
        </span>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
          aria-controls="mainNavbar"
          aria-expanded="false"
          aria-label="Basculer la navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="mainNavbar">
          <div className="d-flex flex-column flex-md-row align-items-md-center gap-2 gap-md-3 ms-md-auto py-3 py-md-0">
            <span className="text-white small">{user?.email}</span>
            <span
              className={`badge align-self-start align-self-md-center ${user?.role === 'ADMIN' ? 'bg-warning text-dark' : 'bg-light text-dark'}`}
            >
              {user?.role}
            </span>
            <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
