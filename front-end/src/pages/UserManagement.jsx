import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { getUsers, createUser, updateUser, deleteUser } from '../api/userApi';

const EMPTY_FORM = { nom: '', prenom: '', email: '', password: '', role: 'TECHNICIEN' };

export default function UserManagement() {
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    setLoading(true);
    setError('');
    try {
      const { data } = await getUsers();
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
      } else {
        await createUser(form);
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
      await fetchUsers();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression.');
    }
  }

  return (
    <>
      <Navbar />
      <div className="container py-4">
        <div className="d-flex justify-content-between align-items-center mb-4">
          <div>
            <Link to="/admin" className="text-decoration-none small">&larr; Retour au tableau de bord</Link>
            <h4 className="fw-bold mt-1 mb-0">Gestion des utilisateurs</h4>
          </div>
          <button className="btn btn-primary" onClick={openCreateForm}>
            + Nouvel utilisateur
          </button>
        </div>

        {error && <div className="alert alert-danger py-2">{error}</div>}

        {showForm && (
          <div className="card border-0 shadow-sm mb-4">
            <div className="card-header bg-white fw-semibold border-bottom">
              {editingUser ? 'Modifier un utilisateur' : 'Créer un utilisateur'}
            </div>
            <div className="card-body">
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
          </div>
        )}

        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white fw-semibold border-bottom">
            Utilisateurs ({users.length})
          </div>
          <div className="card-body p-0">
            {loading ? (
              <div className="text-center text-muted py-5">Chargement...</div>
            ) : users.length === 0 ? (
              <div className="text-center text-muted py-5">Aucun utilisateur</div>
            ) : (
              <table className="table table-hover mb-0 align-middle">
                <thead>
                  <tr>
                    <th className="ps-3">Nom</th>
                    <th>Prénom</th>
                    <th>Email</th>
                    <th>Rôle</th>
                    <th className="text-end pe-3">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id}>
                      <td className="ps-3">{u.nom}</td>
                      <td>{u.prenom}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className={`badge ${u.role === 'ADMIN' ? 'bg-warning text-dark' : 'bg-light text-dark'}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="text-end pe-3">
                        <button
                          className="btn btn-sm btn-outline-secondary me-2"
                          onClick={() => openEditForm(u)}
                        >
                          Modifier
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          disabled={u.email === user?.email}
                          title={u.email === user?.email ? 'Vous ne pouvez pas supprimer votre propre compte' : ''}
                          onClick={() => handleDelete(u)}
                        >
                          Supprimer
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
