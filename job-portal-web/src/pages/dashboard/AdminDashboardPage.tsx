import { Box, Paper, Typography } from '@mui/material';
import KPI from '../../components/charts/KPI';
import PieChart from '../../components/charts/PieChart';

export default function AdminDashboardPage() {
  return (
    <Box>
      {/* KPIs in a responsive grid */}
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          mb: 2,
        }}
      >
        <KPI label="Open Jobs" value={42} />
        <KPI label="Applicants" value={876} />
        <KPI label="Hires" value={23} />
      </Box>

      {/* Chart */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Pipeline
        </Typography>
        <PieChart
          labels={['New', 'Review', 'Interview', 'Offer', 'Rejected']}
          data={[120, 300, 90, 18, 200]}
        />
      </Paper>
    </Box>
  );
}
