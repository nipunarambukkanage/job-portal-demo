// src/pages/jobs/JobsListPage.tsx
import * as React from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardActions from '@mui/material/CardActions';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import { useUser, useAuth } from '@clerk/clerk-react';

import type { Job } from '../../api/types/job';
import ROUTES from '../../config/routes';

import { jobsService } from '../../api/services/jobs';
import { listStarred, addStar, removeStar } from '../../api/python/starred';
import { uploadResumeToDotnet } from '../../api/services/uploads';
import { ingestResumeToPython } from '../../api/services/python/resume';
import { applicationsService } from '../../api/services/applications';

import UpdateProfileDialog, {
  type UpdateProfileValues,
} from '../../components/profile/UpdateProfileDialog';
import { getUserByEmail, createUser } from '../../api/services/python/users';
import ApplyDialog from '../../components/apply/ApplyDialog';

// NEW: create Python application explicitly
import { createPyApplication } from '../../api/services/python/applications';

const isGuid = (s: string | undefined | null): s is string =>
  !!s &&
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(
    s,
  );

export default function JobsListPage() {
  const { isSignedIn, user } = useUser();
  const { getToken } = useAuth();

  const [jobs, setJobs] = React.useState<Job[]>([]);
  const [stars, setStars] = React.useState<string[]>([]);

  // profile-gate
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [profileSaving, setProfileSaving] = React.useState(false);
  const [pyUserId, setPyUserId] = React.useState<string | null>(null);
  const [checkingUser, setCheckingUser] = React.useState(true); // NEW: avoid flashing dialog

  // apply dialog
  const [applyJobId, setApplyJobId] = React.useState<string | null>(null);

  // Load jobs (.NET)
  React.useEffect(() => {
    (async () => {
      const res = await jobsService.list({ page: 1, pageSize: 20 });
      setJobs(res.items ?? []);
    })().catch(() => setJobs([]));
  }, []);

  // Ensure Python user exists
  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!isSignedIn || !user) {
        if (!cancelled) {
          setPyUserId(null);
          setProfileOpen(false);
          setCheckingUser(false);
        }
        return;
      }
      const email =
        user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress;
      if (!email) {
        if (!cancelled) {
          setPyUserId(null);
          setProfileOpen(true);
          setCheckingUser(false);
        }
        return;
      }

      try {
        const existing = await getUserByEmail(email);
        if (!cancelled) {
          if (existing) {
            setPyUserId(existing.id);
            setProfileOpen(false); // ensure the dialog is closed if user exists
          } else {
            setPyUserId(null);
            setProfileOpen(true);
          }
        }
      } catch {
        if (!cancelled) {
          setPyUserId(null);
          setProfileOpen(true);
        }
      } finally {
        if (!cancelled) setCheckingUser(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [isSignedIn, user]);

  // Load starred (Python)
  React.useEffect(() => {
    if (!isSignedIn) return;
    listStarred()
      .then(setStars)
      .catch(() => {});
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
    } catch {
      console.error('Failed to update star');
    }
  };

  // Save profile -> create Python user (optionally with Clerk GUID)
  const handleSaveProfile = async (values: UpdateProfileValues) => {
    if (!user) return;
    const email = user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress;
    if (!email) return;

    try {
      setProfileSaving(true);
      const externalId = isGuid(user.id) ? user.id : undefined;
      const created = await createUser(
        {
          email,
          full_name: values.full_name?.trim() || undefined,
          headline: values.headline?.trim() || undefined,
          about: values.about?.trim() || undefined,
        },
        externalId,
      );
      setPyUserId(created.id);
      setProfileOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setProfileSaving(false);
    }
  };

  // Open apply dialog for a job
  const openApply = (jobId: string) => {
    // guard: must have a Python user first
    if (!pyUserId) {
      setProfileOpen(true);
      return;
    }
    setApplyJobId(jobId);
  };

  // Upload + ingest + create .NET Application + create Python Application
  const submitApplication = async (file: File): Promise<string> => {
    if (!isSignedIn || !user || !pyUserId || !applyJobId) {
      throw new Error('Please complete your profile first.');
    }

    // 1) Upload to Azure via .NET
    const jwt = await getToken({ template: 'jobportal-api' });
    const { blobUrl, sasUrl } = await uploadResumeToDotnet(file, jwt || undefined);

    // 2) Notify Python to ingest (includes job_id for enrichment)
    const ingest = await ingestResumeToPython(
      {
        blob_url: blobUrl,
        blob_sas_url: sasUrl,
        file_name: file.name,
        mime_type: file.type,
        size_bytes: file.size,
        job_id: applyJobId, // helps Python side link context if supported
      },
      pyUserId, // X-User-Id
    );

    // 3) Create the .NET Application so it appears in your .NET list page
    await applicationsService.create({
      jobId: applyJobId,
      // your .NET API requires CandidateId; if your DTO includes it, pass here.
      // (you previously added candidateId on create — keep that if your API expects it)
      candidateId: pyUserId as any, // if your DTO supports it; otherwise remove this line
      resumeUrl: blobUrl,
    } as any);

    // 4) ALSO create Python application explicitly so analytics can count rows in public.applications
    try {
      await createPyApplication({
        job_id: applyJobId,
        applicant_user_id: pyUserId,          // TEXT in your Python table
        resume_id: ingest?.resume_id ?? null, // if ingest returned it
        resume_url: blobUrl,
        // status: 'submitted',                // optional; server defaults
      });
    } catch (e) {
      // Don’t fail the whole flow if Python-insert fails; just log
      console.warn('Failed to create Python application row:', e);
    }

    return `Resume uploaded and application recorded.`;
  };

  // Avoid rendering content while we’re checking the Python user to prevent flicker
  if (checkingUser) return null;

  return (
    <>
      {/* Mandatory profile gate */}
      <UpdateProfileDialog
        open={profileOpen}
        onClose={() => {}}
        onSave={handleSaveProfile}
        saving={profileSaving}
      />

      {/* Apply dialog (drag & drop + Choose File) */}
      <ApplyDialog
        open={!!applyJobId}
        onClose={() => setApplyJobId(null)}
        onSubmit={submitApplication}
      />

      {/* Jobs list */}
      {!profileOpen && (
        <Stack spacing={2}>
          {jobs.map((j) => (
            <Card key={j.id} variant="outlined">
              <CardContent>
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="flex-start"
                  spacing={2}
                >
                  <Box>
                    <Typography variant="h6">{j.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {j.company} — {j.location}
                    </Typography>
                    {(j.salaryMin || j.salaryMax) && (
                      <Typography variant="body2" sx={{ mt: 0.5 }}>
                        Salary:{' '}
                        {j.salaryMin
                          ? j.salaryMax
                            ? `${j.salaryMin} - ${j.salaryMax}`
                            : `${j.salaryMin}+`
                          : j.salaryMax
                            ? `Up to ${j.salaryMax}`
                            : ''}
                      </Typography>
                    )}
                    {j.createdAt && (
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ display: 'block', mt: 0.5 }}
                      >
                        Posted: {new Date(j.createdAt).toLocaleDateString()}
                      </Typography>
                    )}
                    {j.description && (
                      <Typography variant="body2" sx={{ mt: 1 }} noWrap>
                        {j.description}
                      </Typography>
                    )}
                  </Box>
                  <IconButton onClick={() => toggleStar(j.id)} aria-label="star">
                    {stars.includes(j.id) ? <StarIcon /> : <StarBorderIcon />}
                  </IconButton>
                </Stack>
              </CardContent>
              <CardActions>
                <Button variant="contained" onClick={() => openApply(j.id)}>
                  Apply
                </Button>
                <Button variant="outlined" href={ROUTES.applications.list}>
                  View Applications
                </Button>
              </CardActions>
            </Card>
          ))}
        </Stack>
      )}
    </>
  );
}
