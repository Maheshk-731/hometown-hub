import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import FormField from '../components/FormField';
import { useAuth } from '../context/AuthContext';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    hometownCity: '',
  });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Enter your full name.';
    if (!form.email.trim()) errs.email = 'Enter your email address.';
    if (!form.password) {
      errs.password = 'Choose a password.';
    } else if (form.password.length < 6) {
      errs.password = 'Password must be at least 6 characters.';
    }
    if (form.confirmPassword !== form.password) {
      errs.confirmPassword = 'Passwords do not match.';
    }
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
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
        hometown: form.hometownCity.trim() ? { city: form.hometownCity.trim() } : undefined,
      });
      navigate('/communities', { replace: true });
    } catch (err) {
      setServerError(err.response?.data?.message || 'Something went wrong. Try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container d-flex justify-content-center py-5">
      <div className="auth-card">
        <p className="eyebrow mb-2">Get started</p>
        <h1 className="font-display mb-4" style={{ fontSize: '1.9rem' }}>
          Create your account
        </h1>

        {serverError ? (
          <div className="alert alert-danger" role="alert">
            {serverError}
          </div>
        ) : null}

        <form onSubmit={handleSubmit} noValidate>
          <FormField label="Full name" id="name" error={errors.name}>
            <input
              id="name"
              name="name"
              type="text"
              className="form-control"
              value={form.name}
              onChange={handleChange}
              autoComplete="name"
            />
          </FormField>

          <FormField label="Email address" id="email" error={errors.email}>
            <input
              id="email"
              name="email"
              type="email"
              className="form-control"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
            />
          </FormField>

          <FormField label="Hometown city or village (optional)" id="hometownCity">
            <input
              id="hometownCity"
              name="hometownCity"
              type="text"
              className="form-control"
              value={form.hometownCity}
              onChange={handleChange}
              placeholder="e.g. Jaipur"
            />
          </FormField>

          <FormField label="Password" id="password" error={errors.password}>
            <input
              id="password"
              name="password"
              type="password"
              className="form-control"
              value={form.password}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </FormField>

          <FormField label="Confirm password" id="confirmPassword" error={errors.confirmPassword}>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              className="form-control"
              value={form.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
            />
          </FormField>

          <button type="submit" className="btn btn-primary w-100 mt-2" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create account'}
          </button>
        </form>

        <p className="text-soft text-center mt-4 mb-0">
          Already have an account?{' '}
          <Link to="/login" className="fw-semibold" style={{ color: 'var(--color-primary-dark)' }}>
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
