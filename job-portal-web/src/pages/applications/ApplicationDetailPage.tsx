import * as React from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import { applicationsService } from "../../api/services/applications";
import Spinner from "../../components/feedback/Spinner";
import { Box, Paper, Stack, Typography, Button } from "@mui/material";

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const [app, setApp] = React.useState<any>();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      if (!id) return;
      try {
        setApp(await applicationsService.detail(id));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <Spinner />;
  if (!app) return null;

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5">Application {app.id}</Typography>
        <Button component={RouterLink} to={`/applications/${app.id}/status`} variant="outlined">
          Update Status
        </Button>
      </Stack>
      <Paper sx={{ p: 2 }}>
        <Typography>
          <strong>Job:</strong> {app.jobId}
        </Typography>
        <Typography sx={{ mt: 1 }}>
          <strong>Status:</strong> {app.status}
        </Typography>
        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
          <Button component={RouterLink} to="/applications" variant="outlined">
            Back
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
