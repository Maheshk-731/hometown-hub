import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Postmark from '../components/Postmark';
import { listCommunities } from '../api/communities';
import { useAuth } from '../context/AuthContext';

export default function Home() {
  const { user } = useAuth();
  const [communities, setCommunities] = useState([]);

  useEffect(() => {
    listCommunities()
      .then((data) => setCommunities(data.slice(0, 3)))
      .catch(() => setCommunities([]));
  }, []);
  return (
    <>
      {/* Hero */}
      <section className="container pt-5 pt-md-6 pb-5">
        <div className="row align-items-center gy-5">
          <div className="col-lg-7">
            <p className="eyebrow mb-3">A place to find your way back</p>
            <h1 className="font-display" style={{ fontSize: 'clamp(2.4rem, 5vw, 3.6rem)', lineHeight: 1.05 }}>
              Wherever you've moved,<br />your hometown moved with you.
            </h1>
            <p className="text-soft mt-4" style={{ fontSize: '1.15rem', maxWidth: '52ch' }}>
              Hometown Hub connects people who share a city or village — past and present — so news,
              events, and everyday conversation from home never feel far away.
            </p>
            <div className="d-flex flex-wrap gap-3 mt-4">
              <Link to={user ? '/my-communities' : '/register'} className="btn btn-primary btn-lg px-4">
                {user ? 'My communities' : 'Find your community'}
              </Link>
              <Link to="/communities" className="btn btn-outline-primary btn-lg px-4">
                Browse communities
              </Link>
            </div>
          </div>

          <div className="col-lg-5">
            <div
              className="card p-4"
              style={{ boxShadow: 'var(--shadow-card)', borderRadius: 'var(--radius-lg)' }}
            >
              <div className="eyebrow mb-3">Recently postmarked</div>
              {communities.length === 0 ? (
                <p className="text-soft small mb-0">
                  No communities yet —{' '}
                  <Link to={user ? '/communities/new' : '/register'}>be the first to start one</Link>.
                </p>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {communities.map((c) => (
                    <Link
                      key={c._id}
                      to={`/communities/${c.slug}`}
                      className="d-flex align-items-center gap-3 text-decoration-none"
                    >
                      <Postmark line1={c.place?.city} line2={c.place?.state} size={64} imageUrl={c.avatarUrl}/>
                      <div>
                        <div className="fw-semibold" style={{ color: 'var(--color-ink)' }}>
                          {c.name}
                        </div>
                        <div className="text-faint font-mono" style={{ fontSize: '0.8rem' }}>
                          {(c.memberCount || 0).toLocaleString()} members
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      <div className="container">
        <hr className="road-divider" />
      </div>

      {/* How it works */}
      <section className="container py-5">
        <h2 className="font-display mb-5" style={{ fontSize: '2rem' }}>
          Everything a hometown needs online
        </h2>
        <div className="row gy-4">
          <div className="col-md-4">
            <div className="card h-100 p-4">
              <div className="eyebrow mb-2">Find your people</div>
              <h3 className="font-display fs-4">Join by place</h3>
              <p className="text-soft mb-0">
                Search for your city or village and join a community built by the people who share it —
                no matter where they live now.
              </p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100 p-4">
              <div className="eyebrow mb-2">Stay in the loop</div>
              <h3 className="font-display fs-4">Local news &amp; posts</h3>
              <p className="text-soft mb-0">
                Share updates, ask questions, and see what's happening back home — organized, not
                scattered across group chats.
              </p>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card h-100 p-4">
              <div className="eyebrow mb-2">Show up</div>
              <h3 className="font-display fs-4">Local events</h3>
              <p className="text-soft mb-0">
                Organize reunions, festivals, and meetups, and see who else from home is planning to be
                there.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA band */}
      <section style={{ background: 'var(--color-secondary)' }} className="py-5 mt-4">
        <div className="container text-center">
          <h2 className="font-display" style={{ color: '#fdfbf5', fontSize: '1.9rem' }}>
            Your hometown is waiting to hear from you.
          </h2>
          <Link to={user ? '/my-communities' : '/register'} className="btn btn-primary btn-lg mt-3 px-5">
            {user ? 'My communities' : 'Create your account'}
          </Link>
        </div>
      </section>
    </>
  );
}