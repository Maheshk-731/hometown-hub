import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="container py-5" style={{ maxWidth: 720 }}>
      <p className="eyebrow mb-2">Why we built this</p>
      <h1 className="font-display mb-4" style={{ fontSize: '2.2rem' }}>
        A place to stay close to home, from anywhere
      </h1>

      <p className="text-soft" style={{ fontSize: '1.05rem' }}>
        People move — for work, for school, for a different life. But the place you're from doesn't
        stop mattering just because you're not there anymore. Hometown Hub exists so the people who
        share a city or village, wherever they've ended up, can find each other, share news, and show
        up for the things that matter back home.
      </p>

      <hr className="road-divider" />

      <h2 className="font-display mb-3" style={{ fontSize: '1.5rem' }}>
        How it works
      </h2>
      <div className="row gy-4 mb-5">
        <div className="col-md-4">
          <div className="eyebrow mb-2">01</div>
          <p className="fw-semibold mb-1">Find your place</p>
          <p className="text-soft small mb-0">Search for your hometown or start a community if it isn't there yet.</p>
        </div>
        <div className="col-md-4">
          <div className="eyebrow mb-2">02</div>
          <p className="fw-semibold mb-1">Join and connect</p>
          <p className="text-soft small mb-0">Request to join, get approved by local moderators, and start posting.</p>
        </div>
        <div className="col-md-4">
          <div className="eyebrow mb-2">03</div>
          <p className="fw-semibold mb-1">Stay involved</p>
          <p className="text-soft small mb-0">Follow local news, join conversations, and RSVP to events and reunions.</p>
        </div>
      </div>

      <div className="card p-4 text-center">
        <p className="font-display fs-4 mb-2">Ready to find your community?</p>
        <Link to="/communities" className="btn btn-primary mx-auto">
          Browse communities
        </Link>
      </div>
    </div>
  );
}
