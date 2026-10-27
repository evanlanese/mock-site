import { useEffect, useState } from 'react';
import { useAuth } from '@workos-inc/authkit-react';

const INVITE_MEMBERS = 'members:invite';

function MembersPage() {
  const { organizationId, permissions, getAccessToken, switchToOrganization } = useAuth();
  const [organizations, setOrganizations] = useState([]);
  const [switching, setSwitching] = useState(false);
  const [members, setMembers] = useState(null);
  const [error, setError] = useState(null);
  const [email, setEmail] = useState('');
  const [inviteResult, setInviteResult] = useState(null);

  // Calls our own API with the user's access token; the server decides what they can see and do
  async function api(path, options = {}) {
    const token = await getAccessToken();
    const res = await fetch(path, {
      ...options,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error ?? `Request failed (${res.status})`);
    return data;
  }

  useEffect(() => {
    api('/api/organizations').then(setOrganizations).catch(() => setOrganizations([]));
  }, []);

  // Reload members whenever the session switches to another organization
  useEffect(() => {
    setMembers(null);
    setError(null);
    setInviteResult(null);
    api('/api/members').then(setMembers).catch((err) => setError(err.message));
  }, [organizationId]);

  async function switchOrganization(event) {
    setSwitching(true);
    try {
      await switchToOrganization({ organizationId: event.target.value });
    } finally {
      setSwitching(false);
    }
  }

  async function invite(event) {
    event.preventDefault();
    try {
      const invitation = await api('/api/invitations', { method: 'POST', body: JSON.stringify({ email }) });
      setInviteResult({ ok: true, text: `Invitation sent to ${invitation.email}` });
      setEmail('');
    } catch (err) {
      setInviteResult({ ok: false, text: err.message });
    }
  }

  return (
    <section className="page">
      <a className="back-link" href="/">← Home</a>
      <div className="page-header">
        <div>
          <h1>Members</h1>
          <p className="muted">Served by our own API, with permissions checked on the server.</p>
          <div className="chips">
            <span className="chip">Organization: {organizationId ?? 'none'}</span>
          </div>
        </div>
        {organizations.length > 0 && (
          <select
            className="input select"
            aria-label="Switch organization"
            value={organizationId ?? ''}
            onChange={switchOrganization}
            disabled={switching}
          >
            {!organizationId && <option value="">Select an organization</option>}
            {organizations.map((org) => (
              <option key={org.id} value={org.id}>{org.name}</option>
            ))}
          </select>
        )}
      </div>

      {permissions.includes(INVITE_MEMBERS) && (
        <form className="panel invite-form" onSubmit={invite}>
          <input
            className="input"
            type="email"
            required
            placeholder="colleague@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="button" type="submit">Invite</button>
          {inviteResult && <p className={inviteResult.ok ? 'notice' : 'notice error'}>{inviteResult.text}</p>}
        </form>
      )}

      <div className="panel">
        {error ? (
          <p className="notice error">{error}</p>
        ) : !members ? (
          <p className="muted">Loading members...</p>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id}>
                  <td>{member.name || '—'}</td>
                  <td>{member.email}</td>
                  <td>{member.role}</td>
                  <td>{member.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </section>
  );
}

export default MembersPage;
