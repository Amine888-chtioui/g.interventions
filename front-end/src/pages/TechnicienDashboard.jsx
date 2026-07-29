import { Fragment, useEffect, useMemo, useState } from 'react';
import { FiTool, FiClock, FiCheckCircle } from 'react-icons/fi';
import DashboardShell from '../components/DashboardShell';
import NotificationBell from '../components/NotificationBell';
import PhotoGallery from '../components/PhotoGallery';
import useReveal from '../hooks/useReveal';
import { useAuth } from '../context/AuthContext';
import { STATUTS, statutLabel, statutStyle } from '../constants/statut';
import { prioriteLabel, prioriteStyle } from '../constants/priorite';
import { getMyInterventions, updateInterventionStatut } from '../api/interventionApi';
import { getRapport, createRapport, updateRapport } from '../api/rapportApi';

const EMPTY_RAPPORT_FORM = {
  dateDebut: '',
  dateFin: '',
  descriptionTravaux: '',
  materielUtilise: '',
  difficultesRencontrees: '',
  solutionAppliquee: '',
  observations: '',
};

function KpiCard({ icon: Icon, label, value, tone }) {
  const { ref, className } = useReveal();
  return (
    <div ref={ref} className={`dash-kpi ${className}`}>
      <div className={`ico tone-${tone}`}>
        <Icon />
      </div>
      <div className="val">{value}</div>
      <div className="lbl">{label}</div>
    </div>
  );
}

