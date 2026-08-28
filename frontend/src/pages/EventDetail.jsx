import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getEventById, toggleRsvp } from '../api/events';
import { useAuth } from '../context/AuthContext';

function formatFull(dateStr) {
  return new Date(dateStr).toLocaleString(undefined, {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function EventDetail() {
  const { id } = useParams();
  const { user } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [attending, setAttending] = useState(false);
  const [rsvpBusy, setRsvpBusy] = useState(false);
  const [rsvpMessage, setRsvpMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await getEventById(id);
      setEvent(data);
      if (user) {
        setAttending(data.attendees?.some((a) => a._id === user.id || a === user.id));
      }
    } catch {
      setError('This event could not be found.');
    } finally {
      setLoading(false);
    }
  }, [id, user]);

  useEffect(() => {
    load();
  }, [load]);

  const handleRsvp = async () => {
    if (!user) return;
    setRsvpBusy(true);
    setRsvpMessage('');
    try {
      const data = await toggleRsvp(event._id);
      setAttending(data.attending);
      setEvent((e) => ({
        ...e,
        attendees: data.attending
          ? [...(e.attendees || []), user.id]
          : (e.attendees || []).filter((a) => a !== user.id && a._id !== user.id),
      }));
    } catch (err) {
      setRsvpMessage(err.response?.data?.message || 'Could not update RSVP.');
    } finally {
      setRsvpBusy(false);
    }
  };

  if (loading) return <div className="container py-5 text-soft">Loading event…</div>;

  if (error || !event) {
    return (
      <div className="container py-5 text-center">
        <h1 className="font-display">Event not found</h1>
        <p className="text-soft">{error}</p>
      </div>
    );
  }

  return (
    <div className="container py-5" style={{ maxWidth: 640 }}>
      <p className="eyebrow mb-2">
        {event.status === 'cancelled' ? 'Cancelled event' : 'Community event'}
      </p>
      <h1 className="font-display mb-3" style={{ fontSize: '2rem' }}>
        {event.title}
      </h1>

      {event.coverImageUrl ? (
        <img
          src={event.coverImageUrl}
          alt=""
          className="mb-4"
          style={{
            width: '100%',
            maxHeight: 320,
            objectFit: 'cover',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-line)',
          }}
        />
      ) : null}

      <div className="card p-4 mb-4">
        <div className="d-flex flex-column gap-2">
          <div>
            <span className="eyebrow d-block mb-1">When</span>
            {formatFull(event.startDate)}
          </div>
          {event.location ? (
            <div>
              <span className="eyebrow d-block mb-1">Where</span>
              {event.location}
            </div>
          ) : null}
          <div>
            <span className="eyebrow d-block mb-1">Attending</span>
            {event.attendees?.length || 0} people
          </div>
        </div>
      </div>

      {event.description ? (
        <p className="text-soft mb-4" style={{ whiteSpace: 'pre-wrap' }}>
          {event.description}
        </p>
      ) : null}

      {event.status !== 'cancelled' ? (
        user ? (
          <button
            className={attending ? 'btn btn-outline-primary' : 'btn btn-primary'}
            onClick={handleRsvp}
            disabled={rsvpBusy}
          >
            {rsvpBusy ? 'Updating…' : attending ? "I'm no longer going" : "I'm going"}
          </button>
        ) : (
          <Link to="/login" state={{ from: `/events/${id}` }} className="btn btn-primary">
            Log in to RSVP
          </Link>
        )
      ) : null}
      {rsvpMessage ? <div className="text-danger small mt-2">{rsvpMessage}</div> : null}
    </div>
  );
}