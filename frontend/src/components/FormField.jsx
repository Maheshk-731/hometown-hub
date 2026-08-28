export default function FormField({ label, id, error, children }) {
  return (
    <div className="mb-3">
      <label htmlFor={id} className="form-label fw-semibold" style={{ fontSize: '0.92rem' }}>
        {label}
      </label>
      {children}
      {error ? (
        <div className="text-danger small mt-1" role="alert">
          {error}
        </div>
      ) : null}
    </div>
  );
}
