import * as React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { applicationsService } from "../../api/services/applications";
import Spinner from "../../components/feedback/Spinner";
import { Box, Paper, Stack, Typography, Button, MenuItem, TextField } from "@mui/material";
import { useSnackbar } from "notistack";

const STATUSES = ["new", "in_review", "interview", "offer", "rejected"] as const;

export default function ApplicationStatusPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = React.useState(true);
  const [status, setStatus] = React.useState<typeof STATUSES[number]>("new");

  React.useEffect(() => {
    (async () => {
      if (!id) return;
      try {
        const app = await applicationsService.detail(id);
        setStatus(app.status as any);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const save = async () => {
    if (!id) return;
    await applicationsService.setStatus(id, status);
    enqueueSnackbar("Status updated", { variant: "success" });
    nav(`/applications/${id}`);
  };

  if (loading) return <Spinner />;

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Update Status
      </Typography>
      <Paper sx={{ p: 2 }}>
        <Stack spacing={2} direction={{ xs: "column", sm: "row" }} alignItems="center">
          <TextField select label="Status" value={status} onChange={(e) => setStatus(e.target.value as any)}>
            {STATUSES.map((s) => (
              <MenuItem key={s} value={s}>
                {s}
              </MenuItem>
            ))}
          </TextField>
          <Stack direction="row" spacing={2}>
            <Button variant="contained" onClick={save}>
              Save
            </Button>
            <Button variant="outlined" onClick={() => nav(-1)}>
              Cancel
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
