import { useState, useEffect, useCallback } from 'react';
import Postmark from '../components/Postmark';
import {
  listPendingCommunities,
  reviewCommunity,
  listUsers,
  updateUser,
  listReports,
  resolveReport,
} from '../api/admin';

const TABS = [
  { key: 'communities', label: 'Pending communities' },
  { key: 'users', label: 'Users' },
  { key: 'reports', label: 'Reports' },
];

export default function AdminDashboard() {
  const [tab, setTab] = useState('communities');

  return (
    <div className="container py-5">
      <p className="eyebrow mb-2">Platform admin</p>
      <h1 className="font-display mb-4" style={{ fontSize: '2rem' }}>
        Dashboard
      </h1>

      <div className="d-flex gap-2 mb-4 flex-wrap">
        {TABS.map((t) => (
          <button
            key={t.key}
            className={tab === t.key ? 'btn btn-primary btn-sm' : 'btn btn-outline-primary btn-sm'}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'communities' ? <PendingCommunitiesTab /> : null}
      {tab === 'users' ? <UsersTab /> : null}
      {tab === 'reports' ? <ReportsTab /> : null}
    </div>
  );
}

function PendingCommunitiesTab() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setItems(await listPendingCommunities());
    } catch {
      setError('Could not load pending communities.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleDecision = async (id, decision) => {
    setBusyId(id);
    try {
      await reviewCommunity(id, decision);
      setItems((prev) => prev.filter((c) => c._id !== id));
    } catch {
      setError('Could not update this community.');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <p className="text-soft">Loading…</p>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (items.length === 0)
    return <div className="card p-4 text-center text-soft">No communities awaiting review.</div>;

  return (
    <>
      {items.map((c) => (
        <div
          key={c._id}
          className="card p-3 mb-3 d-flex flex-row gap-3 align-items-center justify-content-between flex-wrap"
        >
          <div className="d-flex align-items-center gap-3">
            <Postmark line1={c.place?.city} line2={c.place?.state} size={56} imageUrl={c.avatarUrl} />
            <div>
              <div className="fw-semibold">{c.name}</div>
              <div className="text-faint small">
                Created by {c.createdBy?.name} ({c.createdBy?.email})
              </div>
            </div>
          </div>
          <div className="d-flex gap-2">
            <button
              className="btn btn-sm btn-outline-primary"
              onClick={() => handleDecision(c._id, 'rejected')}
              disabled={busyId === c._id}
            >
              Reject
            </button>
            <button
              className="btn btn-sm btn-primary"
              onClick={() => handleDecision(c._id, 'approved')}
              disabled={busyId === c._id}
            >
              Approve
            </button>
          </div>
        </div>
      ))}
    </>
  );
}

function UsersTab() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async (searchTerm) => {
    setLoading(true);
    setError('');
    try {
      const data = await listUsers(searchTerm ? { search: searchTerm } : {});
      setUsers(data.users);
    } catch {
      setError('Could not load users.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load('');
  }, [load]);

  const handleToggleActive = async (u) => {
    setBusyId(u._id);
    try {
      const updated = await updateUser(u._id, { isActive: !u.isActive });
      setUsers((prev) => prev.map((x) => (x._id === u._id ? { ...x, isActive: updated.isActive } : x)));
    } catch {
      setError('Could not update this user.');
    } finally {
      setBusyId(null);
    }
  };

  const handleRoleChange = async (u, role) => {
    setBusyId(u._id);
    try {
      const updated = await updateUser(u._id, { role });
      setUsers((prev) => prev.map((x) => (x._id === u._id ? { ...x, role: updated.role } : x)));
    } catch {
      setError('Could not update this user.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          load(search);
        }}
        className="d-flex gap-2 mb-4"
        style={{ maxWidth: 360 }}
      >
        <input
          className="form-control"
          placeholder="Search name or email…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button className="btn btn-outline-primary" type="submit">
          Search
        </button>
      </form>

      {loading ? (
        <p className="text-soft">Loading…</p>
      ) : error ? (
        <div className="alert alert-danger">{error}</div>
      ) : (
        <div className="table-responsive">
          <table className="table table-warm align-middle mb-0">
            <thead>
              <tr className="text-faint small text-uppercase">
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>{u.name}</td>
                  <td className="text-soft">{u.email}</td>
                  <td>
                    <select
                      className="form-select form-select-sm"
                      style={{ width: 130 }}
                      value={u.role}
                      onChange={(e) => handleRoleChange(u, e.target.value)}
                      disabled={busyId === u._id}
                    >
                      <option value="user">User</option>
                      <option value="moderator">Moderator</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>
                    <span
                      className="badge"
                      style={{
                        background: u.isActive ? 'var(--color-secondary-tint)' : 'var(--color-accent-tint)',
                        color: u.isActive ? 'var(--color-secondary-dark)' : 'var(--color-accent)',
                      }}
                    >
                      {u.isActive ? 'Active' : 'Deactivated'}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-primary"
                      onClick={() => handleToggleActive(u)}
                      disabled={busyId === u._id}
                    >
                      {u.isActive ? 'Deactivate' : 'Reactivate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

function ReportsTab() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setReports(await listReports({ status: 'open' }));
    } catch {
      setError('Could not load reports.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleResolve = async (id, status) => {
    setBusyId(id);
    try {
      await resolveReport(id, { status });
      setReports((prev) => prev.filter((r) => r._id !== id));
    } catch {
      setError('Could not update this report.');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) return <p className="text-soft">Loading…</p>;
  if (error) return <div className="alert alert-danger">{error}</div>;
  if (reports.length === 0) return <div className="card p-4 text-center text-soft">No open reports.</div>;

  return (
    <>
      {reports.map((r) => (
        <div key={r._id} className="card p-3 mb-3">
          <div className="d-flex justify-content-between align-items-start flex-wrap gap-2">
            <div>
              <div className="eyebrow mb-1">
                {r.targetType} · reported by {r.reportedBy?.name}
              </div>
              <p className="mb-0">{r.reason}</p>
            </div>
            <div className="d-flex gap-2">
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={() => handleResolve(r._id, 'dismissed')}
                disabled={busyId === r._id}
              >
                Dismiss
              </button>
              <button
                className="btn btn-sm btn-primary"
                onClick={() => handleResolve(r._id, 'resolved')}
                disabled={busyId === r._id}
              >
                Resolve
              </button>
            </div>
          </div>
        </div>
      ))}
    </>
  );
}
