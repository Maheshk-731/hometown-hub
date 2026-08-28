import { useState } from 'react';
import { toggleLike } from '../api/posts';
import CommentSection from './CommentSection';
import ReportButton from './ReportButton';
import ShareButton from './ShareButton';

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function PostCard({ post, canInteract }) {
  const [likeCount, setLikeCount] = useState(post.likes?.length || 0);
  const [liked, setLiked] = useState(false);
  const [busy, setBusy] = useState(false);

  const handleLike = async () => {
    if (!canInteract || busy) return;
    setBusy(true);
    try {
      const data = await toggleLike(post._id);
      setLiked(data.liked);
      setLikeCount(data.likeCount);
    } catch {
      // silently ignore; UI stays unchanged
    } finally {
      setBusy(false);
    }
  };

  const postUrl = `${window.location.origin}/posts/${post._id}`;

  return (
    <article className="card p-4 mb-3">
      <div className="d-flex align-items-center gap-2 mb-2">
        <div
          aria-hidden="true"
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'var(--color-secondary-tint)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            color: 'var(--color-secondary-dark)',
          }}
        >
          {post.author?.name?.[0]?.toUpperCase() || '?'}
        </div>
        <div>
          <div className="fw-semibold" style={{ fontSize: '0.95rem' }}>
            {post.author?.name || 'Member'}
          </div>
          <div className="text-faint font-mono" style={{ fontSize: '0.72rem' }}>
            {timeAgo(post.createdAt)}
          </div>
        </div>
      </div>

      <p className="mb-3" style={{ whiteSpace: 'pre-wrap' }}>
        {post.content}
      </p>

      {post.imageUrl ? (
        <img
          src={post.imageUrl}
          alt=""
          className="mb-3"
          style={{
            width: '100%',
            maxHeight: 420,
            objectFit: 'cover',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--color-line)',
          }}
        />
      ) : null}

      <div className="d-flex gap-2 align-items-center flex-wrap">
        <button
          type="button"
          className="btn btn-sm btn-outline-primary"
          onClick={handleLike}
          disabled={!canInteract || busy}
        >
          {liked ? '♥' : '♡'} {likeCount}
        </button>
        <ShareButton url={postUrl} title="A post on Hometown Hub" />
        {canInteract ? <ReportButton targetType="post" targetId={post._id} /> : null}
      </div>

      <CommentSection postId={post._id} canInteract={canInteract} initialCount={post.commentCount || 0} />
    </article>
  );
}
