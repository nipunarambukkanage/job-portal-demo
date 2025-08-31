import { Grid, Paper, Typography } from '@mui/material';
import KPI from '../../components/charts/KPI';
import PieChart from '../../components/charts/PieChart';
export default function AdminDashboardPage(){
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}><KPI label='Open Jobs' value={42}/></Grid>
      <Grid item xs={12} md={4}><KPI label='Applicants' value={876}/></Grid>
      <Grid item xs={12} md={4}><KPI label='Hires' value={23}/></Grid>
      <Grid item xs={12}>
        <Paper sx={{ p:2 }}>
          <Typography variant='h6' gutterBottom>Pipeline</Typography>
          <PieChart labels={['New','Review','Interview','Offer','Rejected']} data={[120,300,90,18,200]} />
        </Paper>
      </Grid>
    </Grid>
  );
}
