import * as React from "react";
import { Box, Paper, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import KPI from "../../components/charts/KPI";
import AreaChart from "../../components/charts/AreaChart";
import { jobsService } from "../../api/services/jobs";
import { applicationsService } from "../../api/services/applications";
import { getAiAnalytics, type AnalyticsSeries } from "../../api/services/python/analytics";
import Spinner from "../../components/feedback/Spinner";

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

export default function HomePage() {
  const [loading, setLoading] = React.useState(true);
  const [kpis, setKpis] = React.useState<{ jobs: number; apps: number; interviews: number }>({
    jobs: 0,
    apps: 0,
    interviews: 0,
  });
  const [chart, setChart] = React.useState<{ categories: string[]; series: { name: string; data: number[] }[] }>();

  React.useEffect(() => {
    (async () => {
      try {
        const [jobs, appsAll, appsInterview, analytics] = await Promise.all([
          jobsService.list({ page: 1, pageSize: 1 }),
          applicationsService.list({ page: 1, pageSize: 1 }),
          applicationsService.list({ page: 1, pageSize: 1, status: "interview" }),
          getAiAnalytics({}),
        ]);
        setKpis({
          jobs: jobs.total,
          apps: appsAll.total,
          interviews: appsInterview.total,
        });
        setChart(toApex(analytics));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Spinner />;

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome to Job Portal
      </Typography>
      <Grid container spacing={2}>
        <Grid xs={12} md={4}>
          <KPI label="Total Jobs" value={kpis.jobs} />
        </Grid>
        <Grid xs={12} md={4}>
          <KPI label="Applications" value={kpis.apps} />
        </Grid>
        <Grid xs={12} md={4}>
          <KPI label="Interviews" value={kpis.interviews} />
        </Grid>
        {chart && (
          <Grid xs={12}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Activity
              </Typography>
              <AreaChart series={chart.series} categories={chart.categories} />
            </Paper>
          </Grid>
        )}
      </Grid>
    </Box>
  );
}
