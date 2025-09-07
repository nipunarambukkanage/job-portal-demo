// src/pages/applications/ApplicationsListPage.tsx
import * as React from 'react';
import { useUser } from '@clerk/clerk-react';
import { applicationsService } from '../../api/services/applications';
import { getUserByEmail } from '../../api/services/python/users';
import DataTable from '../../components/tables/DataTable';
import Spinner from '../../components/feedback/Spinner';
import { Box, Button, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import Pagination from '../../components/tables/Pagination';
import EmptyState from '../../components/tables/EmptyState';

export default function ApplicationsListPage() {
  const { isSignedIn, user } = useUser();

  const [userResolving, setUserResolving] = React.useState(true); // ⬅️ NEW: resolving Clerk→Python user
  const [loading, setLoading] = React.useState(true); // data loading
  const [items, setItems] = React.useState<any[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [pyUserId, setPyUserId] = React.useState<string | null>(null);
  const pageSize = 20;

  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      setUserResolving(true);
      try {
        if (!isSignedIn || !user) {
          if (!cancelled) setPyUserId(null);
          return;
        }
        const email =
          user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress;
        if (!email) {
          if (!cancelled) setPyUserId(null);
          return;
        }
        const pyUser = await getUserByEmail(email);
        if (!cancelled) setPyUserId(pyUser?.id ?? null);
      } catch {
        if (!cancelled) setPyUserId(null);
      } finally {
        if (!cancelled) setUserResolving(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isSignedIn, user]);

  React.useEffect(() => {
    let cancelled = false;

    (async () => {
      if (userResolving) return;

      setLoading(true);
      try {
        if (!pyUserId) {
          if (!cancelled) {
            setItems([]);
            setTotal(0);
          }
          return;
        }
        const res = await applicationsService.list({
          page,
          pageSize,
          candidateId: pyUserId,
        });
        if (!cancelled) {
          setItems(res.items ?? []);
          setTotal(res.total ?? 0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [pyUserId, page, pageSize, userResolving]);

  if (userResolving || loading) return <Spinner />;

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        My Applications
      </Typography>

      {items.length === 0 ? (
        <EmptyState message="No applications yet." />
      ) : (
        <>
          <DataTable
            rows={items}
            columns={[
              { key: 'id', header: 'ID' },
              { key: 'jobId', header: 'Job ID' },
              { key: 'status', header: 'Status' },
              {
                key: 'open',
                header: 'Open',
                render: (r) => (
                  <Button
                    component={Link}
                    to={`/applications/${r.id}`}
                    size="small"
                    variant="outlined"
                  >
                    Open
                  </Button>
                ),
              },
              {
                key: 'update',
                header: 'Status',
                render: (r) => (
                  <Button component={Link} to={`/applications/${r.id}/status`} size="small">
                    Update
                  </Button>
                ),
              },
            ]}
          />
          <Pagination page={page} pageSize={pageSize} total={total} onChange={setPage} />
        </>
      )}
    </Box>
  );
}
