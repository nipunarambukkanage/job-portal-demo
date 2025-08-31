import { Box, Paper, Typography } from "@mui/material";

export default function EmptyState({ message = "No data to display." }: { message?: string }) {
  return (
    <Paper variant="outlined" sx={{ p: 3 }}>
      <Box sx={{ textAlign: "center" }}>
        <Typography color="text.secondary">{message}</Typography>
      </Box>
    </Paper>
  );
}
