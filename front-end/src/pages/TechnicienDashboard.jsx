import { useEffect, useMemo, useState } from 'react';
import { FiTool, FiClock, FiCheckCircle } from 'react-icons/fi';
import DashboardShell from '../components/DashboardShell';
import NotificationBell from '../components/NotificationBell';
import { useAuth } from '../context/AuthContext';
import { STATUTS, statutLabel, statutStyle } from '../constants/statut';
import { getMyInterventions, updateInterventionStatut } from '../api/interventionApi';

function KpiCard({ icon: Icon, label, value, tone }) {
  return (
    <div className="dash-kpi">
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

      <div className="dash-card">
        <h3>Mes interventions</h3>
        {loading ? (
          <div className="dash-empty">Chargement...</div>
        ) : (
          <div className="table-responsive">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Titre</th>
                  <th className="d-none d-md-table-cell">Description</th>
                  <th>Date</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {interventions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="dash-empty">Aucune intervention assignée pour l'instant</td>
                  </tr>
                ) : (
                  interventions.map((i) => {
                    const style = statutStyle(i.statut);
                    return (
                      <tr key={i.id}>
                        <td>{i.titre}</td>
                        <td className="d-none d-md-table-cell">{i.description || '—'}</td>
                        <td>{i.dateIntervention || '—'}</td>
                        <td>
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
                      </tr>
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
