import * as React from "react";
import { applicationsService } from "../../api/services/applications";
import DataTable from "../../components/tables/DataTable";
import Spinner from "../../components/feedback/Spinner";
import { Box, Button, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import Pagination from "../../components/tables/Pagination";
import EmptyState from "../../components/tables/EmptyState";

export default function ApplicationsListPage() {
  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState<any[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const pageSize = 20;

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await applicationsService.list({ page, pageSize });
        setItems(res.items);
        setTotal(res.total);
      } finally {
        setLoading(false);
      }
    })();
  }, [page]);

  if (loading) return <Spinner />;

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Applications
      </Typography>

      {items.length === 0 ? (
        <EmptyState message="No applications yet." />
      ) : (
        <>
          <DataTable
            rows={items}
            columns={[
              { key: "id", header: "ID" },
              { key: "jobId", header: "Job ID" },
              { key: "status", header: "Status" },
              {
                key: "open",
                header: "Open",
                render: (r) => (
                  <Button component={Link} to={`/applications/${r.id}`} size="small" variant="outlined">
                    Open
                  </Button>
                ),
              },
              {
                key: "update",
                header: "Status",
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
