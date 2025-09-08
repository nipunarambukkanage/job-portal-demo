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
import Chip from '@mui/material/Chip';
import Tooltip from '@mui/material/Tooltip';
import Skeleton from '@mui/material/Skeleton';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import PlaceIcon from '@mui/icons-material/Place';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import TimelineIcon from '@mui/icons-material/Timeline';
import ReactApexChart from 'react-apexcharts';

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
// create Python application explicitly
import { createPyApplication } from '../../api/services/python/applications';

const isGuid = (s: string | undefined | null): s is string =>
  !!s &&
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(
    s,
  );

// ---------- Helpers (dummy “interesting” features) ----------
const seeded = (key: string) => {
  let h = 2166136261;
  for (let i = 0; i < key.length; i++) h = (h ^ key.charCodeAt(i)) * 16777619;
  // 0..1
  return ((h >>> 0) % 1000) / 1000;
};
const popularityScore = (job: Job) => {
  // Stable 45..97% based on id + salary
  const base = seeded(job.id) * 0.5 + 0.45;
  const salaryBoost =
    (job.salaryMax ?? 0) > 0 ? Math.min((job.salaryMax as number) / 200000, 0.3) : 0;
  return Math.min(0.97, base + salaryBoost) * 100;
};
const isNew = (job: Job) => {
  const created = job.createdAt ? new Date(job.createdAt) : null;
  if (!created) return false;
  const diffDays = (Date.now() - created.getTime()) / (1000 * 60 * 60 * 24);
  return diffDays <= 7;
};
const isHot = (job: Job) => popularityScore(job) >= 80;
const isRecommended = (job: Job) => popularityScore(job) >= 75 || (job.salaryMax ?? 0) >= 150000;

const radialOptions = (label: string) =>
  ({
    chart: { type: 'radialBar', sparkline: { enabled: true } },
    plotOptions: {
      radialBar: {
        hollow: { size: '58%' },
        track: { strokeWidth: '100%' },
        dataLabels: {
          name: { show: true, fontSize: '12px' },
          value: {
            show: true,
            fontSize: '18px',
            formatter: (v: number) => `${Math.round(Number(v))}%`,
          },
        },
      },
    },
    labels: [label],
  }) as any;

const formatSalary = (min?: number | null, max?: number | null) => {
  if (min && max) return `${min} - ${max}`;
  if (min) return `${min}+`;
  if (max) return `Up to ${max}`;
  return '—';
};

