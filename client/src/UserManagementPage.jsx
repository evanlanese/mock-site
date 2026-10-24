import { useAuth } from '@workos-inc/authkit-react';
import { UsersManagement, WorkOsWidgets } from '@workos-inc/widgets';
import '@radix-ui/themes/styles.css';
import '@workos-inc/widgets/styles.css';
import '@workos-inc/widgets/users-management.css';

const MANAGE_USERS = 'widgets:users-table:manage';

function UserManagementPage() {
  const { organizationId, permissions, getAccessToken } = useAuth();

  return (
    <section className="page widget-page">
      <a href="/widgets">Back to widgets</a>
      {permissions.includes(MANAGE_USERS) ? (
        <WorkOsWidgets>
          <UsersManagement authToken={getAccessToken} />
        </WorkOsWidgets>
      ) : (
        <p>
          {organizationId
            ? "You don't have permission to manage users in this organization."
            : 'Your account is not part of an organization yet.'}
        </p>
      )}
    </section>
  );
}

export default UserManagementPage;
