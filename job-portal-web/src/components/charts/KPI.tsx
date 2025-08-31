import { Paper, Box, Typography } from '@mui/material';
export default function KPI({ label, value }: { label: string; value: string | number }){
  return <Paper sx={{ p:2 }}>
    <Typography variant='overline' color='text.secondary'>{label}</Typography>
    <Box sx={{ mt:1 }}><Typography variant='h4'>{value}</Typography></Box>
  </Paper>;
}