export default function TechnicienDashboard() {
  const { user } = useAuth();
  const rapportCardReveal = useReveal();
  const photosCardReveal = useReveal();
  const mainCardReveal = useReveal();

  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  const [rapportIntervention, setRapportIntervention] = useState(null);
  const [rapportMode, setRapportMode] = useState('create');
  const [rapportForm, setRapportForm] = useState(EMPTY_RAPPORT_FORM);
  const [rapportLoading, setRapportLoading] = useState(false);
  const [rapportError, setRapportError] = useState('');
  const [rapportSaving, setRapportSaving] = useState(false);

  const [viewingDetailsFor, setViewingDetailsFor] = useState(null);
  const [photosIntervention, setPhotosIntervention] = useState(null);

  useEffect(() => {
    fetchInterventions();
  }, []);

  async function fetchInterventions() {
    setLoading(true);
    setError('');
    try {
      const { data } = await getMyInterventions();
      setInterventions(data);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors du chargement des interventions.');
    } finally {
      setLoading(false);
    }
  }

  async function handleStatutChange(intervention, statut) {
    setUpdatingId(intervention.id);
    try {
      await updateInterventionStatut(intervention.id, statut);
      await fetchInterventions();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la mise à jour du statut.');
    } finally {
      setUpdatingId(null);
    }
  }

  async function openRapportForm(intervention) {
    setRapportIntervention(intervention);
    setRapportError('');
    setRapportForm(EMPTY_RAPPORT_FORM);

    if (intervention.rapportDisponible) {
      setRapportMode('edit');
      setRapportLoading(true);
      try {
        const { data } = await getRapport(intervention.id);
        setRapportForm({
          dateDebut: data.dateDebut || '',
          dateFin: data.dateFin || '',
          descriptionTravaux: data.descriptionTravaux || '',
          materielUtilise: data.materielUtilise || '',
          difficultesRencontrees: data.difficultesRencontrees || '',
          solutionAppliquee: data.solutionAppliquee || '',
          observations: data.observations || '',
        });
      } catch (err) {
        setRapportError(err.response?.data?.message || 'Erreur lors du chargement du rapport.');
      } finally {
        setRapportLoading(false);
      }
    } else {
      setRapportMode('create');
    }
  }

  function closeRapportForm() {
    setRapportIntervention(null);
    setRapportForm(EMPTY_RAPPORT_FORM);
    setRapportError('');
  }

  function openPhotosPanel(intervention) {
    setPhotosIntervention(intervention);
  }

  function closePhotosPanel() {
    setPhotosIntervention(null);
  }

  function openDetailsView(intervention) {
    setViewingDetailsFor(intervention);
  }

  function closeDetailsView() {
    setViewingDetailsFor(null);
  }

  function handleRapportChange(e) {
    setRapportForm({ ...rapportForm, [e.target.name]: e.target.value });
  }

  async function handleRapportSubmit(e) {
    e.preventDefault();
    setRapportError('');
    setRapportSaving(true);
    try {
      if (rapportMode === 'edit') {
        await updateRapport(rapportIntervention.id, rapportForm);
      } else {
        await createRapport(rapportIntervention.id, rapportForm);
      }
      closeRapportForm();
      await fetchInterventions();
    } catch (err) {
      setRapportError(err.response?.data?.message || "Erreur lors de l'enregistrement du rapport.");
    } finally {
      setRapportSaving(false);
    }
  }

  const statusCounts = useMemo(() => {
    const counts = { EN_ATTENTE: 0, EN_COURS: 0, TERMINEE: 0, ANNULEE: 0 };
    interventions.forEach((i) => {
      if (counts[i.statut] !== undefined) counts[i.statut] += 1;
    });
    return counts;
  }, [interventions]);

  return (
    <DashboardShell>
      <div className="dash-topline">
        <div>
          <h2>Bonjour, {user?.email}</h2>
          <p>Voici les interventions qui vous sont assignées</p>
        </div>
        <div className="dash-topline-actions">
          <NotificationBell />
        </div>
      </div>

      {error && <div className="alert alert-danger py-2">{error}</div>}

      <div className="dash-kpis dash-kpis-3">
        <KpiCard icon={FiTool} label="Interventions assignées" value={loading ? '—' : interventions.length} tone="accent" />
        <KpiCard icon={FiClock} label="En cours" value={loading ? '—' : statusCounts.EN_COURS} tone="warn" />
        <KpiCard icon={FiCheckCircle} label="Terminées" value={loading ? '—' : statusCounts.TERMINEE} tone="good" />
      </div>

      {rapportIntervention && (
        <div ref={rapportCardReveal.ref} className={`dash-card ${rapportCardReveal.className}`}>
          <h3>
            Rapport d'intervention — {rapportIntervention.titre}
          </h3>
          {rapportError && <div className="alert alert-danger py-2">{rapportError}</div>}
          {rapportLoading ? (
            <div className="dash-empty">Chargement du rapport...</div>
          ) : (
            <form onSubmit={handleRapportSubmit}>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label">Date de début</label>
                  <input
                    type="datetime-local"
                    name="dateDebut"
                    className="form-control"
                    value={rapportForm.dateDebut}
                    onChange={handleRapportChange}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Date de fin</label>
                  <input
                    type="datetime-local"
                    name="dateFin"
                    className="form-control"
                    value={rapportForm.dateFin}
                    onChange={handleRapportChange}
                    required
                  />
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Description des travaux réalisés</label>
                <textarea
                  name="descriptionTravaux"
                  className="form-control"
                  rows={3}
                  value={rapportForm.descriptionTravaux}
                  onChange={handleRapportChange}
                  required
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Matériel utilisé</label>
                <textarea
                  name="materielUtilise"
                  className="form-control"
                  rows={2}
                  value={rapportForm.materielUtilise}
                  onChange={handleRapportChange}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Difficultés rencontrées</label>
                <textarea
                  name="difficultesRencontrees"
                  className="form-control"
                  rows={2}
                  value={rapportForm.difficultesRencontrees}
                  onChange={handleRapportChange}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Solution appliquée</label>
                <textarea
                  name="solutionAppliquee"
                  className="form-control"
                  rows={2}
                  value={rapportForm.solutionAppliquee}
                  onChange={handleRapportChange}
                />
              </div>

              <div className="mb-3">
                <label className="form-label">Observations</label>
                <textarea
                  name="observations"
                  className="form-control"
                  rows={2}
                  value={rapportForm.observations}
                  onChange={handleRapportChange}
                />
              </div>

              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary" disabled={rapportSaving}>
                  {rapportSaving ? 'Enregistrement...' : 'Enregistrer le rapport'}
                </button>
                <button type="button" className="btn btn-outline-secondary" onClick={closeRapportForm}>
                  Annuler
                </button>
              </div>
            </form>
          )}
        </div>
      )}

      {photosIntervention && (
        <div ref={photosCardReveal.ref} className={`dash-card ${photosCardReveal.className}`}>
          <h3>
            Photos — {photosIntervention.titre}
            <button type="button" className="btn btn-sm btn-outline-secondary" onClick={closePhotosPanel}>
              Fermer
            </button>
          </h3>
          <PhotoGallery interventionId={photosIntervention.id} canManage />
        </div>
      )}

      <div ref={mainCardReveal.ref} className={`dash-card ${mainCardReveal.className}`}>
        <h3>Mes interventions</h3>
        {loading ? (
          <div className="dash-empty">Chargement...</div>
        ) : (
          <div className="table-responsive">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Titre</th>
                  <th>Date</th>
                  <th>Priorité</th>
                  <th>Statut</th>
                  <th>Rapport</th>
                  <th>Photos</th>
                </tr>
              </thead>
              <tbody>
                {interventions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="dash-empty">Aucune intervention assignée pour l'instant</td>
                  </tr>
                ) : (
                  interventions.map((i) => {
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
                            <span className="dash-pill" style={{ background: pStyle.bg, color: pStyle.fg }}>
                              <span className="dot" style={{ background: pStyle.dot }} />
                              {prioriteLabel(i.priorite)}
                            </span>
                          </td>
                          <td onClick={(e) => e.stopPropagation()}>
                            <div className="d-flex flex-column flex-xl-row align-items-start align-items-xl-center gap-2">
                              <span className="dash-pill" style={{ background: style.bg, color: style.fg }}>
                                <span className="dot" style={{ background: style.dot }} />
                                {statutLabel(i.statut)}
                              </span>
                              <select
                                className="form-select form-select-sm w-auto"
                                value={i.statut}
                                disabled={updatingId === i.id}
                                onChange={(e) => handleStatutChange(i, e.target.value)}
                              >
                                {STATUTS.map((s) => (
                                  <option key={s.value} value={s.value}>
                                    {s.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </td>
                          <td onClick={(e) => e.stopPropagation()}>
                            {i.statut === 'TERMINEE' ? (
                              <button
                                className="btn btn-sm btn-outline-primary"
                                onClick={() => openRapportForm(i)}
                              >
                                {i.rapportDisponible ? 'Voir / Modifier' : 'Rédiger le rapport'}
                              </button>
                            ) : (
                              <span className="text-muted">—</span>
                            )}
                          </td>
                          <td onClick={(e) => e.stopPropagation()}>
                            <button
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => openPhotosPanel(i)}
                            >
                              Photos{i.nombrePhotos > 0 ? ` (${i.nombrePhotos})` : ''}
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

                                <dt className="col-sm-3">Priorité</dt>
                                <dd className="col-sm-9">{prioriteLabel(viewingDetailsFor.priorite)}</dd>

                                <dt className="col-sm-3">Statut</dt>
                                <dd className="col-sm-9">{statutLabel(viewingDetailsFor.statut)}</dd>
                              </dl>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardShell>
  );
}
