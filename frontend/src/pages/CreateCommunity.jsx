import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import FormField from '../components/FormField';
import ImagePicker from '../components/ImagePicker';
import { createCommunity } from '../api/communities';

export default function CreateCommunity() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', city: '', state: '', country: '', description: '' });
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [imageError, setImageError] = useState('');
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Give your community a name.';
    if (!form.city.trim()) errs.city = 'Enter the city or village.';
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
      await createCommunity({
        name: form.name.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        country: form.country.trim(),
        description: form.description.trim(),
        coverImageUrl,
        avatarUrl,
      });
      setSuccess(true);
    } catch (err) {
      setServerError(err.response?.data?.message || 'Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="container py-5 d-flex justify-content-center">
        <div className="auth-card text-center">
          <p className="eyebrow mb-2">Submitted</p>
          <h1 className="font-display mb-3" style={{ fontSize: '1.7rem' }}>
            Your community is awaiting approval
          </h1>
          <p className="text-soft">
            We review new communities before they go live to keep Hometown Hub genuine. You'll be able
            to manage it as soon as it's approved.
          </p>
          <button className="btn btn-primary mt-3" onClick={() => navigate('/communities')}>
            Back to communities
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container d-flex justify-content-center py-5">
      <div className="auth-card" style={{ maxWidth: 520 }}>
        <p className="eyebrow mb-2">New community</p>
        <h1 className="font-display mb-4" style={{ fontSize: '1.9rem' }}>
          Start your hometown's community
        </h1>

        {serverError ? <div className="alert alert-danger">{serverError}</div> : null}

        <form onSubmit={handleSubmit} noValidate>
          <FormField label="Community name" id="name" error={errors.name}>
            <input
              id="name"
              name="name"
              type="text"
              className="form-control"
              value={form.name}
              onChange={handleChange}
              placeholder="e.g. Jaipur Reunion"
            />
          </FormField>

          <div className="row">
            <div className="col-sm-5">
              <FormField label="City / village" id="city" error={errors.city}>
                <input
                  id="city"
                  name="city"
                  type="text"
                  className="form-control"
                  value={form.city}
                  onChange={handleChange}
                />
              </FormField>
            </div>
            <div className="col-sm-4">
              <FormField label="State" id="state">
                <input
                  id="state"
                  name="state"
                  type="text"
                  className="form-control"
                  value={form.state}
                  onChange={handleChange}
                />
              </FormField>
            </div>
            <div className="col-sm-3">
              <FormField label="Country" id="country">
                <input
                  id="country"
                  name="country"
                  type="text"
                  className="form-control"
                  value={form.country}
                  onChange={handleChange}
                />
              </FormField>
            </div>
          </div>

          <FormField label="Community logo / photo (optional)" id="avatarImage">
            <ImagePicker
              onUploaded={setAvatarUrl}
              onError={setImageError}
              label="🖼️ Add logo photo"
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
              placeholder="What is this community for?"
            />
          </FormField>

          <button type="submit" className="btn btn-primary w-100 mt-2" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit for approval'}
          </button>
        </form>
      </div>
    </div>
  );
}