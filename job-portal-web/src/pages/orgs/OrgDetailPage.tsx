import * as React from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import Spinner from "../../components/feedback/Spinner";
import { orgsService } from "../../api/services/orgs";
import { Box, Paper, Stack, Typography, Button } from "@mui/material";
import { useUser } from "@clerk/clerk-react";

export default function OrgDetailPage() {
  const { id } = useParams();
  const [org, setOrg] = React.useState<any>();
  const [loading, setLoading] = React.useState(true);
  const { user } = useUser();
  const role = ((user?.organizationMemberships[0]?.role as string) || "org:member") as "org:admin" | "org:member";

  React.useEffect(() => {
    (async () => {
      if (!id) return;
      try {
        setOrg(await orgsService.detail(id));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <Spinner />;
  if (!org) return null;

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5">{org.name}</Typography>
        {role === "org:admin" && (
          <Button component={RouterLink} to={`/orgs/${org.id}/edit`} variant="outlined">
            Edit
          </Button>
        )}
      </Stack>
      <Paper sx={{ p: 2 }}>
        <Typography>
          <strong>Website:</strong> {org.website || "—"}
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
          <Button component={RouterLink} to="/orgs" variant="outlined">
            Back
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
