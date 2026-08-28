import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import Postmark from '../components/Postmark';
import PostCard from '../components/PostCard';
import PostComposer from '../components/PostComposer';
import EventCard from '../components/EventCard';
import { getCommunityBySlug, joinCommunity, leaveCommunity, getMembershipStatus } from '../api/communities';
import { getCommunityFeed } from '../api/posts';
import { listCommunityEvents } from '../api/events';
import { useAuth } from '../context/AuthContext';

export default function CommunityDetail() {
  const { slug } = useParams();
  const { user } = useAuth();

  const [community, setCommunity] = useState(null);
  const [posts, setPosts] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [joinState, setJoinState] = useState('none'); // 'none' | 'pending' | 'member'
  const [communityRole, setCommunityRole] = useState(null);
  const [joinBusy, setJoinBusy] = useState(false);
  const [joinMessage, setJoinMessage] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const communityData = await getCommunityBySlug(slug);
      setCommunity(communityData);
      const feedData = await getCommunityFeed(communityData._id);
      setPosts(feedData.posts || []);
      const eventsData = await listCommunityEvents(communityData._id, { status: 'upcoming' });
      setEvents(eventsData);

      if (user) {
        try {
          const membership = await getMembershipStatus(communityData._id);
          setJoinState(membership.status === 'approved' ? 'member' : membership.status === 'pending' ? 'pending' : 'none');
          setCommunityRole(membership.role || null);
        } catch {
          setJoinState('none');
        }
      }
    } catch {
      setError('This community could not be found.');
    } finally {
      setLoading(false);
    }
  }, [slug, user]);

  useEffect(() => {
    load();
  }, [load]);

  const handleJoin = async () => {
    if (!user) return;
    setJoinBusy(true);
    setJoinMessage('');
    try {
      await joinCommunity(community._id);
      setJoinState('pending');
      setJoinMessage('Your request to join has been sent for approval.');
    } catch (err) {
      setJoinMessage(err.response?.data?.message || 'Could not send join request.');
    } finally {
      setJoinBusy(false);
    }
  };

  const handleLeave = async () => {
    if (!user) return;
    setJoinBusy(true);
    setJoinMessage('');
    try {
      await leaveCommunity(community._id);
      setJoinState('none');
      setJoinMessage('You have left this community.');
    } catch (err) {
      setJoinMessage(err.response?.data?.message || 'Could not leave the community.');
    } finally {
      setJoinBusy(false);
    }
  };

  if (loading) {
    return <div className="container py-5 text-soft">Loading community…</div>;
  }

  if (error || !community) {
    return (
      <div className="container py-5 text-center">
        <h1 className="font-display">Community not found</h1>
        <p className="text-soft">{error}</p>
        <Link to="/communities" className="btn btn-outline-primary mt-3">
          Back to communities
        </Link>
      </div>
    );
  }

  return (
    <div className="container py-5">
      {community.coverImageUrl ? (
        <img
          src={community.coverImageUrl}
          alt=""
          className="mb-4"
          style={{
            width: '100%',
            maxHeight: 280,
            objectFit: 'cover',
            borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--color-line)',
          }}
        />
      ) : null}
      <div className="card p-4 mb-4 d-flex flex-row gap-4 align-items-start flex-wrap">
        <Postmark line1={community.place?.city} line2={community.place?.state} size={88} imageUrl={community.avatarUrl} />
        <div className="flex-grow-1">
          <h1 className="font-display mb-1" style={{ fontSize: '1.9rem' }}>
            {community.name}
          </h1>
          <div className="text-faint font-mono mb-2" style={{ fontSize: '0.8rem' }}>
            {(community.memberCount || 0).toLocaleString()} members ·{' '}
            {[community.place?.city, community.place?.state, community.place?.country]
              .filter(Boolean)
              .join(', ')}
          </div>
          {community.description ? <p className="text-soft mb-0">{community.description}</p> : null}
        </div>

        <div className="text-md-end text-start w-100 w-md-auto" style={{ minWidth: 200 }}>
          {!user ? (
            <Link to="/login" state={{ from: `/communities/${slug}` }} className="btn btn-primary">
              Log in to join
            </Link>
          ) : joinState === 'member' ? (
            <div className="d-flex gap-2 flex-wrap justify-content-md-end">
              <Link to={`/communities/${slug}/chat`} className="btn btn-primary">
                💬 Chat
              </Link>
              <button className="btn btn-outline-primary" onClick={handleLeave} disabled={joinBusy}>
                Leave community
              </button>
            </div>
          ) : joinState === 'pending' ? (
            <button className="btn btn-outline-primary" disabled>
              Request pending
            </button>
          ) : (
            <button className="btn btn-primary" onClick={handleJoin} disabled={joinBusy}>
              {joinBusy ? 'Requesting…' : 'Join community'}
            </button>
          )}
          {joinMessage ? (
            <div className="text-soft small mt-2" style={{ maxWidth: '24ch' }}>
              {joinMessage}
            </div>
          ) : null}
                    {joinState === 'member' && ['admin', 'moderator'].includes(communityRole) ? (
            <div className="mt-2 d-flex flex-column gap-1 align-items-md-end align-items-start">
              <Link to={`/communities/${slug}/edit`} className="small">
                Edit community →
              </Link>
              <Link to={`/communities/${slug}/requests`} className="small">
                Manage join requests →
              </Link>
            </div>
          ) : null}
        </div>
      </div>

      <hr className="road-divider" />

      <div className="row gy-4">
        <div className="col-lg-8">
          <h2 className="font-display mb-3" style={{ fontSize: '1.5rem' }}>
            Community feed
          </h2>

          {user && joinState === 'member' ? (
            <PostComposer
              communityId={community._id}
              onPosted={(p) => setPosts((prev) => [p, ...prev])}
              isModerator={['admin', 'moderator'].includes(communityRole)}
            />
          ) : null}

          {posts.length === 0 ? (
            <div className="card p-5 text-center">
              <p className="text-soft mb-0">No posts yet. Be the first to share something.</p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard key={post._id} post={post} canInteract={user && joinState === 'member'} />
            ))
          )}
        </div>

        <div className="col-lg-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h2 className="font-display mb-0" style={{ fontSize: '1.3rem' }}>
              Upcoming events
            </h2>
            {user && joinState === 'member' ? (
              <Link to={`/communities/${slug}/events/new`} className="btn btn-sm btn-outline-primary">
                + New
              </Link>
            ) : null}
          </div>

          {events.length === 0 ? (
            <div className="card p-4 text-center">
              <p className="text-soft small mb-0">No upcoming events yet.</p>
            </div>
          ) : (
            events.map((event) => <EventCard key={event._id} event={event} />)
          )}
        </div>
      </div>
    </div>
  );
}