import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import FormField from '../components/FormField';
import ImagePicker from '../components/ImagePicker';
import Postmark from '../components/Postmark';
import { getCommunityBySlug, updateCommunity, getMembershipStatus, deleteCommunity } from '../api/communities';

export default function EditCommunity() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [community, setCommunity] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [form, setForm] = useState({ name: '', description: '' });
  const [avatarUrl, setAvatarUrl] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [imageError, setImageError] = useState('');
  const [nameError, setNameError] = useState('');
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  const [myRole, setMyRole] = useState(null);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [deleteError, setDeleteError] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [showDangerZone, setShowDangerZone] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    try {
      const data = await getCommunityBySlug(slug);
      setCommunity(data);
      setForm({ name: data.name || '', description: data.description || '' });
      setAvatarUrl(data.avatarUrl || '');
      setCoverImageUrl(data.coverImageUrl || '');

      try {
        const membership = await getMembershipStatus(data._id);
        setMyRole(membership.role || null);
      } catch {
        setMyRole(null);
      }
    } catch {
      setLoadError('This community could not be found.');
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    load();
  }, [load]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    setSaved(false);

    if (!form.name.trim()) {
      setNameError('Give your community a name.');
      return;
    }
    setNameError('');

    setSubmitting(true);
    try {
      const updated = await updateCommunity(community._id, {
        name: form.name.trim(),
        description: form.description.trim(),
        avatarUrl,
        coverImageUrl,
      });
      setCommunity(updated);
      setSaved(true);
    } catch (err) {
      // Backend returns 403 if the current user isn't a moderator/admin of this community.
      setServerError(err.response?.data?.message || 'Could not save changes. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    setDeleteError('');
    if (deleteConfirmText !== community.name) {
      setDeleteError('Type the community name exactly to confirm.');
      return;
    }
    setDeleting(true);
    try {
      await deleteCommunity(community._id, deleteConfirmText);
      navigate('/communities');
    } catch (err) {
      setDeleteError(err.response?.data?.message || 'Could not delete community. Try again.');
      setDeleting(false);
    }
  };

  if (loading) {
    return <div className="container py-5 text-soft">Loading…</div>;
  }

  if (loadError || !community) {
    return (
      <div className="container py-5 text-center">
        <h1 className="font-display">Could not load this community</h1>
        <p className="text-soft">{loadError}</p>
      </div>
    );
  }

  return (
    <div className="container d-flex justify-content-center py-5">
      <div className="auth-card" style={{ maxWidth: 520 }}>
        <p className="eyebrow mb-2">
          Editing <Link to={`/communities/${slug}`}>{community.name}</Link>
        </p>
        <h1 className="font-display mb-4" style={{ fontSize: '1.9rem' }}>
          Community details
        </h1>

        {serverError ? <div className="alert alert-danger">{serverError}</div> : null}
        {saved ? <div className="alert alert-success">Changes saved.</div> : null}

        <form onSubmit={handleSubmit} noValidate>
          <FormField label="Community name" id="name" error={nameError}>
            <input
              id="name"
              name="name"
              type="text"
              className="form-control"
              value={form.name}
              onChange={handleChange}
            />
          </FormField>

          <FormField label="Community logo / photo" id="avatarImage">
            <div className="d-flex align-items-center gap-3 mb-2">
              <Postmark line1={community.place?.city} size={64} imageUrl={avatarUrl} />
            </div>
            <ImagePicker onUploaded={setAvatarUrl} onError={setImageError} label="🖼️ Change logo photo" />
          </FormField>

          <FormField label="Cover photo" id="coverImage">
            {coverImageUrl ? (
              <img
                src={coverImageUrl}
                alt=""
                className="mb-2"
                style={{
                  width: '100%',
                  maxHeight: 160,
                  objectFit: 'cover',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--color-line)',
                }}
              />
            ) : null}
            <ImagePicker onUploaded={setCoverImageUrl} onError={setImageError} label="📷 Change cover photo" />
            {imageError ? <div className="text-danger small">{imageError}</div> : null}
          </FormField>

          <FormField label="Description" id="description">
            <textarea
              id="description"
              name="description"
              className="form-control"
              rows={3}
              value={form.description}
              onChange={handleChange}
              placeholder="What is this community for?"
            />
          </FormField>

          <div className="d-flex gap-2 mt-2">
            <button type="submit" className="btn btn-primary flex-grow-1" disabled={submitting}>
              {submitting ? 'Saving…' : 'Save changes'}
            </button>
            <button
              type="button"
              className="btn btn-outline-primary"
              onClick={() => navigate(`/communities/${slug}`)}
            >
              Cancel
            </button>
          </div>
        </form>

        {myRole === 'admin' ? (
          <div className="mt-5 pt-4" style={{ borderTop: '1px solid var(--color-line)' }}>
            {!showDangerZone ? (
              <button
                type="button"
                className="btn btn-sm btn-outline-danger"
                onClick={() => setShowDangerZone(true)}
              >
                Delete this community
              </button>
            ) : (
              <div className="border border-danger rounded p-3">
                <p className="fw-bold text-danger mb-2">This cannot be undone</p>
                <p className="text-soft small mb-3">
                  Deleting <strong>{community.name}</strong> permanently removes all its posts, comments,
                  events, chat messages, and member records. Type the community name below to confirm.
                </p>
                {deleteError ? <div className="alert alert-danger py-2 small">{deleteError}</div> : null}
                <input
                  type="text"
                  className="form-control mb-2"
                  placeholder={community.name}
                  value={deleteConfirmText}
                  onChange={(e) => setDeleteConfirmText(e.target.value)}
                />
                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-danger btn-sm"
                    disabled={deleting}
                    onClick={handleDelete}
                  >
                    {deleting ? 'Deleting…' : 'Delete forever'}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary btn-sm"
                    onClick={() => {
                      setShowDangerZone(false);
                      setDeleteConfirmText('');
                      setDeleteError('');
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}