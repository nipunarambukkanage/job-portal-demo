import { Box, Paper, Typography } from '@mui/material';
import KPI from '../../components/charts/KPI';
import AreaChart from '../../components/charts/AreaChart';

export default function HomePage() {
  return (
    <Box>
      <Box sx={{ mb: 12 }} flexDirection="column">
        <Typography variant="h4" gutterBottom>
          Welcome to Job Portal
        </Typography>
        <Typography variant="h6" gutterBottom>
          by Nipuna Rambukkanage
        </Typography>
      </Box>

      {/* KPIs in a responsive grid */}
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          mb: 2,
        }}
      >
        <KPI label="Total Jobs" value={128} />
        <KPI label="Applications" value={312} />
        <KPI label="Interviews" value={27} />
      </Box>

      {/* Chart */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Weekly Views
        </Typography>
        <AreaChart
          series={[{ name: 'Views', data: [10, 20, 35, 30, 50, 65, 80] }]}
          categories={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']}
        />
      </Paper>
    </Box>
  );
}
