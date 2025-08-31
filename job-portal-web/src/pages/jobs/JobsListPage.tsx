import * as React from "react";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { fetchJobs } from "../../store/slices/jobsSlice";
import DataTable from "../../components/tables/DataTable";
import Spinner from "../../components/feedback/Spinner";
import { Box, Button, Typography, Stack, TextField } from "@mui/material";
import { Link } from "react-router-dom";
import Pagination from "../../components/tables/Pagination";
import { useUser } from "@clerk/clerk-react";

export default function JobsListPage() {
  const dispatch = useAppDispatch();
  const { items, loading, total } = useAppSelector((s) => s.jobs);
  const [page, setPage] = React.useState(1);
  const pageSize = 20;
  const [q, setQ] = React.useState("");
  const { user } = useUser();
  const role = ((user?.publicMetadata?.role as string) || "user") as "admin" | "user";

  React.useEffect(() => {
    dispatch(fetchJobs({ page, pageSize, q }));
  }, [dispatch, page, q]);

  if (loading) return <Spinner />;

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5">Jobs</Typography>
        <Stack direction="row" spacing={1}>
          <TextField
            size="small"
            placeholder="Search jobs…"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          {role === "admin" && (
            <Button component={Link} to="/jobs/create" variant="contained">
              Post Job
            </Button>
          )}
        </Stack>
      </Stack>

      <DataTable
        rows={items}
        columns={[
          { key: "title", header: "Title" },
          { key: "company", header: "Company" },
          { key: "location", header: "Location" },
          {
            key: "id",
            header: "Open",
            render: (r) => (
              <Button component={Link} to={"/jobs/" + r.id} size="small" variant="outlined">
                Open
              </Button>
            ),
          },
          ...(role === "admin"
            ? [
                {
                  key: "edit",
                  header: "Edit",
                  render: (r: any) => (
                    <Button component={Link} to={"/jobs/" + r.id + "/edit"} size="small">
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
