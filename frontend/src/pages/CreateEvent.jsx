import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import FormField from '../components/FormField';
import ImagePicker from '../components/ImagePicker';
import { getCommunityBySlug } from '../api/communities';
import { createEvent } from '../api/events';

export default function CreateEvent() {
  const { slug } = useParams();
  const navigate = useNavigate();

  const [community, setCommunity] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [form, setForm] = useState({ title: '', location: '', startDate: '', description: '' });
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [imageError, setImageError] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getCommunityBySlug(slug)
      .then(setCommunity)
      .catch(() => setLoadError('This community could not be found.'));
  }, [slug]);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Give the event a title.';
    if (!form.startDate) errs.startDate = 'Choose a date and time.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError('');
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    try {
      const event = await createEvent(community._id, {
        title: form.title.trim(),
        location: form.location.trim(),
        startDate: new Date(form.startDate).toISOString(),
        description: form.description.trim(),
        coverImageUrl,
      });
      navigate(`/events/${event._id}`);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadError) {
    return (
      <div className="container py-5 text-center">
        <h1 className="font-display">Community not found</h1>
        <p className="text-soft">{loadError}</p>
      </div>
    );
  }

  if (!community) {
    return <div className="container py-5 text-soft">Loading…</div>;
  }

  return (
    <div className="container d-flex justify-content-center py-5">
      <div className="auth-card" style={{ maxWidth: 520 }}>
        <p className="eyebrow mb-2">
          New event in <Link to={`/communities/${slug}`}>{community.name}</Link>
        </p>
        <h1 className="font-display mb-4" style={{ fontSize: '1.9rem' }}>
          Create an event
        </h1>

        {serverError ? <div className="alert alert-danger">{serverError}</div> : null}

        <form onSubmit={handleSubmit} noValidate>
          <FormField label="Event title" id="title" error={errors.title}>
            <input
              id="title"
              name="title"
              type="text"
              className="form-control"
              value={form.title}
              onChange={handleChange}
              placeholder="e.g. Annual Reunion Picnic"
            />
          </FormField>

          <FormField label="Date & time" id="startDate" error={errors.startDate}>
            <input
              id="startDate"
              name="startDate"
              type="datetime-local"
              className="form-control"
              value={form.startDate}
              onChange={handleChange}
            />
          </FormField>

          <FormField label="Location (optional)" id="location">
            <input
              id="location"
              name="location"
              type="text"
              className="form-control"
              value={form.location}
              onChange={handleChange}
              placeholder="e.g. City Park Pavilion"
            />
          </FormField>

          <FormField label="Cover photo (optional)" id="coverImage">
            <ImagePicker
              onUploaded={setCoverImageUrl}
              onError={setImageError}
              label="📷 Add cover photo"
            />
            {imageError ? <div className="text-danger small">{imageError}</div> : null}
          </FormField>

          <FormField label="Description (optional)" id="description">
            <textarea
              id="description"
              name="description"
              className="form-control"
              rows={3}
              value={form.description}
              onChange={handleChange}
            />
          </FormField>

          <button type="submit" className="btn btn-primary w-100 mt-2" disabled={submitting}>
            {submitting ? 'Creating…' : 'Create event'}
          </button>
        </form>
      </div>
    </div>
  );
}