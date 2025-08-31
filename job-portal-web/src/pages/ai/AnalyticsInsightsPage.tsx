import * as React from "react";
import { Box, Paper, Stack, TextField, Typography } from "@mui/material";
import AreaChart from "../../components/charts/AreaChart";
import { getAiAnalytics, type AnalyticsSeries } from "../../api/services/python/analytics";

function toApex(series: AnalyticsSeries[]) {
  const categoriesSet = new Set<string>();
  series.forEach((s) => s.data.forEach((p) => categoriesSet.add(String(p.x))));
  const categories = Array.from(categoriesSet);
  const apexSeries = series.map((s) => ({
    name: s.name,
    data: categories.map((c) => s.data.find((p) => String(p.x) === c)?.y ?? 0),
  }));
  return { categories, series: apexSeries };
}

export default function AnalyticsInsightsPage() {
  const [from, setFrom] = React.useState<string>("");
  const [to, setTo] = React.useState<string>("");
  const [chart, setChart] = React.useState<{ categories: string[]; series: { name: string; data: number[] }[] }>();

  const load = React.useCallback(async () => {
    const res = await getAiAnalytics({ from: from || undefined, to: to || undefined });
    setChart(toApex(res));
  }, [from, to]);

  React.useEffect(() => {
    load();
  }, [load]);

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Analytics
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            type="date"
            label="From"
            InputLabelProps={{ shrink: true }}
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
          <TextField
            type="date"
            label="To"
            InputLabelProps={{ shrink: true }}
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </Stack>
      </Paper>

      {chart && (
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 2 }}>
          <Paper sx={{ p: 2 }}>
            <AreaChart series={chart.series} categories={chart.categories} />
          </Paper>
        </Box>
      )}
    </Box>
  );
}
