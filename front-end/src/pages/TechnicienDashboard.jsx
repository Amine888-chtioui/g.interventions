import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const STATUS_COLORS = {
  'En cours':  'warning',
  'Terminée':  'success',
  'En attente': 'secondary',
};

export default function TechnicienDashboard() {
  const { user } = useAuth();

  return (
    <>
      <Navbar />
      <div className="container py-4">
        <h5 className="mb-4 text-muted">
          Bonjour, <span className="text-dark fw-semibold">{user?.email}</span>
        </h5>

        <div className="card border-0 shadow-sm">
          <div className="card-header bg-white fw-semibold border-bottom">
            Mes interventions assignées
          </div>
          <div className="card-body">
            <table className="table table-hover mb-0">
              <thead className="table-light">
                <tr>
                  <th>#</th>
                  <th>Description</th>
                  <th>Date</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td colSpan={4} className="text-center text-muted py-4">
                    Aucune intervention assignée pour l'instant
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
