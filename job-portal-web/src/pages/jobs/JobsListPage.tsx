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
import UploadFileIcon from '@mui/icons-material/UploadFile';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useSnackbar } from 'notistack';

import type { Job } from '../../api/types/job';
import ROUTES from '../../config/routes';

import { jobsService } from '../../api/services/jobs';
import { listStarred, addStar, removeStar } from '../../api/python/starred';
import { uploadResumeToDotnet } from '../../api/services/uploads';
import { ingestResumeToPython } from '../../api/services/python/resume';

import UpdateProfileDialog, {
  type UpdateProfileValues,
} from '../../components/profile/UpdateProfileDialog';
import { getUserByEmail, createUser } from '../../api/services/python/users';
import { applicationsService } from '../../api/services/applications';

const isGuid = (s: string | undefined | null): s is string =>
  !!s &&
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(
    s,
  );

export default function JobsListPage() {
  const { isSignedIn, user } = useUser();
  const { getToken } = useAuth();
  const { enqueueSnackbar } = useSnackbar();

  const [jobs, setJobs] = React.useState<Job[]>([]);
  const [stars, setStars] = React.useState<string[]>([]);
  const [dropping, setDropping] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  const [profileOpen, setProfileOpen] = React.useState(false);
  const [profileSaving, setProfileSaving] = React.useState(false);
  const [pyUserId, setPyUserId] = React.useState<string | null>(null);

  React.useEffect(() => {
    (async () => {
      const res = await jobsService.list({ page: 1, pageSize: 20 });
      setJobs(res.items ?? []);
    })().catch(() => setJobs([]));
  }, []);

  React.useEffect(() => {
    if (!isSignedIn || !user) return;
    (async () => {
      const email =
        user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress;
      if (!email) return;

      try {
        const existing = await getUserByEmail(email);
        if (existing) {
          setPyUserId(existing.id);
          return;
        }
        setProfileOpen(true);
      } catch {
        setProfileOpen(true);
      }
    })();
  }, [isSignedIn, user]);

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
        enqueueSnackbar('Removed from starred', { variant: 'info' });
      } else {
        await addStar(jobId);
        setStars((s) => [...s, jobId]);
        enqueueSnackbar('Added to starred', { variant: 'success' });
      }
    } catch {
      enqueueSnackbar('Could not update starred list', { variant: 'error' });
    }
  };

  const handleSaveProfile = async (values: UpdateProfileValues) => {
    if (!user) return;
    const email = user.primaryEmailAddress?.emailAddress || user.emailAddresses?.[0]?.emailAddress;
    if (!email) {
      enqueueSnackbar('No email found in Clerk profile.', { variant: 'error' });
      return;
    }

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
      enqueueSnackbar('Profile saved!', { variant: 'success' });
    } catch (err) {
      console.error(err);
      enqueueSnackbar('Failed to save your profile. Please try again.', { variant: 'error' });
    } finally {
      setProfileSaving(false);
    }
  };

  // NOTE: we now receive the jobId
  const onDropFile = async (file: File, jobId: string) => {
    if (!isSignedIn || !user || !pyUserId) {
      enqueueSnackbar('Please complete your profile first.', { variant: 'warning' });
      return;
    }

    setBusy(true);
    try {
      // 1) Upload to Azure via .NET (uses your JWT)
      const jwt = await getToken({ template: 'jobportal-api' });
      const { blobUrl, sasUrl } = await uploadResumeToDotnet(file, jwt || undefined);

      // 2) Tell Python to ingest & link to this job (also ties to user via header)
      await ingestResumeToPython(
        {
          blob_url: blobUrl,
          blob_sas_url: sasUrl,
          file_name: file.name,
          mime_type: file.type,
          size_bytes: file.size,
          job_id: jobId, // <—— NEW
        },
        pyUserId,
      );

      // 3) Create .NET Application so your Applications pages show the record
      await applicationsService.create({
        jobId,
        resumeUrl: blobUrl, // or sasUrl if your server fetches with SAS
        // coverLetter?: add if you collect one
      });

      enqueueSnackbar('Resume uploaded and application submitted.', { variant: 'success' });
    } catch (err) {
      console.error(err);
      enqueueSnackbar('Failed to upload/ingest resume.', { variant: 'error' });
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <UpdateProfileDialog
        open={profileOpen}
        onClose={() => {}}
        onSave={handleSaveProfile}
        saving={profileSaving}
      />

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
                      Nipuna Rambukkanage (Pvt) Ltd — {j.location}
                    </Typography>
                  </Box>
                  <IconButton onClick={() => toggleStar(j.id)} aria-label="star">
                    {stars.includes(j.id) ? <StarIcon /> : <StarBorderIcon />}
                  </IconButton>
                </Stack>

                {/* Drag & drop area (now passes the job id) */}
                <Box
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDropping(true);
                  }}
                  onDragLeave={() => setDropping(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDropping(false);
                    const f = e.dataTransfer.files?.[0];
                    if (f) onDropFile(f, j.id);
                  }}
                  sx={{
                    mt: 2,
                    p: 2,
                    border: '1px dashed',
                    borderColor: dropping ? 'primary.main' : 'divider',
                    borderRadius: 2,
                    textAlign: 'center',
                    opacity: busy ? 0.6 : 1,
                    pointerEvents: busy ? 'none' : 'auto',
                  }}
                >
                  <UploadFileIcon />
                  <Typography variant="body2">
                    Drag &amp; drop your CV here to upload &amp; apply
                  </Typography>
                </Box>
              </CardContent>
              <CardActions>
                <Button variant="outlined" href={ROUTES.applications.list}>
                  Compare with applicants
                </Button>
                <Button variant="contained" href={ROUTES.ai.recommendations}>
                  See job matches
                </Button>
              </CardActions>
            </Card>
          ))}
        </Stack>
      )}
    </>
  );
}
