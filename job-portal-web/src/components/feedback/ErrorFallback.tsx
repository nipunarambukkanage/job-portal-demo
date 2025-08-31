import { Box, Button, Typography } from '@mui/material';
export default function ErrorFallback(){
  return <Box sx={{ p:4, textAlign:'center' }}>
    <Typography variant='h5' gutterBottom>Something went wrong</Typography>
    <Button variant='contained' onClick={()=>location.reload()}>Reload</Button>
  </Box>;
}
