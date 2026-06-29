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
    <nav className="navbar navbar-dark bg-primary px-4">
      <span className="navbar-brand fw-bold">Gestion Interventions</span>
      <div className="d-flex align-items-center gap-3">
        <span className="text-white small">{user?.email}</span>
        <span className={`badge ${user?.role === 'ADMIN' ? 'bg-warning text-dark' : 'bg-light text-dark'}`}>
          {user?.role}
        </span>
        <button className="btn btn-outline-light btn-sm" onClick={handleLogout}>
          Déconnexion
        </button>
      </div>
    </nav>
  );
}
