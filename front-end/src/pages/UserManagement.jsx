import { useEffect, useState } from 'react';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import DashboardShell from '../components/DashboardShell';
import NotificationBell from '../components/NotificationBell';
import Toast from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { getUsers, createUser, updateUser, deleteUser } from '../api/userApi';

const EMPTY_FORM = { nom: '', prenom: '', email: '', password: '', role: 'TECHNICIEN' };

const ROLE_STYLE = {
  ADMIN: { dot: '#b5790a', bg: '#fdf0d8', fg: '#8a5c07' },
  TECHNICIEN: { dot: '#0d6efd', bg: '#e8eefb', fg: '#0d6efd' },
};

export default function UserManagement() {
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  // Recherche en temps réel : on attend une pause de frappe avant d'interroger le serveur.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch]);

  async function fetchUsers() {
    setLoading(true);
    setError('');
    try {
      const { data } = await getUsers({ q: debouncedSearch || undefined });
      setUsers(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des utilisateurs.');
    } finally {
      setLoading(false);
    }
  }

  function openCreateForm() {
    setEditingUser(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setShowForm(true);
  }

  function openEditForm(u) {
    setEditingUser(u);
    setForm({ nom: u.nom, prenom: u.prenom, email: u.email, password: '', role: u.role });
    setFormError('');
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingUser(null);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      if (editingUser) {
        const { nom, prenom, email, role } = form;
        await updateUser(editingUser.id, { nom, prenom, email, role });
        setToast('Utilisateur modifié avec succès.');
      } else {
        await createUser(form);
        setToast('Utilisateur créé avec succès.');
      }
      closeForm();
      await fetchUsers();
    } catch (err) {
      setFormError(err.response?.data?.message || "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(u) {
    if (!window.confirm(`Supprimer l'utilisateur ${u.prenom} ${u.nom} ?`)) return;
    try {
      await deleteUser(u.id);
      setToast('Utilisateur supprimé avec succès.');
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression.');
    }
  }

  return (
    <>
      {toast && <Toast key={toast} message={toast} onDone={() => setToast('')} />}
      <DashboardShell>
      <div className="dash-topline">
        <div>
          <h2>Gestion des utilisateurs</h2>
          <p>
            {loading
              ? 'Chargement…'
              : `${users.length} ${debouncedSearch ? 'résultat' : 'utilisateur'}${users.length > 1 ? 's' : ''}${debouncedSearch ? ' trouvé' + (users.length > 1 ? 's' : '') : ' au total'}`}
          </p>
        </div>
        <div className="dash-topline-actions">
          <button className="btn btn-primary btn-sm" onClick={openCreateForm}>
            + Nouvel utilisateur
          </button>
          <NotificationBell />
        </div>
      </div>

      {error && <div className="alert alert-danger py-2">{error}</div>}

      <div className="dash-card">
        <div className="row g-3 align-items-end">
          <div className="col-md-5">
            <label className="form-label">Recherche</label>
            <input
              type="search"
              className="form-control"
              placeholder="Nom, prénom ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="col-md-1">
            <button
              type="button"
              className="btn btn-outline-secondary w-100"
              onClick={() => setSearch('')}
              disabled={!search}
              title="Réinitialiser la recherche"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

      {showForm && (
        <div className="dash-card">
          <h3>{editingUser ? 'Modifier un utilisateur' : 'Créer un utilisateur'}</h3>
          {formError && <div className="alert alert-danger py-2">{formError}</div>}
          <form onSubmit={handleSubmit}>
            <div className="row g-3 mb-3">
              <div className="col-md-6">
                <label className="form-label">Nom</label>
                <input
                  type="text"
                  name="nom"
                  className="form-control"
                  value={form.nom}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6">
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

            <div className="row g-3 mb-3">
              <div className="col-md-6">
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
              <div className="col-md-6">
                <label className="form-label">Rôle</label>
                <select
                  name="role"
                  className="form-select"
                  value={form.role}
                  onChange={handleChange}
                >
                  <option value="TECHNICIEN">Technicien</option>
                  <option value="ADMIN">Admin</option>
                </select>
              </div>
            </div>

            {!editingUser && (
              <div className="mb-3">
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
            )}

            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Enregistrement...' : 'Enregistrer'}
              </button>
              <button type="button" className="btn btn-outline-secondary" onClick={closeForm}>
                Annuler
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="dash-card">
        <h3>Utilisateurs<span>{users.length}</span></h3>
        {loading ? (
          <div className="dash-empty">Chargement...</div>
        ) : users.length === 0 ? (
          <div className="dash-empty">
            {debouncedSearch ? 'Aucun résultat pour cette recherche' : 'Aucun utilisateur'}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Prénom</th>
                  <th>Email</th>
                  <th>Rôle</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const style = ROLE_STYLE[u.role] || ROLE_STYLE.TECHNICIEN;
                  return (
                    <tr key={u.id}>
                      <td>{u.nom}</td>
                      <td>{u.prenom}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className="dash-pill" style={{ background: style.bg, color: style.fg }}>
                          <span className="dot" style={{ background: style.dot }} />
                          {u.role}
                        </span>
                      </td>
                      <td className="text-end">
                        <div className="dash-table-actions">
                          <button
                            type="button"
                            className="dash-table-action-btn"
                            onClick={() => openEditForm(u)}
                            aria-label="Modifier"
                          >
                            <span className="dash-table-action-tip">Modifier</span>
                            <FiEdit2 />
                          </button>
                          <button
                            type="button"
                            className="dash-table-action-btn is-danger"
                            disabled={u.email === user?.email}
                            onClick={() => handleDelete(u)}
                            aria-label="Supprimer"
                          >
                            <span className="dash-table-action-tip">
                              {u.email === user?.email ? 'Vous ne pouvez pas supprimer votre propre compte' : 'Supprimer'}
                            </span>
                            <FiTrash2 />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </DashboardShell>
    </>
  );
}
