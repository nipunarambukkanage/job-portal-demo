import * as React from "react";
import { Paper, Typography } from "@mui/material";
import Grid from "@mui/material/Grid2";
import KPI from "../../components/charts/KPI";
import PieChart from "../../components/charts/PieChart";
import Spinner from "../../components/feedback/Spinner";
import { jobsService } from "../../api/services/jobs";
import { applicationsService } from "../../api/services/applications";

export default function AdminDashboardPage() {
  const [loading, setLoading] = React.useState(true);
  const [kpis, setKpis] = React.useState({ openJobs: 0, applicants: 0, hires: 0 });
  const [pipeline, setPipeline] = React.useState<{ labels: string[]; data: number[] }>();

  React.useEffect(() => {
    (async () => {
      try {
        const [jobs, apps, appsOffer, appsAllForPie] = await Promise.all([
          jobsService.list({ page: 1, pageSize: 1 }),
          applicationsService.list({ page: 1, pageSize: 1 }),
          applicationsService.list({ page: 1, pageSize: 1, status: "offer" }),
          applicationsService.list({ page: 1, pageSize: 100 }),
        ]);

        setKpis({
          openJobs: jobs.total,
          applicants: apps.total,
          hires: appsOffer.total,
        });

        const counts: Record<string, number> = {};
        for (const a of appsAllForPie.items) {
          counts[a.status] = (counts[a.status] ?? 0) + 1;
        }
        const labels = Object.keys(counts);
        const data = labels.map((l) => counts[l]);
        setPipeline({ labels, data });
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Spinner />;

  return (
    <Grid container spacing={2}>
      <Grid xs={12} md={4}>
        <KPI label="Open Jobs" value={kpis.openJobs} />
      </Grid>
      <Grid xs={12} md={4}>
        <KPI label="Applicants" value={kpis.applicants} />
      </Grid>
      <Grid xs={12} md={4}>
        <KPI label="Hires (Offers)" value={kpis.hires} />
      </Grid>
      {pipeline && (
        <Grid xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Pipeline
            </Typography>
            <PieChart labels={pipeline.labels} data={pipeline.data} />
          </Paper>
        </Grid>
      )}
    </Grid>
  );
}
