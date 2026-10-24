import { useAuth } from '@workos-inc/authkit-react';
import { UsersManagement, WorkOsWidgets } from '@workos-inc/widgets';
import '@radix-ui/themes/styles.css';
import '@workos-inc/widgets/styles.css';
import '@workos-inc/widgets/users-management.css';

const MANAGE_USERS = 'widgets:users-table:manage';

function UserManagementPage() {
  const { organizationId, permissions, getAccessToken } = useAuth();

  return (
    <section className="page">
      <a className="back-link" href="/widgets">← AuthKit widgets</a>
      <div>
        <h1>User management</h1>
        <p className="muted">See who is in your organization and invite colleagues.</p>
      </div>
      <div className="panel">
        {permissions.includes(MANAGE_USERS) ? (
          <WorkOsWidgets>
            <UsersManagement authToken={getAccessToken} />
          </WorkOsWidgets>
        ) : (
          <p className="muted">
            {organizationId
              ? "You don't have permission to manage users in this organization."
              : 'Your account is not part of an organization yet.'}
          </p>
        )}
      </div>
    </section>
  );
}

export default UserManagementPage;
