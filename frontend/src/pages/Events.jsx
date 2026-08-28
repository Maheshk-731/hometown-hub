import { useState, useEffect, useCallback } from 'react';
import EventCard from '../components/EventCard';
import AnnouncementCard from '../components/AnnouncementCard';
import { listMyEvents } from '../api/events';
import { listMyAnnouncements } from '../api/posts';

export default function Events() {
  const [tab, setTab] = useState('events'); // 'events' | 'news'

  return (
    <div className="container py-5" style={{ maxWidth: 720 }}>
      <p className="eyebrow mb-2">Your calendar</p>
      <h1 className="font-display mb-4" style={{ fontSize: '2rem' }}>
        Events &amp; News
      </h1>

      <div className="d-flex gap-2 mb-4">
        <button
          className={tab === 'events' ? 'btn btn-primary btn-sm' : 'btn btn-outline-primary btn-sm'}
          onClick={() => setTab('events')}
        >
          Events
        </button>
        <button
          className={tab === 'news' ? 'btn btn-primary btn-sm' : 'btn btn-outline-primary btn-sm'}
          onClick={() => setTab('news')}
        >
          News
        </button>
      </div>

      {tab === 'events' ? <EventsTab /> : <NewsTab />}
    </div>
  );
}

function EventsTab() {
  const [filter, setFilter] = useState('all');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async (f) => {
    setLoading(true);
    setError('');
    try {
      const data = await listMyEvents(f === 'attending' ? 'attending' : undefined);
      setEvents(data);
    } catch {
      setError('Could not load your events right now.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(filter);
  }, [filter, load]);

  return (
    <>
      <div className="d-flex gap-2 mb-3">
        <button
          className={filter === 'all' ? 'btn btn-primary btn-sm' : 'btn btn-outline-primary btn-sm'}
          onClick={() => setFilter('all')}
        >
          All upcoming
        </button>
        <button
          className={filter === 'attending' ? 'btn btn-primary btn-sm' : 'btn btn-outline-primary btn-sm'}
          onClick={() => setFilter('attending')}
        >
          I'm going
        </button>
      </div>

      {loading ? (
        <p className="text-soft">Loading events…</p>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : events.length === 0 ? (
        <div className="card p-5 text-center">
          <p className="text-soft mb-0">
            {filter === 'attending'
              ? "You haven't RSVP'd to any upcoming events yet."
              : 'No upcoming events in your communities yet.'}
          </p>
        </div>
      ) : (
        events.map((event) => <EventCard key={event._id} event={event} />)
      )}
    </>
  );
}

function NewsTab() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    listMyAnnouncements()
      .then(setAnnouncements)
      .catch(() => setError('Could not load news right now.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-soft">Loading news…</p>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (announcements.length === 0) {
    return (
      <div className="card p-5 text-center">
        <p className="text-soft mb-0">No news posted in your communities yet.</p>
      </div>
    );
  }

  return (
    <>
      {announcements.map((post) => (
        <AnnouncementCard key={post._id} post={post} />
      ))}
    </>
  );
}