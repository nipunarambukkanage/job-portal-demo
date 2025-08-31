import * as React from "react";
import { Box, Paper, Stack, Typography, Button } from "@mui/material";
import { getRecommendations, sendRecommendationFeedback, type RecommendationItem } from "../../api/services/python/recommendations";
import { useUser } from "@clerk/clerk-react";
import { Link as RouterLink } from "react-router-dom";

export default function RecommendationsPage() {
  const { user } = useUser();
  const [items, setItems] = React.useState<RecommendationItem[]>([]);
  const [loading, setLoading] = React.useState(true);

  const userId = user?.id;

  React.useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await getRecommendations({ userId: userId || undefined, limit: 20 });
        setItems(res);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  const feedback = async (id: string | number, action: "like" | "dislike" | "dismiss") => {
    await sendRecommendationFeedback({ recommendationId: id, action });
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        AI Recommendations
      </Typography>

      <Stack spacing={2}>
        {loading && <Typography>Loading…</Typography>}
        {!loading && items.length === 0 && <Typography color="text.secondary">No recommendations right now.</Typography>}
        {items.map((r) => (
          <Paper key={String(r.id)} sx={{ p: 2 }}>
            <Stack direction={{ xs: "column", sm: "row" }} alignItems="center" justifyContent="space-between" spacing={2}>
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  {(r as any).title || "Recommended Job"}
                </Typography>
                <Typography color="text.secondary">
                  Score: {Math.round(((r.score ?? 0) as number) * 100) / 100}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                {"jobId" in r && (
                  <Button component={RouterLink} to={`/jobs/${(r as any).jobId}`} variant="outlined" size="small">
                    View
                  </Button>
                )}
                <Button onClick={() => feedback(r.id, "like")} size="small" variant="contained">
                  👍 Like
                </Button>
                <Button onClick={() => feedback(r.id, "dislike")} size="small">
                  👎 Dislike
                </Button>
                <Button onClick={() => feedback(r.id, "dismiss")} size="small">
                  Dismiss
                </Button>
              </Stack>
            </Stack>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}
