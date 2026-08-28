import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Postmark from '../components/Postmark';
import { listMyCommunities } from '../api/communities';

export default function MyCommunities() {
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    listMyCommunities()
      .then(setCommunities)
      .catch(() => setError('Could not load your communities right now.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="container py-5">
      <div className="d-flex flex-wrap justify-content-between align-items-end gap-3 mb-4">
        <div>
          <p className="eyebrow mb-2">Your communities</p>
          <h1 className="font-display" style={{ fontSize: '2.2rem' }}>
            My communities
          </h1>
        </div>
        <Link to="/communities" className="btn btn-outline-primary">
          Browse all communities
        </Link>
      </div>

      {loading ? (
        <p className="text-soft">Loading…</p>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : communities.length === 0 ? (
        <div className="card p-5 text-center">
          <p className="font-display fs-4 mb-2">You haven't joined a community yet</p>
          <p className="text-soft mb-4">Find your hometown and connect with people from there.</p>
          <Link to="/communities" className="btn btn-primary mx-auto">
            Browse communities
          </Link>
        </div>
      ) : (
        <div className="row gy-4">
          {communities.map((c) => (
            <div className="col-md-6 col-lg-4" key={c._id}>
              <Link to={`/communities/${c.slug}`} className="text-decoration-none">
                <div className="card h-100 p-4 d-flex flex-row gap-3 align-items-start">
                  <Postmark line1={c.place?.city} line2={c.place?.state} size={64} imageUrl={c.avatarUrl} />
                  <div>
                    <div className="fw-semibold fs-5" style={{ color: 'var(--color-ink)' }}>
                      {c.name}
                    </div>
                    <div className="text-faint font-mono" style={{ fontSize: '0.78rem' }}>
                      {(c.memberCount || 0).toLocaleString()} members
                    </div>
                    {c.myStatus === 'pending' ? (
                      <span
                        className="badge mt-2"
                        style={{ background: 'var(--color-primary-tint)', color: 'var(--color-primary-dark)' }}
                      >
                        Request pending
                      </span>
                    ) : (
                      <span
                        className="badge mt-2 text-capitalize"
                        style={{ background: 'var(--color-secondary-tint)', color: 'var(--color-secondary-dark)' }}
                      >
                        {c.myRole}
                      </span>
                    )}
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