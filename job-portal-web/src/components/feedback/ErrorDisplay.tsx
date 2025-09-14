import React from 'react';
import { Alert, AlertTitle, Button } from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';

interface ErrorDisplayProps {
  error: string | Error;
  onRetry?: () => void;
  title?: string;
  showRetry?: boolean;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  error,
  onRetry,
  title = 'Something went wrong',
  showRetry = true,
}) => {
  const errorMessage = error instanceof Error ? error.message : error;

  return (
    <Alert 
      severity="error" 
      sx={{ borderRadius: 2 }}
      action={
        showRetry && onRetry && (
          <Button
            color="inherit"
            size="small"
            startIcon={<RefreshIcon />}
            onClick={onRetry}
          >
            Retry
          </Button>
        )
      }
    >
      <AlertTitle>{title}</AlertTitle>
      {errorMessage}
    </Alert>
  );
};

export default ErrorDisplay;
