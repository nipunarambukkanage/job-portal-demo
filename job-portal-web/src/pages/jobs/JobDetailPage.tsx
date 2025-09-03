import * as React from "react";
import { useParams, Link as RouterLink } from "react-router-dom";
import { jobsService } from "../../api/services/jobs";
import { applicationsService } from "../../api/services/applications";
import Spinner from "../../components/feedback/Spinner";
import { Box, Paper, Typography, Stack, Button } from "@mui/material";
import { useUser } from "@clerk/clerk-react";
import { useSnackbar } from "notistack";

export default function JobDetailPage() {
  const { id } = useParams();
  const [job, setJob] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(true);
  const { user } = useUser();
  const role = ((user?.organizationMemberships[0]?.role as string) || "org:member") as "org:admin" | "org:member";
  const { enqueueSnackbar } = useSnackbar();

  React.useEffect(() => {
    (async () => {
      if (!id) return;
      try {
        setJob(await jobsService.detail(id));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const onApply = async () => {
    if (!id) return;
    await applicationsService.create({ jobId: id });
    enqueueSnackbar("Applied successfully", { variant: "success" });
  };

  if (loading) return <Spinner />;
  if (!job) return null;

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5">{job.title}</Typography>
        {role === "org:admin" && (
          <Button component={RouterLink} to={`/jobs/${job.id}/edit`} variant="outlined">
            Edit
          </Button>
        )}
      </Stack>
      <Paper sx={{ p: 2 }}>
        <Typography variant="subtitle1" color="text.secondary">
          {job.company} • {job.location}
        </Typography>
        {job.salaryMin != null && job.salaryMax != null && (
          <Typography sx={{ mt: 1 }}>
            Salary: {job.salaryMin} - {job.salaryMax}
          </Typography>
        )}
        <Typography sx={{ mt: 2, whiteSpace: "pre-wrap" }}>{job.description}</Typography>

        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
          {role === "org:member" && (
            <Button variant="contained" onClick={onApply}>
              Apply
            </Button>
          )}
          <Button component={RouterLink} to="/jobs" variant="outlined">
            Back
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
