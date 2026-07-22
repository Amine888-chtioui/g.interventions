import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import { getInterventions } from '../api/interventionApi';
import { getUsers } from '../api/userApi';
import { statutLabel, statutColor } from '../constants/statut';

function StatCard({ title, value, icon, color }) {
  return (
    <div className="card border-0 shadow-sm h-100">
      <div className="card-body d-flex align-items-center gap-3">
        <div className={`stat-icon bg-${color} bg-opacity-10`}>
          <span className={`fs-4 text-${color}`}>{icon}</span>
        </div>
        <div>
          <div className="text-muted small">{title}</div>
          <div className="fs-4 fw-bold">{value}</div>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [interventions, setInterventions] = useState([]);
  const [technicienCount, setTechnicienCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [interventionsRes, usersRes] = await Promise.all([getInterventions(), getUsers()]);
        setInterventions(interventionsRes.data);
        setTechnicienCount(usersRes.data.filter((u) => u.role === 'TECHNICIEN').length);
      } catch {
        // le tableau de bord reste vide en cas d'erreur, les pages dédiées affichent le détail
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const enCoursCount = interventions.filter((i) => i.statut === 'EN_COURS').length;
  const dernieresInterventions = [...interventions]
    .sort((a, b) => b.id - a.id)
    .slice(0, 5);

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
            Admin
          </span>
        </div>

        <div className="row g-3 mb-4">
          <div className="col-12 col-sm-6 col-md-4">
            <StatCard title="Interventions totales" value={loading ? '—' : interventions.length} icon="🔧" color="primary" />
          </div>
          <div className="col-12 col-sm-6 col-md-4">
            <StatCard title="En cours" value={loading ? '—' : enCoursCount} icon="⏳" color="warning" />
          </div>
          <div className="col-12 col-sm-6 col-md-4">
            <StatCard title="Techniciens" value={loading ? '—' : technicienCount} icon="👷" color="success" />
          </div>
        </div>

        <div className="row g-3">
          <div className="col-12 col-lg-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-white fw-semibold border-bottom">
                Dernières interventions
              </div>
              {dernieresInterventions.length === 0 ? (
                <div className="card-body text-muted text-center py-5">
                  Aucune donnée pour l'instant
                </div>
              ) : (
                <ul className="list-group list-group-flush">
                  {dernieresInterventions.map((i) => (
                    <li key={i.id} className="list-group-item d-flex justify-content-between align-items-center gap-2">
                      <span className="text-truncate">{i.titre}</span>
                      <span className={`badge bg-${statutColor(i.statut)} flex-shrink-0`}>{statutLabel(i.statut)}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="col-12 col-lg-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-white fw-semibold border-bottom">
                Actions rapides
              </div>
              <div className="card-body d-flex flex-column gap-2">
                <button className="btn btn-primary" onClick={() => navigate('/admin/interventions')}>
                  + Nouvelle intervention
                </button>
                <button className="btn btn-outline-secondary" onClick={() => navigate('/admin/utilisateurs')}>
                  Gérer les techniciens
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
