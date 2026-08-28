import { useState, useEffect, useRef, useCallback } from 'react';
import { listNotifications, markNotificationRead, markAllNotificationsRead } from '../api/notifications';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const ref = useRef(null);

  const unreadCount = items.filter((n) => !n.isRead).length;

  const load = useCallback(async () => {
    try {
      setItems(await listNotifications());
      setLoaded(true);
    } catch {
      // fail quietly; bell just won't populate
    }
  }, []);

  useEffect(() => {
    load();
    const interval = setInterval(load, 60000);
    return () => clearInterval(interval);
  }, [load]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleToggle = () => {
    setOpen((v) => !v);
    if (!loaded) load();
  };

  const handleMarkAll = async () => {
    try {
      await markAllNotificationsRead();
      setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch {
      // ignore
    }
  };

  const handleItemClick = async (n) => {
    if (!n.isRead) {
      try {
        await markNotificationRead(n._id);
        setItems((prev) => prev.map((x) => (x._id === n._id ? { ...x, isRead: true } : x)));
      } catch {
        // ignore
      }
    }
  };

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        className="btn btn-outline-primary btn-sm position-relative"
        onClick={handleToggle}
        aria-label="Notifications"
      >
        🔔
        {unreadCount > 0 ? (
          <span
            className="badge rounded-pill"
            style={{
              position: 'absolute',
              top: -6,
              right: -6,
              background: 'var(--color-accent)',
              color: '#fff',
              fontSize: '0.65rem',
            }}
          >
            {unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div
          className="card"
          style={{
            position: 'absolute',
            right: 0,
            top: '110%',
            width: 320,
            maxHeight: 400,
            overflowY: 'auto',
            zIndex: 50,
            boxShadow: 'var(--shadow-card)',
          }}
        >
          <div
            className="d-flex justify-content-between align-items-center p-3 border-bottom"
            style={{ borderColor: 'var(--color-line-soft)' }}
          >
            <span className="fw-semibold small">Notifications</span>
            {unreadCount > 0 ? (
              <button className="btn btn-link btn-sm p-0" onClick={handleMarkAll}>
                Mark all read
              </button>
            ) : null}
          </div>
          {items.length === 0 ? (
            <p className="text-soft small p-3 mb-0">No notifications yet.</p>
          ) : (
            items.map((n) => (
              <div
                key={n._id}
                onClick={() => handleItemClick(n)}
                className="p-3 border-bottom"
                style={{
                  borderColor: 'var(--color-line-soft)',
                  background: n.isRead ? 'transparent' : 'var(--color-primary-tint)',
                  cursor: 'pointer',
                }}
              >
                <p className="small mb-1">{n.message}</p>
                <span className="text-faint" style={{ fontSize: '0.7rem' }}>
                  {timeAgo(n.createdAt)}
                </span>
              </div>
            ))
          )}
        </div>
      ) : null}
    </div>
  );
}
