import * as React from "react";
import { Box, Paper, Stack, Typography, Button, List, ListItem, ListItemText } from "@mui/material";
import FileDropzone from "../../components/common/FileDropzone";
import { getResumeInsights, type ResumeInsight } from "../../api/services/python/resume";

export default function ResumeInsightsPage() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [insights, setInsights] = React.useState<ResumeInsight[]>([]);

  const analyze = async () => {
    if (!files.length) return;
    setLoading(true);
    try {
      const text = await files[0].text();
      const data = await getResumeInsights({ text });
      setInsights(data);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Resume Insights
      </Typography>

      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" },
          gap: 2,
        }}
      >
        <Paper sx={{ p: 2 }}>
          <FileDropzone
            value={files}
            onChange={setFiles}
            accept={{ "application/pdf": [".pdf"], "text/plain": [".txt"] }}
            helperText="PDF or TXT, up to 10MB"
          />
          <Stack direction="row" spacing={2} sx={{ mt: 2 }} alignItems="center">
            <Button variant="contained" onClick={analyze} disabled={loading || !files.length}>
              Analyze
            </Button>
            {loading && <Typography>Processing…</Typography>}
          </Stack>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle1" gutterBottom>
            Insights
          </Typography>
          {insights.length === 0 ? (
            <Typography color="text.secondary">Upload a resume to see insights.</Typography>
          ) : (
            <List dense>
              {insights.map((i) => (
                <ListItem key={i.key}>
                  <ListItemText primary={i.key} secondary={i.value} />
                </ListItem>
              ))}
            </List>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
