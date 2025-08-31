import { Grid, Paper, Typography } from '@mui/material';
import KPI from '../../components/charts/KPI';
import BarChart from '../../components/charts/BarChart';
export default function UserDashboardPage(){
  return (
    <Grid container spacing={2}>
      <Grid item xs={12} md={4}><KPI label='My Applications' value={14}/></Grid>
      <Grid item xs={12} md={4}><KPI label='Interviews' value={4}/></Grid>
      <Grid item xs={12} md={4}><KPI label='Offers' value={1}/></Grid>
      <Grid item xs={12}>
        <Paper sx={{ p:2 }}>
          <Typography variant='h6' gutterBottom>Monthly Applications</Typography>
          <BarChart series={[{name:'Applications', data:[2,3,1,4,2,2,0,0,0,0,0,0]}]} categories={['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']}/>
        </Paper>
      </Grid>
    </Grid>
  );
}
