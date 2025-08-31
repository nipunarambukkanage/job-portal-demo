import * as React from "react";
import { useSearchParams, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  Container,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import HourglassBottomIcon from "@mui/icons-material/HourglassBottom";

export default function RateLimitedPage() {
  const [sp] = useSearchParams();
  const retryAfter = Math.max(0, Number(sp.get("retryAfter") || 0));
  const [remaining, setRemaining] = React.useState<number>(retryAfter);

  React.useEffect(() => {
    if (!retryAfter) return;
    const id = window.setInterval(() => {
      setRemaining((r) => (r > 0 ? r - 1 : 0));
    }, 1000);
    return () => window.clearInterval(id);
  }, [retryAfter]);

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={2} sx={{ p: 4 }}>
        <Stack spacing={3} alignItems="center" textAlign="center">
          <HourglassBottomIcon fontSize="large" color="primary" />
          <Typography variant="h5" fontWeight={700}>
            You’re being rate limited
          </Typography>
          <Typography color="text.secondary">
            Our API is receiving too many requests right now. Please wait a moment and try again.
          </Typography>

          {retryAfter ? (
            <Box>
              <Typography variant="body2" color="text.secondary">
                You can retry in <strong>{remaining}</strong> second{remaining === 1 ? "" : "s"}…
              </Typography>
            </Box>
          ) : null}

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ width: "100%" }} justifyContent="center">
            <Button
              variant="contained"
              onClick={() => window.location.reload()}
              disabled={remaining > 0}
            >
              Retry now
            </Button>
            <Button component={RouterLink} to="/" variant="outlined">
              Go to Home
            </Button>
          </Stack>

          <Typography variant="caption" color="text.secondary">
            If this keeps happening, please contact support and include your correlation ID if shown in errors.
          </Typography>
        </Stack>
      </Paper>
    </Container>
  );
}
