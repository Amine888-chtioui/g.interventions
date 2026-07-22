import { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { STATUTS, statutLabel, statutColor } from '../constants/statut';
import { getMyInterventions, updateInterventionStatut } from '../api/interventionApi';

export default function TechnicienDashboard() {
  const { user } = useAuth();

  const [interventions, setInterventions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

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

  return (
    <>
      <Navbar />
      <div className="container py-4">
        <div className="dashboard-hero mb-4 d-flex flex-column flex-sm-row justify-content-between align-items-sm-center gap-3">
          <div>
            <div className="opacity-75 small">Tableau de bord</div>
            <h4 className="fw-bold mb-0 text-break">
              Bonjour, {user?.email}
            </h4>
          </div>
          <span className="badge bg-white text-primary fs-6 align-self-start align-self-sm-auto px-3 py-2">
            Technicien
          </span>
        </div>

        {error && <div className="alert alert-danger py-2">{error}</div>}

        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white fw-semibold border-bottom">
            Mes interventions assignées
          </div>
          <div className="card-body p-0">
            {loading ? (
              <div className="text-center text-muted py-5">Chargement...</div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover mb-0 align-middle">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-3">#</th>
                      <th>Titre</th>
                      <th className="d-none d-md-table-cell">Description</th>
                      <th>Date</th>
                      <th>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {interventions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center text-muted py-4">
                          Aucune intervention assignée pour l'instant
                        </td>
                      </tr>
                    ) : (
                      interventions.map((i) => (
                        <tr key={i.id}>
                          <td className="ps-3">{i.id}</td>
                          <td>{i.titre}</td>
                          <td className="d-none d-md-table-cell">{i.description || '—'}</td>
                          <td>{i.dateIntervention || '—'}</td>
                          <td>
                            <div className="d-flex flex-column flex-xl-row align-items-start align-items-xl-center gap-2">
                              <span className={`badge bg-${statutColor(i.statut)}`}>
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
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
