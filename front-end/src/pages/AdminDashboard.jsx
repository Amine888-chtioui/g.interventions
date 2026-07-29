import { useEffect, useMemo, useState } from 'react';
import { FiTool, FiClock, FiCheckCircle, FiUsers } from 'react-icons/fi';
import DashboardShell from '../components/DashboardShell';
import NotificationBell from '../components/NotificationBell';
import useReveal from '../hooks/useReveal';
import { useAuth } from '../context/AuthContext';
import { getInterventions } from '../api/interventionApi';
import { getUsers } from '../api/userApi';
import { statutLabel, statutStyle } from '../constants/statut';

const STATUT_ORDER = ['EN_ATTENTE', 'EN_COURS', 'TERMINEE', 'ANNULEE'];
const TECH_COLORS = ['#2a78d6', '#eb6834', '#1baf7a', '#eda100', '#e87ba4'];

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

function StatusDonut({ counts, total }) {
  if (total === 0) {
    return <div className="dash-donut" style={{ background: '#eceef2' }} />;
  }
  let cursor = 0;
  const stops = STATUT_ORDER.map((s) => {
    const pct = (counts[s] / total) * 100;
    const from = cursor;
    cursor += pct;
    return `${statutStyle(s).dot} ${from}% ${cursor}%`;
  }).join(', ');

  return (
    <div className="dash-donut" style={{ background: `conic-gradient(${stops})` }}>
      <div className="dash-donut-mid">
        <b>{total}</b>
        <span>total</span>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const { user } = useAuth();
  const donutCardReveal = useReveal();
  const techCardReveal = useReveal();
  const recentCardReveal = useReveal();

  const [interventions, setInterventions] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [interventionsRes, usersRes] = await Promise.all([getInterventions(), getUsers()]);
        setInterventions(interventionsRes.data);
        setUsers(usersRes.data);
      } catch {
        // le tableau de bord reste vide en cas d'erreur, les pages dédiées affichent le détail
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const technicienCount = users.filter((u) => u.role === 'TECHNICIEN').length;

  const statusCounts = useMemo(() => {
    const counts = { EN_ATTENTE: 0, EN_COURS: 0, TERMINEE: 0, ANNULEE: 0 };
    interventions.forEach((i) => {
      if (counts[i.statut] !== undefined) counts[i.statut] += 1;
    });
    return counts;
  }, [interventions]);

  const parTechnicien = useMemo(() => {
    const map = new Map();
    interventions.forEach((i) => {
      if (!i.technicienId) return;
      const entry = map.get(i.technicienId) || {
        name: `${i.technicienPrenom || ''} ${i.technicienNom || ''}`.trim() || `Technicien #${i.technicienId}`,
        count: 0,
      };
      entry.count += 1;
      map.set(i.technicienId, entry);
    });
    return [...map.values()].sort((a, b) => b.count - a.count).slice(0, 5);
  }, [interventions]);

  const maxTech = parTechnicien.length ? parTechnicien[0].count : 1;

  const dernieresInterventions = [...interventions].sort((a, b) => b.id - a.id).slice(0, 5);

  return (
    <DashboardShell>
      <div className="dash-topline">
        <div>
          <h2>Bonjour, {user?.email}</h2>
          <p>Voici l'activité des interventions</p>
        </div>
        <div className="dash-topline-actions">
          <NotificationBell />
        </div>
      </div>

      <div className="dash-kpis">
        <KpiCard icon={FiTool} label="Interventions totales" value={loading ? '—' : interventions.length} tone="accent" />
        <KpiCard icon={FiClock} label="En cours" value={loading ? '—' : statusCounts.EN_COURS} tone="warn" />
        <KpiCard icon={FiCheckCircle} label="Terminées" value={loading ? '—' : statusCounts.TERMINEE} tone="good" />
        <KpiCard icon={FiUsers} label="Techniciens actifs" value={loading ? '—' : technicienCount} tone="muted" />
      </div>

      <div className="dash-grid2">
        <div ref={donutCardReveal.ref} className={`dash-card ${donutCardReveal.className}`}>
          <h3>
            Répartition par statut
            <span>{loading ? '…' : `${interventions.length} interventions`}</span>
          </h3>
          {loading ? (
            <div className="dash-empty">Chargement...</div>
          ) : interventions.length === 0 ? (
            <div className="dash-empty">Aucune donnée pour l'instant</div>
          ) : (
            <div className="dash-donut-wrap">
              <StatusDonut counts={statusCounts} total={interventions.length} />
              <ul className="dash-legend">
                {STATUT_ORDER.map((s) => (
                  <li className="li" key={s}>
                    <span className="dot" style={{ background: statutStyle(s).dot }} />
                    <span className="txt">{statutLabel(s)}</span>
                    <b>{statusCounts[s]}</b>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        <div ref={techCardReveal.ref} className={`dash-card ${techCardReveal.className}`}>
          <h3>
            Interventions par technicien
            <span>Top 5</span>
          </h3>
          {loading ? (
            <div className="dash-empty">Chargement...</div>
          ) : parTechnicien.length === 0 ? (
            <div className="dash-empty">Aucune intervention assignée</div>
          ) : (
            <div className="dash-bars">
              {parTechnicien.map((t, idx) => (
                <div className="bar-row" key={idx}>
                  <span className="name" title={t.name}>{t.name}</span>
                  <div className="bar-track">
                    <div
                      className="bar-fill"
                      style={{ width: `${(t.count / maxTech) * 100}%`, background: TECH_COLORS[idx % TECH_COLORS.length] }}
                    />
                  </div>
                  <span className="n">{t.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div ref={recentCardReveal.ref} className={`dash-card ${recentCardReveal.className}`}>
        <h3>Dernières interventions</h3>
        {loading ? (
          <div className="dash-empty">Chargement...</div>
        ) : dernieresInterventions.length === 0 ? (
          <div className="dash-empty">Aucune donnée pour l'instant</div>
        ) : (
          <div className="table-responsive">
            <table className="dash-table">
              <thead>
                <tr>
                  <th>Titre</th>
                  <th className="d-none d-md-table-cell">Technicien</th>
                  <th className="d-none d-md-table-cell">Date</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {dernieresInterventions.map((i) => {
                  const style = statutStyle(i.statut);
                  return (
                    <tr key={i.id}>
                      <td className="text-truncate">{i.titre}</td>
                      <td className="d-none d-md-table-cell">
                        {i.technicienId ? `${i.technicienPrenom} ${i.technicienNom}` : <span className="text-muted">Non assigné</span>}
                      </td>
                      <td className="d-none d-md-table-cell">{i.dateIntervention || '—'}</td>
                      <td>
                        <span className="dash-pill" style={{ background: style.bg, color: style.fg }}>
                          <span className="dot" style={{ background: style.dot }} />
                          {statutLabel(i.statut)}
                        </span>
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
