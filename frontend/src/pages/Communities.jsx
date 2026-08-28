import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import Postmark from '../components/Postmark';
import { listCommunities } from '../api/communities';
import { useAuth } from '../context/AuthContext';

export default function Communities() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchCommunities = useCallback(async (searchTerm) => {
    setLoading(true);
    setError('');
    try {
      const data = await listCommunities(searchTerm ? { search: searchTerm } : {});
      setCommunities(data);
    } catch {
      setError('Could not load communities right now. Try again shortly.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCommunities('');
  }, [fetchCommunities]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCommunities(search);
  };

  return (
    <div className="container py-5">
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
        <div>
          <p className="eyebrow mb-2">Browse</p>
          <h1 className="font-display" style={{ fontSize: '2.2rem' }}>
            Find your community
          </h1>
        </div>
        {user ? (
          <Link to="/communities/new" className="btn btn-primary">
            + Start a community
          </Link>
        ) : null}
      </div>

      <form onSubmit={handleSearchSubmit} className="d-flex gap-2 mb-5" style={{ maxWidth: 420 }}>
        <input
          type="text"
          className="form-control"
          placeholder="Search by city, village, or name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          aria-label="Search communities"
        />
        <button type="submit" className="btn btn-outline-primary">
          Search
        </button>
      </form>

      {error ? (
        <div className="alert alert-danger">{error}</div>
      ) : loading ? (
        <p className="text-soft">Loading communities…</p>
      ) : communities.length === 0 ? (
        <div className="card p-5 text-center">
          <p className="font-display fs-4 mb-2">No communities found yet</p>
          <p className="text-soft mb-4">
            {search
              ? `Nothing matched "${search}". Be the first to start it.`
              : 'Be the first to bring your hometown online.'}
          </p>
          {user ? (
            <Link to="/communities/new" className="btn btn-primary mx-auto">
              Start a community
            </Link>
          ) : (
            <Link to="/register" className="btn btn-primary mx-auto">
              Create an account to start one
            </Link>
          )}
        </div>
      ) : (
        <div className="row gy-4">
          {communities.map((c) => (
            <div className="col-md-6 col-lg-4" key={c._id}>
              <Link to={`/communities/${c.slug}`} className="text-decoration-none">
                <div className="card h-100 p-4 d-flex flex-row gap-3 align-items-start">
                  <Postmark line1={c.place?.city} line2={c.place?.state} size={64} imageUrl={c.avatarUrl}/>
                  <div>
                    <div className="fw-semibold fs-5" style={{ color: 'var(--color-ink)' }}>
                      {c.name}
                    </div>
                    <div className="text-faint font-mono" style={{ fontSize: '0.78rem' }}>
                      {(c.memberCount || 0).toLocaleString()} members
                    </div>
                    {c.description ? (
                      <p className="text-soft mt-2 mb-0 small" style={{ maxWidth: '32ch' }}>
                        {c.description}
                      </p>
                    ) : null}
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
