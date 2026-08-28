export default function Footer() {
  return (
    <footer style={{ borderTop: '1px solid var(--color-line)', background: 'var(--color-bg-alt)' }} className="mt-auto">
      <div className="container py-5">
        <div className="row gy-4">
          <div className="col-md-4">
            <span className="font-display fs-5">Hometown Hub</span>
            <p className="text-soft mt-2 mb-0" style={{ maxWidth: '32ch' }}>
              A digital space for people from the same city or village to find each other again.
            </p>
          </div>
          <div className="col-6 col-md-4">
            <div className="eyebrow mb-2">Platform</div>
            <ul className="list-unstyled d-flex flex-column gap-2">
              <li><a href="/communities" className="nav-link-custom">Browse communities</a></li>
              <li><a href="/about" className="nav-link-custom">About</a></li>
            </ul>
          </div>
          <div className="col-6 col-md-4">
            <div className="eyebrow mb-2">Account</div>
            <ul className="list-unstyled d-flex flex-column gap-2">
              <li><a href="/login" className="nav-link-custom">Log in</a></li>
              <li><a href="/register" className="nav-link-custom">Create account</a></li>
            </ul>
          </div>
        </div>
        <hr className="road-divider" style={{ margin: '2.5rem 0 1.25rem' }} />
        <p className="text-faint small mb-0">© {new Date().getFullYear()} Hometown Hub. Built for the communities that raised us.</p>
      </div>
    </footer>
  );
}
