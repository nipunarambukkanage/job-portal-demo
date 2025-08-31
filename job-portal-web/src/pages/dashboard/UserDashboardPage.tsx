import * as React from "react";
import { Paper, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import KPI from "../../components/charts/KPI";
import BarChart from "../../components/charts/BarChart";
import Spinner from "../../components/feedback/Spinner";
import { applicationsService } from "../../api/services/applications";
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

export default function UserDashboardPage() {
  const [loading, setLoading] = React.useState(true);
  const [kpis, setKpis] = React.useState({ applications: 0, interviews: 0, offers: 0 });
  const [chart, setChart] = React.useState<{ categories: string[]; series: { name: string; data: number[] }[] }>();

  React.useEffect(() => {
    (async () => {
      try {
        const [appsAll, appsInterview, appsOffer, analytics] = await Promise.all([
          applicationsService.list({ page: 1, pageSize: 1 }),
          applicationsService.list({ page: 1, pageSize: 1, status: "in_review" }),
          applicationsService.list({ page: 1, pageSize: 1, status: "offer" }),
          getAiAnalytics({ cohort: "user" }),
        ]);
        setKpis({ applications: appsAll.total, interviews: appsInterview.total, offers: appsOffer.total });
        setChart(toApex(analytics));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Spinner />;

  return (
    <Grid container spacing={2}>
      <Grid xs={12} md={4}>
        <KPI label="My Applications" value={kpis.applications} />
      </Grid>
      <Grid xs={12} md={4}>
        <KPI label="Interviews" value={kpis.interviews} />
      </Grid>
      <Grid xs={12} md={4}>
        <KPI label="Offers" value={kpis.offers} />
      </Grid>
      {chart && (
        <Grid xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              My Application Trend
            </Typography>
            <BarChart series={chart.series} categories={chart.categories} />
          </Paper>
        </Grid>
      )}
    </Grid>
  );
}
