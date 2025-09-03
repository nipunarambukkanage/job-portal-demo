import * as React from "react";
import { Box, Button, Typography } from "@mui/material";
import DataTable from "../../components/tables/DataTable";
import Spinner from "../../components/feedback/Spinner";
import Pagination from "../../components/tables/Pagination";
import { orgsService } from "../../api/services/orgs";
import { Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";

export default function OrgsListPage() {
  const [loading, setLoading] = React.useState(true);
  const [items, setItems] = React.useState<any[]>([]);
  const [total, setTotal] = React.useState(0);
  const [page, setPage] = React.useState(1);
  const pageSize = 20;
  const { user } = useUser();
  const role = ((user?.organizationMemberships[0]?.role as string) || "org:member") as "org:admin" | "org:member";

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await orgsService.list({ page, pageSize });
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
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5">Organizations</Typography>
        {role === "org:admin" && (
          <Button component={Link} to="/orgs/create" variant="contained">
            New Organization
          </Button>
        )}
      </Box>

      <DataTable
        rows={items}
        columns={[
          { key: "name", header: "Name" },
          { key: "website", header: "Website" },
          {
            key: "open",
            header: "Open",
            render: (r) => (
              <Button component={Link} to={`/orgs/${r.id}`} size="small" variant="outlined">
                Open
              </Button>
            ),
          },
          ...(role === "org:admin"
            ? [
                {
                  key: "edit",
                  header: "Edit",
                  render: (r: any) => (
                    <Button component={Link} to={`/orgs/${r.id}/edit`} size="small">
                      Edit
                    </Button>
                  ),
                },
              ]
            : []),
        ]}
      />

      <Pagination page={page} pageSize={pageSize} total={total} onChange={setPage} />
    </Box>
  );
}
