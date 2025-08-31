import { Box, Grid, Paper, Typography } from '@mui/material';
import KPI from '../../components/charts/KPI';
import AreaChart from '../../components/charts/AreaChart';

export default function HomePage(){
  return (
    <Box>
      <Typography variant='h4' gutterBottom>Welcome to Job Portal</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} md={4}><KPI label='Total Jobs' value={128} /></Grid>
        <Grid item xs={12} md={4}><KPI label='Applications' value={312} /></Grid>
        <Grid item xs={12} md={4}><KPI label='Interviews' value={27} /></Grid>
        <Grid item xs={12}>
          <Paper sx={{ p:2 }}>
            <Typography variant='h6' gutterBottom>Weekly Views</Typography>
            <AreaChart series={[{ name:'Views', data:[10,20,35,30,50,65,80] }]} categories={['Mon','Tue','Wed','Thu','Fri','Sat','Sun']} />
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
