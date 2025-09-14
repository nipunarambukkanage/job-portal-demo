import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Alert,
} from '@mui/material';

interface SimpleApplyDialogProps {
  open: boolean;
  jobId: string;
  onClose: () => void;
  userId: string | null;
}

const SimpleApplyDialog: React.FC<SimpleApplyDialogProps> = ({
  open,
  onClose,
  userId,
}) => {
  const [applying, setApplying] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleApply = async () => {
    setApplying(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setApplying(false);
    setSuccess(true);
    
    // Auto close after success
    setTimeout(() => {
      setSuccess(false);
      onClose();
    }, 2000);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Apply to Job</DialogTitle>
      <DialogContent>
        {success ? (
          <Alert severity="success">
            Application submitted successfully!
          </Alert>
        ) : (
          <Typography>
            Are you sure you want to apply to this position? 
            Your profile and resume will be submitted to the employer.
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={applying}>
          Cancel
        </Button>
        {!success && (
          <Button 
            onClick={handleApply} 
            variant="contained" 
            disabled={applying || !userId}
          >
            {applying ? 'Applying...' : 'Apply'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default SimpleApplyDialog;
