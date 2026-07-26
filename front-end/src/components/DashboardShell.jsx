import { NavLink, useNavigate } from 'react-router-dom';
import { FiGrid, FiTool, FiUsers, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const ADMIN_NAV = [
  { to: '/admin', label: 'Tableau de bord', icon: FiGrid },
  { to: '/admin/interventions', label: 'Interventions', icon: FiTool },
  { to: '/admin/utilisateurs', label: 'Utilisateurs', icon: FiUsers },
];

const TECHNICIEN_NAV = [
  { to: '/technicien', label: 'Mes interventions', icon: FiTool },
];

function initials(email) {
  if (!email) return '?';
  const name = email.split('@')[0];
  return name.slice(0, 2).toUpperCase();
}

export default function DashboardShell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const navItems = user?.role === 'ADMIN' ? ADMIN_NAV : TECHNICIEN_NAV;

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className="dash-shell">
      <aside className="dash-side">
        <div className="dash-brand">
          <span className="dash-brand-mark">
            <FiTool />
          </span>
          <span>Interventions</span>
        </div>

        <nav className="dash-nav">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) => `dash-nav-item${isActive ? ' active' : ''}`}
            >
              <Icon /> {label}
            </NavLink>
          ))}
        </nav>

        <div className="dash-side-foot">
          <div className="dash-who-row">
            <span className="dash-avatar">{initials(user?.email)}</span>
            <div className="dash-who">
              <b title={user?.email}>{user?.email}</b>
              <span>{user?.role === 'ADMIN' ? 'Admin' : 'Technicien'}</span>
            </div>
          </div>
          <button className="dash-logout" onClick={handleLogout}>
            <FiLogOut /> <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      <div className="dash-main">{children}</div>
    </div>
  );
}
