import { useEffect, useState } from 'react';
import DashboardShell from '../components/DashboardShell';
import NotificationBell from '../components/NotificationBell';
import { STATUTS, statutLabel, statutStyle } from '../constants/statut';
import { getUsers } from '../api/userApi';
import {
  getInterventions,
  createIntervention,
  updateIntervention,
  deleteIntervention,
} from '../api/interventionApi';

const EMPTY_FORM = {
  titre: '',
  description: '',
  dateIntervention: '',
  technicienId: '',
  statut: 'EN_ATTENTE',
};

export default function InterventionManagement() {
  const [interventions, setInterventions] = useState([]);
  const [techniciens, setTechniciens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [showForm, setShowForm] = useState(false);
  const [editingIntervention, setEditingIntervention] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    setError('');
    try {
      const [interventionsRes, usersRes] = await Promise.all([getInterventions(), getUsers()]);
      setInterventions(interventionsRes.data);
      setTechniciens(usersRes.data.filter((u) => u.role === 'TECHNICIEN'));
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des interventions.');
    } finally {
      setLoading(false);
    }
  }

  function openCreateForm() {
    setEditingIntervention(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setShowForm(true);
  }

  function openEditForm(i) {
    setEditingIntervention(i);
    setForm({
      titre: i.titre,
      description: i.description || '',
      dateIntervention: i.dateIntervention || '',
      technicienId: i.technicienId ? String(i.technicienId) : '',
      statut: i.statut,
    });
    setFormError('');
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditingIntervention(null);
  }

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    try {
      const payload = {
        titre: form.titre,
        description: form.description,
        dateIntervention: form.dateIntervention || null,
        technicienId: form.technicienId ? Number(form.technicienId) : null,
        statut: form.statut,
      };
      if (editingIntervention) {
        await updateIntervention(editingIntervention.id, payload);
      } else {
        await createIntervention(payload);
      }
      closeForm();
      await fetchData();
    } catch (err) {
      setFormError(err.response?.data?.message || "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(i) {
    if (!window.confirm(`Supprimer l'intervention "${i.titre}" ?`)) return;
    try {
      await deleteIntervention(i.id);
      await fetchData();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression.');
    }
  }

  return (
    <DashboardShell>
      <div className="dash-topline">
        <div>
          <h2>Gestion des interventions</h2>
          <p>{loading ? 'Chargement…' : `${interventions.length} intervention${interventions.length > 1 ? 's' : ''} au total`}</p>
        </div>
        <div className="dash-topline-actions">
          <NotificationBell />
          <button className="btn btn-primary btn-sm" onClick={openCreateForm}>
            + Nouvelle intervention
          </button>
        </div>
      </div>

      {error && <div className="alert alert-danger py-2">{error}</div>}

      {showForm && (
        <div className="dash-card">
          <h3>{editingIntervention ? 'Modifier une intervention' : 'Créer une intervention'}</h3>
          {formError && <div className="alert alert-danger py-2">{formError}</div>}
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label className="form-label">Titre</label>
              <input
                type="text"
                name="titre"
                className="form-control"
                value={form.titre}
                onChange={handleChange}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label">Description</label>
              <textarea
                name="description"
                className="form-control"
                rows={3}
                value={form.description}
                onChange={handleChange}
              />
            </div>

            <div className="row g-3 mb-3">
              <div className="col-md-4">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  name="dateIntervention"
                  className="form-control"
                  value={form.dateIntervention}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-4">
                <label className="form-label">Technicien assigné</label>
                <select
                  name="technicienId"
                  className="form-select"
                  value={form.technicienId}
                  onChange={handleChange}
                >
                  <option value="">Non assigné</option>
                  {techniciens.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.prenom} {t.nom}
                    </option>
                  ))}
                </select>
              </div>
              <div className="col-md-4">
                <label className="form-label">Statut</label>
                <select
                  name="statut"
                  className="form-select"
                  value={form.statut}
                  onChange={handleChange}
                >
                  {STATUTS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

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
        <h3>Interventions<span>{interventions.length}</span></h3>
        {loading ? (
          <div className="dash-empty">Chargement...</div>
        ) : interventions.length === 0 ? (
          <div className="dash-empty">Aucune intervention</div>
        ) : (
          <div className="table-responsive">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Date</th>
                  <th>Technicien</th>
                  <th>Statut</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {interventions.map((i) => {
                  const style = statutStyle(i.statut);
                  return (
                    <tr key={i.id}>
                      <td>{i.titre}</td>
                      <td>{i.dateIntervention || '—'}</td>
                      <td>
                        {i.technicienId ? `${i.technicienPrenom} ${i.technicienNom}` : (
                          <span className="text-muted">Non assigné</span>
                        )}
                      </td>
                      <td>
                        <span className="dash-pill" style={{ background: style.bg, color: style.fg }}>
                          <span className="dot" style={{ background: style.dot }} />
                          {statutLabel(i.statut)}
                        </span>
                      </td>
                      <td className="text-end">
                        <button
                          className="btn btn-sm btn-outline-secondary me-2"
                          onClick={() => openEditForm(i)}
                        >
                          Modifier
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDelete(i)}
                        >
                          Supprimer
                        </button>
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
  );
}
