import { useEffect, useMemo, useState } from "react";
import { useUser } from "@clerk/clerk-react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import {
  CandidateProfile,
  Job,
  getCandidateMe,
  listJobs,
  getJobCandidates,
  overlapScore,
} from "../../api/services/ai";

/**
 * Recommendations page backed only by existing endpoints:
 *  - Candidate view: /v1/candidates/me + /v1/jobs (client-side scoring)
 *  - Employer view:  /v1/jobs + /v1/jobs/{id}/candidates
 */
export default function RecommendationsPage() {
  const { user } = useUser();
  const role = (user?.publicMetadata as any)?.role ?? "candidate"; // "admin" | "employer" | "candidate"
  const isEmployer = role === "employer" || role === "admin";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Shared data
  const [jobs, setJobs] = useState<Job[]>([]);

  // Candidate view
  const [me, setMe] = useState<CandidateProfile | null>(null);

  // Employer view
  const [selectedJobId, setSelectedJobId] = useState<string>("");
  const [candidates, setCandidates] = useState<CandidateProfile[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const [jobsRes, meRes] = await Promise.all([
          listJobs(),
          isEmployer ? Promise.resolve(null) : getCandidateMe(),
        ]);
        if (!active) return;
        setJobs(jobsRes);
        setMe(meRes as any);
      } catch (e: any) {
        setError(e?.message ?? "Failed to load recommendations data");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [isEmployer]);

  const scoredJobs = useMemo(() => {
    if (!me) return [];
    return jobs
      .map((j) => ({
        job: j,
        score: overlapScore(me.skills, j.skills),
      }))
      .sort((a, b) => b.score - a.score);
  }, [jobs, me]);

  useEffect(() => {
    if (!isEmployer || !selectedJobId) return;
    let active = true;
    (async () => {
      try {
        setLoadingCandidates(true);
        const data = await getJobCandidates(selectedJobId);
        if (active) setCandidates(data);
      } catch (e) {
        if (import.meta.env.DEV) console.warn("Failed to load candidates", e);
      } finally {
        if (active) setLoadingCandidates(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [isEmployer, selectedJobId]);

  if (loading) {
    return (
      <Box p={3} display="flex" alignItems="center" gap={1}>
        <CircularProgress size={20} />
        <Typography>Loading recommendations…</Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  return (
    <Box p={3} display="flex" flexDirection="column" gap={3}>
      <Typography variant="h5">Recommendations (AI)</Typography>

      {isEmployer ? (
        <Box display="flex" flexDirection="column" gap={2}>
          <Typography variant="subtitle1">
            Select a job to see matched candidates
          </Typography>
          <TextField
            select
            label="Job"
            value={selectedJobId}
            onChange={(e) => setSelectedJobId(e.target.value)}
            sx={{ maxWidth: 420 }}
          >
            {jobs.map((j) => (
              <MenuItem key={String(j.id)} value={String(j.id)}>
                {j.title ?? j.id}
              </MenuItem>
            ))}
          </TextField>

          {loadingCandidates && (
            <Box display="flex" alignItems="center" gap={1}>
              <CircularProgress size={18} />
              <Typography>Loading candidates…</Typography>
            </Box>
          )}

          <Box display="flex" flexDirection="column" gap={2}>
            {!loadingCandidates && !candidates.length && selectedJobId && (
              <Alert severity="info">
                No matched candidates found for this job.
              </Alert>
            )}
            {candidates.map((c) => (
              <Card variant="outlined" key={String(c.id)}>
                <CardContent>
                  <Typography fontWeight={600}>{String(c.id)}</Typography>
                  {Array.isArray(c.skills) && c.skills.length > 0 && (
                    <Typography variant="body2" color="text.secondary">
                      Skills: {c.skills.join(", ")}
                    </Typography>
                  )}
                </CardContent>
              </Card>
            ))}
          </Box>
        </Box>
      ) : (
        <Box display="flex" flexDirection="column" gap={2}>
          {me && Array.isArray(me.skills) && me.skills.length > 0 && (
            <Alert severity="info">
              Matched on your skills: {me.skills.join(", ")}
            </Alert>
          )}
          {scoredJobs.length === 0 && (
            <Alert severity="warning">
              We could not compute personalized matches. Showing available jobs.
            </Alert>
          )}
          <Box display="flex" flexDirection="column" gap={2}>
            {(scoredJobs.length
              ? scoredJobs
              : jobs.map((j) => ({ job: j, score: 0 })))
              .map(({ job, score }) => (
                <Card key={String(job.id)} variant="outlined">
                  <CardContent>
                    <Typography variant="h6">{job.title ?? job.id}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {(job.company ?? "").toString()}{" "}
                      {job.location ? `• ${job.location}` : ""}
                    </Typography>
                    {Array.isArray(job.skills) && job.skills.length > 0 && (
                      <Typography variant="body2" sx={{ mt: 1 }}>
                        Required: {job.skills.join(", ")}
                      </Typography>
                    )}
                    {me && (
                      <Typography variant="caption" color="text.secondary">
                        Match score: {score}
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions>
                    <Button size="small">View</Button>
                  </CardActions>
                </Card>
              ))}
          </Box>
        </Box>
      )}
    </Box>
  );
}
