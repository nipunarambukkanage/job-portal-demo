import React from 'react';
import { Stack, Skeleton, Box } from '@mui/material';

interface LoadingGridProps {
  count?: number;
  height?: number;
}

const LoadingGrid: React.FC<LoadingGridProps> = ({ count = 6, height = 200 }) => {
  return (
    <Stack spacing={2}>
      {Array.from({ length: count }).map((_, index) => (
        <Box key={index}>
          <Skeleton variant="rectangular" height={height} sx={{ borderRadius: 1 }} />
          <Skeleton sx={{ mt: 1 }} />
          <Skeleton width="60%" />
        </Box>
      ))}
    </Stack>
  );
};

export default LoadingGrid;
