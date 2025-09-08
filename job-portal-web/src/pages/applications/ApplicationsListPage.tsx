import * as React from 'react';
import { useUser } from '@clerk/clerk-react';
import { applicationsService } from '../../api/services/applications';
import { getUserByEmail } from '../../api/services/python/users';
import DataTable from '../../components/tables/DataTable';
import Spinner from '../../components/feedback/Spinner';
import { Box, Button, Typography, Chip } from '@mui/material';
import type { ChipProps } from '@mui/material/Chip';
import { Link } from 'react-router-dom';
import Pagination from '../../components/tables/Pagination';
import EmptyState from '../../components/tables/EmptyState';

import { ApplicationStatus, statusColor, statusText } from '../../api/types/application';
import { Edit } from '@mui/icons-material';

export default function ApplicationsListPage() {
  const { isSignedIn, user } = useUser();

  const [userResolving, setUserResolving] = React.useState(true);
  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState<any[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const [pyUserId, setPyUserId] = React.useState<string | null>(null);
  const pageSize = 20;


  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setUserResolving(true);
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
      try {
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
      if (!pyUserId) {
        if (!cancelled) {
          setItems([]);
          setTotal(0);
        }
        return;
      }
      try {
        const res = await applicationsService.list({ page, pageSize, candidateId: pyUserId });
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
              //{ key: 'id', header: 'ID' },
              { key: 'jobTitle', header: 'Job', render: (r) => r.job?.title ?? '-' },
              { key: 'jobCompany', header: 'Company', render: (r) => r.job?.company ?? '-' },
              { key: 'jobLocation', header: 'Location', render: (r) => r.job?.location ?? '-' },
              {
                key: 'status',
                header: 'Status',
                render: (r) => (
                  <Chip
                    size="small"
                    label={statusText(r.status)}
                    color={statusColor(r.status)}
                    variant="outlined"
                  />
                ),
              },
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
                header: 'Actions',
                render: (r) => (
                  <Button
                    disabled={user?.organizationMemberships?.[0]?.role !== 'org:admin'}
                    component={Link}
                    to={`/applications/${r.id}/status`}
                    size="small"
                  >
                    <Edit fontSize='small' /> Update
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
