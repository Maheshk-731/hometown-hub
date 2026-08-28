import { useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import NotificationBell from '../NotificationBell';

export default function Navbar() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate('/');
  };

  const closeMenu = () => setMobileOpen(false);

  return (
    <header style={{ borderBottom: '1px solid var(--color-line)', background: 'var(--color-bg)' }}>
      <nav className="container d-flex align-items-center justify-content-between py-3">
        <Link to="/" className="d-flex align-items-center gap-2 text-decoration-none" onClick={closeMenu}>
          <span
            aria-hidden="true"
            style={{
              width: 34,
              height: 34,
              borderRadius: '50%',
              border: '2px dashed var(--color-primary-dark)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              color: 'var(--color-primary-dark)',
              fontSize: '1rem',
            }}
          >
            H
          </span>
          <span className="font-display fs-4" style={{ color: 'var(--color-ink)' }}>
            Hometown Hub
          </span>
        </Link>

        <div className="d-none d-md-flex align-items-center gap-4">
          <NavLink to="/communities" className="nav-link-custom">
            Communities
          </NavLink>
          {user ? (
            <NavLink to="/events" className="nav-link-custom">
              Events & News
            </NavLink>
          ) : null}
          <NavLink to="/about" className="nav-link-custom">
            About
          </NavLink>
        </div>

        <div className="d-none d-md-flex align-items-center gap-2">
          {loading ? null : user ? (
            <>
              <NotificationBell />
              {user.role === 'admin' ? (
                <Link to="/admin" className="btn btn-outline-primary btn-sm">
                  Admin
                </Link>
              ) : null}
              <Link to="/profile" className="text-soft small text-decoration-none">
                Hi, {user.name.split(' ')[0]}
              </Link>
              <button onClick={handleLogout} className="btn btn-outline-primary btn-sm">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" state={{ from: location.pathname }} className="btn btn-outline-primary btn-sm">
                Log in
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Join
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          className="d-md-none btn btn-outline-primary btn-sm"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          aria-label="Toggle menu"
        >
          {mobileOpen ? '✕' : '☰'}
        </button>
      </nav>

      {mobileOpen ? (
        <div className="d-md-none container pb-3 d-flex flex-column gap-3">
          <NavLink to="/communities" className="nav-link-custom" onClick={closeMenu}>
            Communities
          </NavLink>
          {user ? (
            <NavLink to="/events" className="nav-link-custom" onClick={closeMenu}>
              Events & News
            </NavLink>
          ) : null}
          <NavLink to="/about" className="nav-link-custom" onClick={closeMenu}>
            About
          </NavLink>
          {loading ? null : user ? (
            <>
              {user.role === 'admin' ? (
                <Link to="/admin" className="nav-link-custom" onClick={closeMenu}>
                  Admin
                </Link>
              ) : null}
              <Link to="/profile" className="nav-link-custom" onClick={closeMenu}>
                Profile
              </Link>
              <span className="text-soft small">Signed in as {user.name}</span>
              <button onClick={handleLogout} className="btn btn-outline-primary btn-sm align-self-start">
                Log out
              </button>
            </>
          ) : (
            <div className="d-flex gap-2">
              <Link to="/login" state={{ from: location.pathname }} className="btn btn-outline-primary btn-sm" onClick={closeMenu}>
                Log in
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm" onClick={closeMenu}>
                Join
              </Link>
            </div>
          )}
        </div>
      ) : null}
    </header>
  );
}