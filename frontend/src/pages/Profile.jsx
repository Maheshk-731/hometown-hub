import { useState } from 'react';
import FormField from '../components/FormField';
import ImagePicker from '../components/ImagePicker';
import { updateProfile } from '../api/profile';
import { useAuth } from '../context/AuthContext';

function Avatar({ user, size = 56 }) {
  if (user.avatarUrl) {
    return (
      <img
        src={user.avatarUrl}
        alt=""
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover' }}
      />
    );
  }
  return (
    <div
      aria-hidden="true"
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        background: 'var(--color-secondary-tint)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: size * 0.4,
        color: 'var(--color-secondary-dark)',
      }}
    >
      {user.name?.[0]?.toUpperCase()}
    </div>
  );
}

export default function Profile() {
  const { user, setUser } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    hometownCity: user?.hometown?.city || '',
    currentCity: user?.currentLocation?.city || '',
  });
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || '');
  const [imageError, setImageError] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!user) return null;

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) {
      setError('Name cannot be empty.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const updated = await updateProfile({
        name: form.name.trim(),
        bio: form.bio.trim(),
        hometown: { ...user.hometown, city: form.hometownCity.trim() },
        currentLocation: { ...user.currentLocation, city: form.currentCity.trim() },
        avatarUrl,
      });
      setUser((u) => ({ ...u, ...updated }));
      setEditing(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Could not update your profile.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-5" style={{ maxWidth: 560 }}>
      <p className="eyebrow mb-2">Your account</p>
      <h1 className="font-display mb-4" style={{ fontSize: '2rem' }}>
        Profile
      </h1>

      <div className="card p-4">
        {!editing ? (
          <>
            <div className="d-flex align-items-center gap-3 mb-4">
              <Avatar user={user} />
              <div>
                <div className="fw-semibold fs-5">{user.name}</div>
                <div className="text-faint small">{user.email}</div>
              </div>
            </div>

            <div className="mb-3">
              <span className="eyebrow d-block mb-1">Hometown</span>
              <span className="text-soft">{user.hometown?.city || 'Not set'}</span>
            </div>
            <div className="mb-3">
              <span className="eyebrow d-block mb-1">Current location</span>
              <span className="text-soft">{user.currentLocation?.city || 'Not set'}</span>
            </div>
            <div className="mb-4">
              <span className="eyebrow d-block mb-1">Bio</span>
              <span className="text-soft">{user.bio || 'No bio yet.'}</span>
            </div>

            <button className="btn btn-outline-primary" onClick={() => setEditing(true)}>
              Edit profile
            </button>
          </>
        ) : (
          <form onSubmit={handleSubmit} noValidate>
            {error ? <div className="alert alert-danger">{error}</div> : null}

            <FormField label="Profile photo" id="avatarImage">
              <div className="d-flex align-items-center gap-3">
                <Avatar user={{ ...user, avatarUrl }} size={56} />
                <ImagePicker
                  onUploaded={setAvatarUrl}
                  onError={setImageError}
                  label={avatarUrl ? 'Change photo' : '📷 Add photo'}
                />
              </div>
              {imageError ? <div className="text-danger small">{imageError}</div> : null}
            </FormField>

            <FormField label="Full name" id="name">
              <input
                id="name"
                name="name"
                type="text"
                className="form-control"
                value={form.name}
                onChange={handleChange}
              />
            </FormField>

            <FormField label="Hometown city" id="hometownCity">
              <input
                id="hometownCity"
                name="hometownCity"
                type="text"
                className="form-control"
                value={form.hometownCity}
                onChange={handleChange}
              />
            </FormField>

            <FormField label="Current city" id="currentCity">
              <input
                id="currentCity"
                name="currentCity"
                type="text"
                className="form-control"
                value={form.currentCity}
                onChange={handleChange}
              />
            </FormField>

            <FormField label="Bio" id="bio">
              <textarea
                id="bio"
                name="bio"
                className="form-control"
                rows={3}
                value={form.bio}
                onChange={handleChange}
              />
            </FormField>

            <div className="d-flex gap-2">
              <button type="submit" className="btn btn-primary" disabled={submitting}>
                {submitting ? 'Saving…' : 'Save changes'}
              </button>
              <button
                type="button"
                className="btn btn-outline-primary"
                onClick={() => setEditing(false)}
                disabled={submitting}
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}