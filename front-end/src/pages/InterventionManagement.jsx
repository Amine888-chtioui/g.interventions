import { Fragment, useEffect, useState } from 'react';
import DashboardShell from '../components/DashboardShell';
import NotificationBell from '../components/NotificationBell';
import PhotoGallery from '../components/PhotoGallery';
import { STATUTS, statutLabel, statutStyle } from '../constants/statut';
import { PRIORITES, prioriteLabel, prioriteStyle } from '../constants/priorite';
import { getUsers } from '../api/userApi';
import {
  getInterventions,
  createIntervention,
  updateIntervention,
  deleteIntervention,
} from '../api/interventionApi';
import { getRapportPdfBlob } from '../api/rapportApi';

const EMPTY_FORM = {
  titre: '',
  description: '',
  dateIntervention: '',
  technicienId: '',
  statut: 'EN_ATTENTE',
  priorite: 'NORMALE',
};

export default function InterventionManagement() {
  const [interventions, setInterventions] = useState([]);
  const [techniciens, setTechniciens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statutFilter, setStatutFilter] = useState('');
  const [prioriteFilter, setPrioriteFilter] = useState('');
  const hasActiveFilters = Boolean(debouncedSearch || statutFilter || prioriteFilter);

  const [showForm, setShowForm] = useState(false);
  const [editingIntervention, setEditingIntervention] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formError, setFormError] = useState('');
  const [saving, setSaving] = useState(false);

  const [loadingRapportId, setLoadingRapportId] = useState(null);

  const [viewingDetailsFor, setViewingDetailsFor] = useState(null);
  const [viewingPhotosFor, setViewingPhotosFor] = useState(null);

  useEffect(() => {
    fetchTechniciens();
  }, []);

  // Recherche en temps réel : on attend une pause de frappe avant d'interroger le serveur.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 300);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    fetchInterventions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, statutFilter, prioriteFilter]);

  async function fetchTechniciens() {
    try {
      const usersRes = await getUsers();
      setTechniciens(usersRes.data.filter((u) => u.role === 'TECHNICIEN'));
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des techniciens.');
    }
  }

  async function fetchInterventions() {
    setLoading(true);
    setError('');
    try {
      const params = {
        q: debouncedSearch || undefined,
        statut: statutFilter || undefined,
        priorite: prioriteFilter || undefined,
      };
      const { data } = await getInterventions(params);
      setInterventions(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des interventions.');
    } finally {
      setLoading(false);
    }
  }

  function resetFilters() {
    setSearch('');
    setDebouncedSearch('');
    setStatutFilter('');
    setPrioriteFilter('');
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
      priorite: i.priorite || 'NORMALE',
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
        priorite: form.priorite,
      };
      if (editingIntervention) {
        await updateIntervention(editingIntervention.id, payload);
      } else {
        await createIntervention(payload);
      }
      closeForm();
      await fetchInterventions();
    } catch (err) {
      setFormError(err.response?.data?.message || "Erreur lors de l'enregistrement.");
    } finally {
      setSaving(false);
    }
  }

  async function handleViewRapportPdf(i) {
    setLoadingRapportId(i.id);
    setError('');
    try {
      const { data } = await getRapportPdfBlob(i.id);
      const url = URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
      window.open(url, '_blank', 'noopener,noreferrer');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement du rapport.');
    } finally {
      setLoadingRapportId(null);
    }
  }

  function openDetailsView(i) {
    setViewingDetailsFor(i);
  }

  function closeDetailsView() {
    setViewingDetailsFor(null);
  }

  function openPhotosView(i) {
    setViewingPhotosFor(i);
  }

  function closePhotosView() {
    setViewingPhotosFor(null);
  }

  async function handleDelete(i) {
    if (!window.confirm(`Supprimer l'intervention "${i.titre}" ?`)) return;
    try {
      await deleteIntervention(i.id);
      await fetchInterventions();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression.');
    }
  }

  return (
    <DashboardShell>
      <div className="dash-topline">
        <div>
          <h2>Gestion des interventions</h2>
          <p>
            {loading
              ? 'Chargement…'
              : `${interventions.length} ${hasActiveFilters ? 'résultat' : 'intervention'}${interventions.length > 1 ? 's' : ''}${hasActiveFilters ? ' trouvé' + (interventions.length > 1 ? 's' : '') : ' au total'}`}
          </p>
        </div>
        <div className="dash-topline-actions">
          <NotificationBell />
          <button className="btn btn-primary btn-sm" onClick={openCreateForm}>
            + Nouvelle intervention
          </button>
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
              placeholder="Titre, description ou technicien..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="col-md-3">
            <label className="form-label">Statut</label>
            <select
              className="form-select"
              value={statutFilter}
              onChange={(e) => setStatutFilter(e.target.value)}
            >
              <option value="">Tous les statuts</option>
              {STATUTS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-3">
            <label className="form-label">Priorité</label>
            <select
              className="form-select"
              value={prioriteFilter}
              onChange={(e) => setPrioriteFilter(e.target.value)}
            >
              <option value="">Toutes les priorités</option>
              {PRIORITES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
          <div className="col-md-1">
            <button
              type="button"
              className="btn btn-outline-secondary w-100"
              onClick={resetFilters}
              disabled={!hasActiveFilters && !search}
              title="Réinitialiser les filtres"
            >
              ✕
            </button>
          </div>
        </div>
      </div>

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
              <div className="col-md-3">
                <label className="form-label">Date</label>
                <input
                  type="date"
                  name="dateIntervention"
                  className="form-control"
                  value={form.dateIntervention}
                  onChange={handleChange}
                />
              </div>
              <div className="col-md-3">
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
              <div className="col-md-3">
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
              <div className="col-md-3">
                <label className="form-label">Priorité</label>
                <select
                  name="priorite"
                  className="form-select"
                  value={form.priorite}
                  onChange={handleChange}
                >
                  {PRIORITES.map((p) => (
                    <option key={p.value} value={p.value}>
                      {p.label}
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

      {viewingPhotosFor && (
        <div className="dash-card">
          <div className="d-flex justify-content-between align-items-start">
            <h3>Photos — {viewingPhotosFor.titre}</h3>
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={closePhotosView}>
              Fermer
            </button>
          </div>
          <PhotoGallery interventionId={viewingPhotosFor.id} canManage={false} />
        </div>
      )}

      <div className="dash-card">
        <h3>Interventions<span>{interventions.length}</span></h3>
        {loading ? (
          <div className="dash-empty">Chargement...</div>
        ) : interventions.length === 0 ? (
          <div className="dash-empty">
            {hasActiveFilters ? 'Aucun résultat pour cette recherche' : 'Aucune intervention'}
          </div>
        ) : (
          <div className="table-responsive">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Date</th>
                  <th>Technicien</th>
                  <th>Statut</th>
                  <th>Priorité</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {interventions.map((i) => {
                  const style = statutStyle(i.statut);
                  const pStyle = prioriteStyle(i.priorite);
                  const isExpanded = viewingDetailsFor?.id === i.id;
                  return (
                    <Fragment key={i.id}>
                      <tr
                        className="dash-table-row-clickable"
                        onClick={() => (isExpanded ? closeDetailsView() : openDetailsView(i))}
                      >
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
                        <td>
                          <span className="dash-pill" style={{ background: pStyle.bg, color: pStyle.fg }}>
                            <span className="dot" style={{ background: pStyle.dot }} />
                            {prioriteLabel(i.priorite)}
                          </span>
                        </td>
                        <td className="text-end" onClick={(e) => e.stopPropagation()}>
                          {i.rapportDisponible && (
                            <button
                              className="btn btn-sm btn-outline-primary me-2"
                              onClick={() => handleViewRapportPdf(i)}
                              disabled={loadingRapportId === i.id}
                            >
                              {loadingRapportId === i.id ? 'Chargement...' : 'Voir le rapport'}
                            </button>
                          )}
                          <button
                            className="btn btn-sm btn-outline-secondary me-2"
                            onClick={() => openPhotosView(i)}
                          >
                            Photos{i.nombrePhotos > 0 ? ` (${i.nombrePhotos})` : ''}
                          </button>
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
                      {isExpanded && (
                        <tr>
                          <td colSpan={6} className="dash-table-details-cell">
                            <div className="d-flex justify-content-between align-items-start">
                              <h3>{viewingDetailsFor.titre}</h3>
                              <button
                                type="button"
                                className="btn btn-sm btn-outline-secondary"
                                onClick={closeDetailsView}
                              >
                                Fermer
                              </button>
                            </div>
                            <dl className="row mb-0">
                              <dt className="col-sm-3">Description</dt>
                              <dd className="col-sm-9" style={{ whiteSpace: 'pre-wrap' }}>
                                {viewingDetailsFor.description || '—'}
                              </dd>

                              <dt className="col-sm-3">Date</dt>
                              <dd className="col-sm-9">{viewingDetailsFor.dateIntervention || '—'}</dd>

                              <dt className="col-sm-3">Technicien</dt>
                              <dd className="col-sm-9">
                                {viewingDetailsFor.technicienId
                                  ? `${viewingDetailsFor.technicienPrenom} ${viewingDetailsFor.technicienNom}`
                                  : 'Non assigné'}
                              </dd>

                              <dt className="col-sm-3">Statut</dt>
                              <dd className="col-sm-9">{statutLabel(viewingDetailsFor.statut)}</dd>

                              <dt className="col-sm-3">Priorité</dt>
                              <dd className="col-sm-9">{prioriteLabel(viewingDetailsFor.priorite)}</dd>
                            </dl>
                          </td>
                        </tr>
                      )}
                    </Fragment>
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
