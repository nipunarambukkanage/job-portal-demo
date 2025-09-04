import * as React from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import StarIcon from "@mui/icons-material/Star";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { useUser, useAuth } from "@clerk/clerk-react";

import type { Job } from "../../api/types/job";
import ROUTES from "../../config/routes";

// .NET jobs API client (you already have these)
import { jobsService } from "../../api/services/jobs";

// Python “starred” example you had – keep as is
import { listStarred, addStar, removeStar } from "../../api/python/starred";

// New helpers we’ll add (below) for resume upload + ingest
import { uploadResumeToDotnet } from "../../api/services/uploads";
import { ingestResumeToPython } from "../../api/services/python/resume";

export default function JobsListPage() {
  const { isSignedIn, user } = useUser();
  const { getToken } = useAuth();

  const [jobs, setJobs] = React.useState<Job[]>([]);
  const [stars, setStars] = React.useState<string[]>([]);
  const [dropping, setDropping] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  // Load jobs from .NET
  React.useEffect(() => {
    (async () => {
      const res = await jobsService.list({ page: 1, pageSize: 20 });
      setJobs(res.items ?? []); // handle Paged wrapper
    })().catch(() => setJobs([]));
  }, []);

  // Load starred (Python)
  React.useEffect(() => {
    if (!isSignedIn) return;
    listStarred().then(setStars).catch(() => {});
  }, [isSignedIn]);

  const toggleStar = async (jobId: string) => {
    try {
      if (stars.includes(jobId)) {
        await removeStar(jobId);
        setStars((s) => s.filter((x) => x !== jobId));
      } else {
        await addStar(jobId);
        setStars((s) => [...s, jobId]);
      }
    } catch {}
  };

  const onDropFile = async (file: File) => {
    if (!isSignedIn || !user) return;

    setBusy(true);
    try {
      // 1) Upload the file to Azure Blob via .NET
      const jwt = await getToken({ template: "jobportal-api" }); // Clerk JWT for .NET
      const { blobUrl, sasUrl } = await uploadResumeToDotnet(file, jwt || undefined);

      // 2) Notify Python to ingest & parse (use SAS so Doc Intel can fetch)
      await ingestResumeToPython({
        blob_url: blobUrl,
        blob_sas_url: sasUrl,
        file_name: file.name,
        mime_type: file.type,
        size_bytes: file.size,
      });

      alert("Resume uploaded and queued for parsing.");
    } catch (err) {
      console.error(err);
      alert("Failed to upload/ingest resume.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Stack spacing={2}>
      {jobs.map((j) => (
        <Card key={j.id} variant="outlined">
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
              <Box>
                <Typography variant="h6">{j.title}</Typography>
                <Typography variant="body2" color="text.secondary">
                  {/* this will be taken from a joined firlf from org table and jobs table{j.company} */}
                   Nipuna Rambukkanage (Pvt) Ltd — {j.location} 
                </Typography>
              </Box>
              <IconButton onClick={() => toggleStar(j.id)} aria-label="star">
                {stars.includes(j.id) ? <StarIcon /> : <StarBorderIcon />}
              </IconButton>
            </Stack>

            {/* Drag & drop area */}
            <Box
              onDragOver={(e) => { e.preventDefault(); setDropping(true); }}
              onDragLeave={() => setDropping(false)}
              onDrop={(e) => {
                e.preventDefault(); setDropping(false);
                const f = e.dataTransfer.files?.[0]; if (f) onDropFile(f);
              }}
              sx={{
                mt: 2, p: 2, border: "1px dashed",
                borderColor: dropping ? "primary.main" : "divider",
                borderRadius: 2, textAlign: "center",
                opacity: busy ? 0.6 : 1,
                pointerEvents: busy ? "none" : "auto",
              }}
            >
              <UploadFileIcon />
              <Typography variant="body2">
                Drag & drop your CV here to upload & parse
              </Typography>
            </Box>
          </CardContent>
          <CardActions>
            <Button variant="outlined" href={ROUTES.applications.list}>Compare with applicants</Button>
            <Button variant="contained" href={ROUTES.ai.recommendations}>See job matches</Button>
          </CardActions>
        </Card>
      ))}
    </Stack>
  );
}
