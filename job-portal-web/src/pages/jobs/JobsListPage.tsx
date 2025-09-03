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
import { useUser } from "@clerk/clerk-react";
import type { Job } from "../../api/types/job";
import { listStarred, addStar, removeStar } from "../../api/python/starred";
import ROUTES from "../../config/routes";

export default function JobsListPage() {
  const { isSignedIn } = useUser();
  const [jobs, setJobs] = React.useState<Job[]>([]);
  const [stars, setStars] = React.useState<string[]>([]);
  const [dropping, setDropping] = React.useState(false);

  React.useEffect(() => {
    // TODO: replace with your .NET GET /api/jobs list once wired
    (async () => {
      const resp = await fetch("/mock/jobs.json").catch(() => null);
      const items: Job[] = resp ? await resp.json() : [];
      setJobs(items);
    })();
  }, []);

  React.useEffect(() => {
    if (!isSignedIn) return;
    listStarred().then(setStars).catch(() => {});
  }, [isSignedIn]);

  const toggleStar = async (jobId: string) => {
    try {
      if (stars.includes(jobId)) {
        await removeStar(jobId);
        setStars(s => s.filter(x => x !== jobId));
      } else {
        await addStar(jobId);
        setStars(s => [...s, jobId]);
      }
    } catch {}
  };

  const onDropFile = async (file: File) => {
    // TODO: Post to Python /v1/resumes/ingest with file (already exists in your API)
    console.log("Upload CV", file.name);
  };

  return (
    <Stack spacing={2}>
      {jobs.map((j) => (
        <Card key={j.id} variant="outlined">
          <CardContent>
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
              <Box>
                <Typography variant="h6">{j.title}</Typography>
                <Typography variant="body2" color="text.secondary">{j.company} • {j.location}</Typography>
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
              }}
            >
              <UploadFileIcon />
              <Typography variant="body2">Drag & drop your CV here to compare & get recommendations</Typography>
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
