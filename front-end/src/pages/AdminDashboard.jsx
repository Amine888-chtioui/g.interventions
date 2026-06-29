import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

function StatCard({ title, value, icon, color }) {
  return (
    <div className={`card border-0 shadow-sm`}>
      <div className="card-body d-flex align-items-center gap-3">
        <div className={`rounded-3 p-3 bg-${color} bg-opacity-10`}>
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

  return (
    <>
      <Navbar />
      <div className="container py-4">
        <h5 className="mb-4 text-muted">
          Bonjour, <span className="text-dark fw-semibold">{user?.email}</span>
        </h5>

        <div className="row g-3 mb-4">
          <div className="col-md-4">
            <StatCard title="Interventions totales" value="—" icon="🔧" color="primary" />
          </div>
          <div className="col-md-4">
            <StatCard title="En cours" value="—" icon="⏳" color="warning" />
          </div>
          <div className="col-md-4">
            <StatCard title="Techniciens" value="—" icon="👷" color="success" />
          </div>
        </div>

        <div className="row g-3">
          <div className="col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-white fw-semibold border-bottom">
                Dernières interventions
              </div>
              <div className="card-body text-muted text-center py-5">
                Aucune donnée pour l'instant
              </div>
            </div>
          </div>
          <div className="col-md-6">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-header bg-white fw-semibold border-bottom">
                Actions rapides
              </div>
              <div className="card-body d-flex flex-column gap-2">
                <button className="btn btn-primary">+ Nouvelle intervention</button>
                <button className="btn btn-outline-secondary">Gérer les techniciens</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
