import React from "react";
import { useDropzone } from "react-dropzone";
import {
  Box,
  Paper,
  Typography,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  IconButton,
  Stack,
} from "@mui/material";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import DescriptionIcon from "@mui/icons-material/Description";
import DeleteIcon from "@mui/icons-material/DeleteForever";

export type FileDropzoneProps = {
  value?: File[];
  onChange?: (files: File[]) => void;
  accept?: Record<string, string[]>;
  maxSize?: number; // bytes
  multiple?: boolean;
  height?: number | string;
  helperText?: string;
};

const formatBytes = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export default function FileDropzone({
  value = [],
  onChange,
  accept,
  maxSize = 10 * 1024 * 1024,
  multiple = true,
  height = 180,
  helperText,
}: FileDropzoneProps) {
  const [files, setFiles] = React.useState<File[]>(value);

  const onDrop = React.useCallback(
    (accepted: File[]) => {
      const next = multiple ? [...files, ...accepted] : accepted.slice(0, 1);
      setFiles(next);
      onChange?.(next);
    },
    [files, multiple, onChange]
  );

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept,
    multiple,
    maxSize,
  });

  const removeAt = (idx: number) => {
    const next = files.filter((_, i) => i !== idx);
    setFiles(next);
    onChange?.(next);
  };

  return (
    <Stack spacing={1.5}>
      <Paper
        variant="outlined"
        sx={{
          p: 2,
          borderStyle: "dashed",
          bgcolor: isDragActive ? "action.hover" : "background.paper",
          transition: "background-color 0.2s ease",
        }}
      >
        <Box
          {...getRootProps()}
          sx={{
            minHeight: height,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            cursor: "pointer",
            p: 2,
          }}
        >
          <input {...getInputProps()} />
          <Stack spacing={1} alignItems="center">
            <CloudUploadIcon fontSize="large" />
            <Typography variant="subtitle1" fontWeight={600}>
              {isDragActive ? "Drop the files here…" : "Drag & drop files here"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              or click to browse
            </Typography>
            {helperText && (
              <Typography variant="caption" color="text.secondary">
                {helperText}
              </Typography>
            )}
          </Stack>
        </Box>
      </Paper>

      {!!fileRejections.length && (
        <Typography variant="caption" color="error">
          Some files were rejected (type or size). Max size: {formatBytes(maxSize)}.
        </Typography>
      )}

      {!!files.length && (
        <Paper variant="outlined" sx={{ p: 1 }}>
          <List dense disablePadding>
            {files.map((f, i) => (
              <ListItem
                key={i}
                secondaryAction={
                  <IconButton edge="end" aria-label="remove" onClick={() => removeAt(i)}>
                    <DeleteIcon />
                  </IconButton>
                }
              >
                <ListItemIcon>
                  <DescriptionIcon />
                </ListItemIcon>
                <ListItemText
                  primary={f.name}
                  secondary={`${f.type || "unknown"} • ${formatBytes(f.size)}`}
                />
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Stack>
  );
}
