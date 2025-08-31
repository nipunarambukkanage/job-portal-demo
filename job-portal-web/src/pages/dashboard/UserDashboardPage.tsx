import { Box, Paper, Typography } from '@mui/material';
import KPI from '../../components/charts/KPI';
import BarChart from '../../components/charts/BarChart';

export default function UserDashboardPage() {
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
        <KPI label="My Applications" value={14} />
        <KPI label="Interviews" value={4} />
        <KPI label="Offers" value={1} />
      </Box>

      {/* Chart */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Monthly Applications
        </Typography>
        <BarChart
          series={[{ name: 'Applications', data: [2, 3, 1, 4, 2, 2, 0, 0, 0, 0, 0, 0] }]}
          categories={['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']}
        />
      </Paper>
    </Box>
  );
}
