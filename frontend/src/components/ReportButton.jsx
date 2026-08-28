import { useState } from 'react';
import { createReport } from '../api/reports';

export default function ReportButton({ targetType, targetId }) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [status, setStatus] = useState('idle'); // idle | submitting | done | error

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!reason.trim()) return;
    setStatus('submitting');
    try {
      await createReport({ targetType, targetId, reason: reason.trim() });
      setStatus('done');
    } catch {
      setStatus('error');
    }
  };

  if (status === 'done') {
    return <span className="text-faint small">Reported. Thank you.</span>;
  }

  return (
    <div>
      <button
        type="button"
        className="btn btn-sm btn-link text-decoration-none p-0 text-faint"
        onClick={() => setOpen((v) => !v)}
      >
        Report
      </button>
      {open ? (
        <form onSubmit={handleSubmit} className="d-flex gap-2 mt-2">
          <input
            type="text"
            className="form-control form-control-sm"
            placeholder="Why are you reporting this?"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            aria-label="Reason for report"
          />
          <button type="submit" className="btn btn-sm btn-outline-primary" disabled={status === 'submitting'}>
            {status === 'submitting' ? '…' : 'Send'}
          </button>
        </form>
      ) : null}
      {status === 'error' ? <div className="text-danger small mt-1">Could not submit report.</div> : null}
    </div>
  );
}
