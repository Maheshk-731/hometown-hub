import { Link } from 'react-router-dom';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function formatTime(dateStr) {
  return new Date(dateStr).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' });
}

export default function EventCard({ event }) {
  const day = new Date(event.startDate).getDate();
  const month = new Date(event.startDate).toLocaleDateString(undefined, { month: 'short' });

  return (
    <Link to={`/events/${event._id}`} className="text-decoration-none">
      <div className="card p-3 mb-3 d-flex flex-row gap-3 align-items-start">
        <div
          className="text-center flex-shrink-0"
          style={{
            width: 56,
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-line)',
            overflow: 'hidden',
          }}
        >
          <div
            className="font-mono text-uppercase"
            style={{ background: 'var(--color-secondary)', color: '#fdfbf5', fontSize: '0.65rem', padding: '2px 0' }}
          >
            {month}
          </div>
          <div className="font-display fw-bold" style={{ fontSize: '1.3rem', color: 'var(--color-ink)' }}>
            {day}
          </div>
        </div>
        <div className="flex-grow-1">
          <div className="fw-semibold" style={{ color: 'var(--color-ink)' }}>
            {event.title}
            {event.status === 'cancelled' ? (
              <span
                className="badge ms-2"
                style={{ background: 'var(--color-accent-tint)', color: 'var(--color-accent)' }}
              >
                Cancelled
              </span>
            ) : null}
          </div>
          <div className="text-faint font-mono" style={{ fontSize: '0.75rem' }}>
            {formatDate(event.startDate)} · {formatTime(event.startDate)}
            {event.location ? ` · ${event.location}` : ''}
          </div>
          {event.community?.name ? (
            <div className="eyebrow mt-1" style={{ fontSize: '0.68rem' }}>
              {event.community.name}
            </div>
          ) : null}
          <div className="text-soft small mt-1">{event.attendees?.length || 0} going</div>
        </div>
      </div>
    </Link>
  );
}