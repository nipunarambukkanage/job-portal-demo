import * as React from 'react';
import { useUser } from '@clerk/clerk-react';
import { applicationsService } from '../../api/services/applications';
import { getUserByEmail } from '../../api/services/python/users'; // ⬅️ use Python user lookup
import DataTable from '../../components/tables/DataTable';
import Spinner from '../../components/feedback/Spinner';
import { Box, Button, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import Pagination from '../../components/tables/Pagination';
import EmptyState from '../../components/tables/EmptyState';

export default function ApplicationsListPage() {
  const { isSignedIn, user } = useUser();

  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState<any[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [pyUserId, setPyUserId] = React.useState<string | null>(null); // ⬅️ NEW
  const pageSize = 20;

  React.useEffect(() => {
    (async () => {
      setLoading(true);
      if (!isSignedIn || !user) {
        setPyUserId(null);
        return;
      }
      const email =
        user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress;
      if (!email) {
        setPyUserId(null);
        return;
      }
      try {
        const pyUser = await getUserByEmail(email);
        setPyUserId(pyUser?.id ?? null);
      } catch {
        setPyUserId(null);
      } finally {
        setLoading(false);
      }
    })();
  }, [isSignedIn, user]);

  React.useEffect(() => {
    (async () => {
      if (!pyUserId) {
        setLoading(true);
        setItems([]);
        setTotal(0);
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const res = await applicationsService.list({ page, pageSize, candidateId: pyUserId });
        setItems(res.items);
        setTotal(res.total);
      } finally {
        setLoading(false);
      }
    })();
  }, [page, pageSize, pyUserId]);

  if (loading) return <Spinner />;

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
