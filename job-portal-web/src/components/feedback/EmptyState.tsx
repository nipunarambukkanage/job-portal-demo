import React from 'react';
import { Box, Typography, Paper } from '@mui/material';
import WorkOffIcon from '@mui/icons-material/WorkOff';
import SearchOffIcon from '@mui/icons-material/SearchOff';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

interface EmptyStateProps {
  message: string;
  icon?: 'work' | 'search' | 'error';
  action?: React.ReactNode;
}

const EmptyState: React.FC<EmptyStateProps> = ({ 
  message, 
  icon = 'search',
  action 
}) => {
  const getIcon = () => {
    switch (icon) {
      case 'work':
        return <WorkOffIcon sx={{ fontSize: 64, color: 'text.secondary' }} />;
      case 'search':
        return <SearchOffIcon sx={{ fontSize: 64, color: 'text.secondary' }} />;
      case 'error':
        return <ErrorOutlineIcon sx={{ fontSize: 64, color: 'text.secondary' }} />;
      default:
        return <SearchOffIcon sx={{ fontSize: 64, color: 'text.secondary' }} />;
    }
  };

  return (
    <Paper 
      elevation={0}
      sx={{ 
        p: 6, 
        textAlign: 'center',
        bgcolor: 'background.default',
        border: '1px dashed',
        borderColor: 'divider'
      }}
    >
      <Box sx={{ mb: 2 }}>
        {getIcon()}
      </Box>
      
      <Typography variant="h6" color="text.secondary" gutterBottom>
        {message}
      </Typography>
      
      {action && (
        <Box sx={{ mt: 3 }}>
          {action}
        </Box>
      )}
    </Paper>
  );
};

export default EmptyState;
