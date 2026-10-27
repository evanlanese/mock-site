import express from 'express';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { WorkOS } from '@workos-inc/node';
import { createRemoteJWKSet, jwtVerify } from 'jose';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5001;

const workos = new WorkOS(process.env.WORKOS_API_KEY);
const jwks = createRemoteJWKSet(new URL(workos.userManagement.getJwksUrl(process.env.WORKOS_CLIENT_ID)));

app.use(express.json());

// Verify the AuthKit access token sent by the client. The org and permissions
// come from this signed token, never from the request body or query.
async function requireAuth(req, res, next) {
  const token = req.get('Authorization')?.match(/^Bearer (.+)$/)?.[1];
  if (!token) return res.status(401).json({ error: 'Not signed in' });
  try {
    const { payload } = await jwtVerify(token, jwks);
    req.auth = payload;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired session' });
  }
}

function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.auth.org_id) return res.status(403).json({ error: 'Your account is not part of an organization' });
    if (!req.auth.permissions?.includes(permission)) {
      return res.status(403).json({ error: `Missing permission: ${permission}` });
    }
    next();
  };
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Mock-Site Flow State API is running' });
});

// The signed-in user's own organizations, for the org switcher
app.get('/api/organizations', requireAuth, async (req, res) => {
  const memberships = await workos.userManagement
    .listOrganizationMemberships({ userId: req.auth.sub, statuses: ['active'] })
    .then((list) => list.autoPagination());

  res.json(memberships.map((m) => ({ id: m.organizationId, name: m.organizationName })));
});

app.get('/api/members', requireAuth, requirePermission('members:view'), async (req, res) => {
  const memberships = await workos.userManagement
    .listOrganizationMemberships({ organizationId: req.auth.org_id, statuses: ['active', 'pending'] })
    .then((list) => list.autoPagination());

  res.json(
    memberships.map((m) => ({
      id: m.id,
      name: [m.user?.firstName, m.user?.lastName].filter(Boolean).join(' '),
      email: m.user?.email ?? m.userId,
      role: m.role.slug,
      status: m.status,
    }))
  );
});

app.post('/api/invitations', requireAuth, requirePermission('members:invite'), async (req, res) => {
  const email = req.body?.email?.trim();
  if (!email) return res.status(400).json({ error: 'Email is required' });

  const invitation = await workos.userManagement.sendInvitation({
    email,
    organizationId: req.auth.org_id,
    inviterUserId: req.auth.sub,
  });
  res.status(201).json({ id: invitation.id, email: invitation.email, state: invitation.state });
});

// In production, serve the built React app
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.join(__dirname, '../client/dist');
  app.use(express.static(clientDist));
  app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Return WorkOS errors (e.g. inviting an existing member) as JSON the client can show
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status ?? 500).json({ error: err.message ?? 'Something went wrong' });
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
