import * as React from "react";
import { Box, Paper, Typography } from "@mui/material";
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
    <Box sx={{ display: "grid", gap: 2 }}>
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" },
          gap: 2,
        }}
      >
        <KPI label="Open Jobs" value={kpis.openJobs} />
        <KPI label="Applicants" value={kpis.applicants} />
        <KPI label="Hires (Offers)" value={kpis.hires} />
      </Box>

      {pipeline && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Pipeline
          </Typography>
          <PieChart labels={pipeline.labels} data={pipeline.data} />
        </Paper>
      )}
    </Box>
  );
}
