import { Link } from 'react-router-dom';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function AnnouncementCard({ post }) {
  return (
    <Link to={`/posts/${post._id}`} className="text-decoration-none">
      <div className="card p-3 mb-3">
        <div className="d-flex justify-content-between align-items-start gap-2 mb-1">
          <span
            className="badge"
            style={{ background: 'var(--color-primary-tint)', color: 'var(--color-primary-dark)' }}
          >
            📢 News
          </span>
          <span className="text-faint font-mono" style={{ fontSize: '0.72rem' }}>
            {timeAgo(post.createdAt)}
          </span>
        </div>
        {post.community?.name ? (
          <div className="eyebrow mb-1" style={{ fontSize: '0.68rem' }}>
            {post.community.name}
          </div>
        ) : null}
        <p className="mb-0" style={{ color: 'var(--color-ink)' }}>
          {post.content}
        </p>
      </div>
    </Link>
  );
}