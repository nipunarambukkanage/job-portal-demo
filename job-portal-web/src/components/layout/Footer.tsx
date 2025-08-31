import { Box, Typography } from '@mui/material';
export default function Footer(){
  return <Box sx={{ p:2, textAlign:'center', color:'text.secondary' }}>
    <Typography variant='body2'>© {new Date().getFullYear()} Job Portal</Typography>
  </Box>;
}
