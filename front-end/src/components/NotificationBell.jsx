import { useEffect, useRef, useState } from 'react';
import { FiBell, FiBellOff, FiTool, FiCheckCircle } from 'react-icons/fi';
import {
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  subscribeToNotifications,
} from '../api/notificationApi';

const TYPE_ICON = {
  ASSIGNATION: FiTool,
  TERMINEE: FiCheckCircle,
};

function timeAgo(dateString) {
  const diffMin = Math.round((Date.now() - new Date(dateString).getTime()) / 60000);
  if (diffMin < 1) return "à l'instant";
  if (diffMin < 60) return `il y a ${diffMin} min`;
  const diffH = Math.round(diffMin / 60);
  if (diffH < 24) return `il y a ${diffH} h`;
  return `il y a ${Math.round(diffH / 24)} j`;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const wrapRef = useRef(null);

  useEffect(() => {
    let active = true;

    getNotifications()
      .then(({ data }) => {
        if (active) setNotifications(data);
      })
      .catch(() => {});

    const unsubscribe = subscribeToNotifications((notif) => {
      if (active) setNotifications((prev) => [notif, ...prev]);
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    function handleClickOutside(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.lue).length;

  async function handleItemClick(n) {
    if (n.lue) return;
    setNotifications((prev) => prev.map((x) => (x.id === n.id ? { ...x, lue: true } : x)));
    try {
      await markNotificationRead(n.id);
    } catch {
      // l'état local reste marqué comme lu même si l'appel échoue
    }
  }

  async function handleMarkAll() {
    setNotifications((prev) => prev.map((x) => ({ ...x, lue: true })));
    try {
      await markAllNotificationsRead();
    } catch {
      // idem : pas de rollback visuel pour une action de confort
    }
  }

  return (
    <div className="dash-notif" ref={wrapRef}>
      <button
        className="dash-icon-btn"
        aria-label="Notifications"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <FiBell />
        {unreadCount > 0 && <span className="dash-notif-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>}
      </button>

      {open && (
        <div className="dash-notif-panel">
          <div className="dash-notif-header">
            <span>Notifications</span>
            {unreadCount > 0 && (
              <button className="dash-notif-markall" onClick={handleMarkAll}>
                Tout marquer comme lu
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <div className="dash-notif-empty">
              <FiBellOff className="dash-notif-icon" />
              <div className="dash-notif-title">Aucune notification pour le moment</div>
              <div className="dash-notif-sub">Les alertes apparaîtront ici en direct</div>
            </div>
          ) : (
            <ul className="dash-notif-list">
              {notifications.map((n) => {
                const Icon = TYPE_ICON[n.type] || FiBell;
                return (
                  <li
                    key={n.id}
                    className={`dash-notif-item${n.lue ? '' : ' unread'}`}
                    onClick={() => handleItemClick(n)}
                  >
                    <span className="dash-notif-item-ico">
                      <Icon />
                    </span>
                    <div className="dash-notif-item-body">
                      <div className="dash-notif-item-msg">{n.message}</div>
                      <div className="dash-notif-item-time">{timeAgo(n.dateCreation)}</div>
                    </div>
                    {!n.lue && <span className="dash-notif-dot" />}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
