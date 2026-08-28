import { useState } from 'react';
import { listComments, addComment } from '../api/comments';

export default function CommentSection({ postId, canInteract, initialCount = 0 }) {
  const [open, setOpen] = useState(false);
  const [comments, setComments] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [text, setText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleToggle = async () => {
    const next = !open;
    setOpen(next);
    if (next && !loaded) {
      setLoading(true);
      try {
        setComments(await listComments(postId));
        setLoaded(true);
      } catch {
        setError('Could not load comments.');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSubmitting(true);
    setError('');
    try {
      const comment = await addComment(postId, text.trim());
      setComments((prev) => [...prev, comment]);
      setText('');
    } catch (err) {
      setError(err.response?.data?.message || 'Could not post comment.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="mt-2">
      <button type="button" className="btn btn-sm btn-link text-decoration-none ps-0" onClick={handleToggle}>
        {open ? 'Hide comments' : `View comments (${loaded ? comments.length : initialCount})`}
      </button>

      {open ? (
        <div className="mt-2 ps-3" style={{ borderLeft: '2px solid var(--color-line-soft)' }}>
          {loading ? (
            <p className="text-soft small mb-2">Loading comments…</p>
          ) : error ? (
            <p className="text-danger small mb-2">{error}</p>
          ) : comments.length === 0 ? (
            <p className="text-soft small mb-2">No comments yet.</p>
          ) : (
            comments.map((c) => (
              <div key={c._id} className="mb-2">
                <span className="fw-semibold small me-1">{c.author?.name || 'Member'}</span>
                <span className="small">{c.content}</span>
              </div>
            ))
          )}

          {canInteract ? (
            <form onSubmit={handleSubmit} className="d-flex gap-2 mt-2">
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Write a comment…"
                value={text}
                onChange={(e) => setText(e.target.value)}
                aria-label="Write a comment"
              />
              <button type="submit" className="btn btn-sm btn-outline-primary" disabled={submitting}>
                {submitting ? '…' : 'Send'}
              </button>
            </form>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