// ---------- Component ----------
export default function JobsListPage() {
  const { isSignedIn, user } = useUser();
  const { getToken } = useAuth();

  const [jobs, setJobs] = React.useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = React.useState(true);
  const [stars, setStars] = React.useState<string[]>([]);

  // profile-gate
  const [profileOpen, setProfileOpen] = React.useState(false);
  const [profileSaving, setProfileSaving] = React.useState(false);
  const [pyUserId, setPyUserId] = React.useState<string | null>(null);
  const [checkingUser, setCheckingUser] = React.useState(true);

  // apply dialog
  const [applyJobId, setApplyJobId] = React.useState<string | null>(null);

  // Load jobs (.NET)
  React.useEffect(() => {
    (async () => {
      try {
        setLoadingJobs(true);
        const res = await jobsService.list({ page: 1, pageSize: 20 });
        setJobs(res.items ?? []);
      } catch {
        setJobs([]);
      } finally {
        setLoadingJobs(false);
      }
    })();
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
            setProfileOpen(false);
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

  // Save profile -> create Python user
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

  // Open apply dialog
  const openApply = (jobId: string) => {
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
        job_id: applyJobId,
      },
      pyUserId,
    );

    // 3) Create the .NET Application
    await applicationsService.create({
      jobId: applyJobId,
      candidateId: pyUserId as any,
      resumeUrl: blobUrl,
    } as any);

    // 4) Also create a Python application row (for analytics)
    try {
      await createPyApplication({
        job_id: applyJobId,
        applicant_user_id: pyUserId,
        resume_id: ingest?.resume_id ?? null,
        resume_url: blobUrl,
      });
    } catch (e) {
      console.warn('Failed to create Python application row:', e);
    }

    return `Resume uploaded and application recorded.`;
  };

  // Avoid rendering content while user check is running
  if (checkingUser) return null;

  // ---------- UI ----------
  const JobSkeletonCard = () => (
    <Card variant="outlined">
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="40%" height={28} />
            <Skeleton variant="text" width="60%" />
            <Skeleton variant="text" width="30%" />
            <Skeleton variant="text" width="50%" />
          </Box>
          <Box sx={{ minWidth: 120 }}>
            <Skeleton variant="circular" width={100} height={100} />
          </Box>
        </Stack>
      </CardContent>
      <CardActions>
        <Skeleton variant="rectangular" width={120} height={36} />
        <Skeleton variant="rectangular" width={160} height={36} />
      </CardActions>
    </Card>
  );

  const JobCard = ({ j }: { j: Job }) => {
    const score = Math.round(popularityScore(j));
    const chips: React.ReactNode[] = [];
    if (isRecommended(j))
      chips.push(<Chip key="rec" color="success" size="small" label="Recommended" />);
    if (isHot(j))
      chips.push(<Chip key="hot" color="error" size="small" icon={<WhatshotIcon />} label="Hot" />);
    if (isNew(j))
      chips.push(
        <Chip key="new" color="primary" size="small" icon={<NewReleasesIcon />} label="New" />,
      );
    if ((j.location || '').toLowerCase().includes('remote'))
      chips.push(<Chip key="remote" variant="outlined" size="small" label="Remote" />);

    return (
      <Card key={j.id} variant="outlined" sx={{ overflow: 'hidden' }}>
        <CardContent>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            justifyContent="space-between"
            alignItems={{ xs: 'stretch', sm: 'flex-start' }}
            spacing={2}
          >
            {/* Left: job info */}
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Stack
                direction="row"
                alignItems="center"
                spacing={1}
                sx={{ flexWrap: 'wrap', rowGap: 1 }}
              >
                <Typography variant="h6" sx={{ mr: 1 }}>
                  {j.title}
                </Typography>
                <Stack direction="row" spacing={1}>
                  {chips}
                </Stack>
              </Stack>

              <Stack direction="row" spacing={2} sx={{ mt: 0.5, flexWrap: 'wrap', rowGap: 1 }}>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <WorkOutlineIcon fontSize="small" />
                  <Typography variant="body2" color="text.secondary">
                    {j.company}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <PlaceIcon fontSize="small" />
                  <Typography variant="body2" color="text.secondary">
                    {j.location || '—'}
                  </Typography>
                </Stack>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <MonetizationOnIcon fontSize="small" />
                  <Typography variant="body2" color="text.secondary">
                    {formatSalary(j.salaryMin as any, j.salaryMax as any)}
                  </Typography>
                </Stack>
              </Stack>

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

            {/* Right: popularity radial + star */}
            <Stack alignItems="center" spacing={1} sx={{ minWidth: 140 }}>
              <Tooltip title="Job popularity (demo)">
                <Box sx={{ width: 120, height: 120 }}>
                  <ReactApexChart
                    type="radialBar"
                    height={120}
                    width={120}
                    series={[score]}
                    options={radialOptions('Popularity')}
                  />
                </Box>
              </Tooltip>
              <Typography variant="caption" color="text.secondary">
                Popularity (demo)
              </Typography>
              <IconButton onClick={() => toggleStar(j.id)} aria-label="star">
                {stars.includes(j.id) ? <StarIcon /> : <StarBorderIcon />}
              </IconButton>
            </Stack>
          </Stack>
        </CardContent>

        <CardActions sx={{ px: 2, pb: 2, pt: 0 }}>
          <Button variant="contained" onClick={() => openApply(j.id)}>
            Apply
          </Button>
          <Button variant="outlined" href={ROUTES.applications.list}>
            View Applications
          </Button>
          <Box sx={{ ml: 'auto' }}>
            <Button
              size="small"
              variant="text"
              endIcon={<TimelineIcon fontSize="small" />}
              onClick={() => window.open(ROUTES.jobs.list + `?focus=${j.id}`, '_self')}
            >
              Similar roles
            </Button>
          </Box>
        </CardActions>
      </Card>
    );
  };

  return (
    <>
      {/* Mandatory profile gate */}
      <UpdateProfileDialog
        open={profileOpen}
        onClose={() => {}}
        onSave={handleSaveProfile}
        saving={profileSaving}
      />

      {/* Apply dialog */}
      <ApplyDialog
        open={!!applyJobId}
        onClose={() => setApplyJobId(null)}
        onSubmit={submitApplication}
      />

      {/* Jobs list */}
      {!profileOpen && (
        <Stack spacing={2}>
          {loadingJobs ? (
            Array.from({ length: 5 }).map((_, i) => <JobSkeletonCard key={i} />)
          ) : jobs.length === 0 ? (
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6">No jobs found</Typography>
                <Typography variant="body2" color="text.secondary">
                  Try adjusting your filters or check back later.
                </Typography>
              </CardContent>
            </Card>
          ) : (
            jobs.map((j) => <JobCard key={j.id} j={j} />)
          )}
        </Stack>
      )}
    </>
  );
}
