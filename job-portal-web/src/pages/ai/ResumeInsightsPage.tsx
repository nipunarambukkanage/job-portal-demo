import { useState } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import {
  ingestAndWaitForFeatures,
  getResumeFeatures,
} from "../../api/services/ai";

/**
 * Resume Insights — backed by:
 *  - POST /v1/resumes/ingest  -> resume_id
 *  - GET  /v1/resumes/{resume_id}/features
 */
export default function ResumeInsightsPage() {
  const [text, setText] = useState("");
  const [url, setUrl] = useState("");
  const [resumeId, setResumeId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [features, setFeatures] = useState<unknown | null>(null);

  const onIngest = async () => {
    setError(null);
    setFeatures(null);
    setLoading(true);
    try {
      const res = await ingestAndWaitForFeatures(
        { text: text || undefined, url: url || undefined },
        { pollMs: 1500, timeoutMs: 20000 }
      );
      setResumeId(res.resumeId);
      setFeatures(res.features);
      if (!res.features) {
        setError(
          "Ingested. Features not ready yet — try fetching by Resume ID in a moment."
        );
      }
    } catch (e: any) {
      setError(e?.message ?? "Failed to ingest resume");
    } finally {
      setLoading(false);
    }
  };

  const onFetch = async () => {
    if (!resumeId) return;
    setError(null);
    setLoading(true);
    try {
      const res = await getResumeFeatures(resumeId);
      setFeatures(res);
    } catch (e: any) {
      setError(e?.message ?? "Failed to fetch features");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box p={3} display="flex" flexDirection="column" gap={3}>
      <Typography variant="h5">Resume Insights (AI)</Typography>

      <Box display="flex" flexDirection="column" gap={2} maxWidth={800}>
        <TextField
          label="Resume text (paste)"
          value={text}
          onChange={(e) => setText(e.target.value)}
          multiline
          minRows={6}
        />
        <TextField
          label="Resume URL (optional)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://…"
        />

        <Box display="flex" gap={1} alignItems="center">
          <Button
            variant="contained"
            onClick={onIngest}
            disabled={loading || (!text && !url)}
          >
            Ingest & Fetch
          </Button>
          {loading && <CircularProgress size={18} />}
        </Box>

        <Box display="flex" flexDirection="row" gap={1} alignItems="center">
          <TextField
            label="Resume ID"
            value={resumeId}
            onChange={(e) => setResumeId(e.target.value)}
            sx={{ maxWidth: 360 }}
          />
          <Button onClick={onFetch} disabled={!resumeId || loading}>
            Fetch features
          </Button>
        </Box>

        {error && <Alert severity="warning">{error}</Alert>}

        {features && (
          <Card variant="outlined">
            <CardContent>
              <Typography variant="subtitle1" gutterBottom>
                Features
              </Typography>
              <pre
                style={{
                  margin: 0,
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {JSON.stringify(features, null, 2)}
              </pre>
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
}
