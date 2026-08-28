import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getCommunityBySlug, listJoinRequests, respondToJoinRequest } from '../api/communities';

export default function CommunityRequests() {
  const { slug } = useParams();
  const [community, setCommunity] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const communityData = await getCommunityBySlug(slug);
      setCommunity(communityData);
      const reqData = await listJoinRequests(communityData._id);
      setRequests(reqData);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not load join requests.');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  const handleDecision = async (membershipId, decision) => {
    setBusyId(membershipId);
    try {
      await respondToJoinRequest(community._id, membershipId, decision);
      setRequests((prev) => prev.filter((r) => r._id !== membershipId));
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update this request.');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <div className="container py-5 text-soft">Loading…</div>;

  if (error && !community) {
    return (
      <div className="container py-5 text-center">
        <h1 className="font-display">Could not load requests</h1>
        <p className="text-soft">{error}</p>
      </div>
    );
  }

  return (
    <div className="container py-5" style={{ maxWidth: 720 }}>
      <p className="eyebrow mb-2">
        Managing <Link to={`/communities/${slug}`}>{community.name}</Link>
      </p>
      <h1 className="font-display mb-4" style={{ fontSize: '1.9rem' }}>
        Join requests
      </h1>

      {error ? <div className="alert alert-danger">{error}</div> : null}

      {requests.length === 0 ? (
        <div className="card p-5 text-center">
          <p className="text-soft mb-0">No pending requests right now.</p>
        </div>
      ) : (
        requests.map((req) => (
          <div
            key={req._id}
            className="card p-3 mb-3 d-flex flex-row justify-content-between align-items-center"
          >
            <div>
              <div className="fw-semibold">{req.user?.name}</div>
              <div className="text-faint small">{req.user?.email}</div>
            </div>
            <div className="d-flex gap-2">
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => handleDecision(req._id, 'rejected')}
                disabled={busyId === req._id}
              >
                Decline
              </button>
              <button
                className="btn btn-sm btn-primary"
                onClick={() => handleDecision(req._id, 'approved')}
                disabled={busyId === req._id}
              >
                Approve
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
