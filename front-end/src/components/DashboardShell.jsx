import { NavLink, useNavigate } from 'react-router-dom';
import { FiGrid, FiTool, FiUsers, FiUser, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';

const ADMIN_NAV = [
  { to: '/admin', label: 'Tableau de bord', shortLabel: 'Accueil', icon: FiGrid },
  { to: '/admin/interventions', label: 'Interventions', shortLabel: 'Interventions', icon: FiTool },
  { to: '/admin/utilisateurs', label: 'Utilisateurs', shortLabel: 'Utilisateurs', icon: FiUsers },
  { to: '/profile', label: 'Mon profil', shortLabel: 'Profil', icon: FiUser },
];

const TECHNICIEN_NAV = [
  { to: '/technicien', label: 'Mes interventions', shortLabel: 'Accueil', icon: FiTool },
  { to: '/profile', label: 'Mon profil', shortLabel: 'Profil', icon: FiUser },
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

        <nav className="dash-nav dash-nav--side">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end
              className={({ isActive }) => `dash-nav-item${isActive ? ' active' : ''}`}
            >
              <Icon /> <span>{label}</span>
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

      <nav className="dash-nav dash-nav--bottom">
        {navItems.map(({ to, shortLabel, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end
            className={({ isActive }) => `dash-nav-item${isActive ? ' active' : ''}`}
          >
            <Icon /> <span>{shortLabel || label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
