import * as React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Alert,
  LinearProgress,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useDropzone } from "react-dropzone";

type Props = {
  open: boolean;
  onClose: () => void;
  onSubmit: (file: File) => Promise<string>; // return success message
};

export default function ApplyDialog({ open, onClose, onSubmit }: Props) {
  const [file, setFile] = React.useState<File | null>(null);
  const [submitting, setSubmitting] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!open) {
      // reset state when hiding
      setFile(null);
      setSubmitting(false);
      setError(null);
      setSuccess(null);
    }
  }, [open]);

  const {
    getRootProps,
    getInputProps,
    open: openPicker,
    isDragActive,
  } = useDropzone({
    multiple: false,
    noClick: true, // so clicking the box doesn't immediately open picker
    accept: {
      "application/pdf": [".pdf"],
      "application/msword": [".doc"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [
        ".docx",
      ],
    },
    onDrop: (accepted) => {
      const f = accepted?.[0];
      if (f) {
        setFile(f);
        setError(null);
      }
    },
  });

  const submit = async () => {
    if (!file) {
      setError("Please select a file (PDF, DOC, or DOCX).");
      return;
    }
    setSubmitting(true);
    setError(null);
    setSuccess(null);
    try {
      const msg = await onSubmit(file);
      setSuccess(msg || "Application submitted.");
      // auto-close after a short delay
      setTimeout(() => onClose(), 1200);
    } catch (e: any) {
      setError(e?.message || "Failed to submit application.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => {}} fullWidth maxWidth="sm">
      <DialogTitle>Apply to Job</DialogTitle>
      <DialogContent dividers>
        {submitting && <LinearProgress sx={{ mb: 2 }} />}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box
          {...getRootProps()}
          sx={{
            border: "2px dashed",
            borderColor: isDragActive ? "primary.main" : "divider",
            borderRadius: 2,
            p: 3,
            textAlign: "center",
            bgcolor: isDragActive ? "action.hover" : "transparent",
            cursor: "default",
          }}
        >
          <input {...getInputProps()} />
          <UploadFileIcon />
          <Typography variant="body2" sx={{ mt: 1 }}>
            Drag & drop your resume here
          </Typography>
          <Typography variant="caption" color="text.secondary">
            (PDF, DOC, or DOCX)
          </Typography>

          <Box sx={{ mt: 2 }}>
            <Button variant="outlined" onClick={openPicker} disabled={submitting}>
              Select file
            </Button>
          </Box>

          {file && (
            <Typography variant="body2" sx={{ mt: 2 }}>
              Selected: <strong>{file.name}</strong>
            </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button variant="text" onClick={onClose} disabled={submitting}>
          Cancel
        </Button>
        <Button variant="contained" onClick={submit} disabled={submitting}>
          Upload & Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
}
