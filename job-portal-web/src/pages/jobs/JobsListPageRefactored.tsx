import React, { useState } from 'react';
import { Box, Alert, Button, Container } from '@mui/material';
import { useUser } from '@clerk/clerk-react';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';

import { JobList } from '../../components/jobs';
import { useJobs, useStarredJobs, usePythonUser } from '../../hooks';
import UpdateProfileDialog, {
  type UpdateProfileValues,
} from '../../components/profile/UpdateProfileDialog';
import SimpleApplyDialog from '../../components/apply/SimpleApplyDialog';
import ErrorDisplay from '../../components/feedback/ErrorDisplay';
import ROUTES from '../../config/routes';
import { useNavigate } from 'react-router-dom';

const JobsListPageRefactored: React.FC = () => {
  const navigate = useNavigate();
  const { isSignedIn } = useUser();
  const { jobs, loading: jobsLoading, error: jobsError, refetch } = useJobs();
  const { starredJobIds, toggleStar } = useStarredJobs();
  const { 
    pyUserId, 
    needsProfile, 
    loading: userLoading, 
    createUser: createPythonUser 
  } = usePythonUser();

  // Local state for dialogs
  const [profileOpen, setProfileOpen] = useState(false);
  const [profileSaving, setProfileSaving] = useState(false);
  const [applyJobId, setApplyJobId] = useState<string | null>(null);

  // Open profile dialog when needed
  React.useEffect(() => {
    if (needsProfile && !userLoading) {
      setProfileOpen(true);
    }
  }, [needsProfile, userLoading]);

  const handleSaveProfile = async (values: UpdateProfileValues) => {
    setProfileSaving(true);
    try {
      await createPythonUser({
        full_name: values.full_name,
        headline: values.headline,
        about: values.about,
        role: 'org:member',
      });
      setProfileOpen(false);
    } catch (error) {
      console.error('Failed to create profile:', error);
    } finally {
      setProfileSaving(false);
    }
  };

  const handleToggleStar = async (jobId: string) => {
    if (!pyUserId) {
      setProfileOpen(true);
      return;
    }
    await toggleStar(jobId);
  };

  const handleApply = (jobId: string) => {
    if (!pyUserId) {
      setProfileOpen(true);
      return;
    }
    setApplyJobId(jobId);
  };

  const handleViewDetails = (jobId: string) => {
    navigate(ROUTES.jobs.detail(jobId));
  };

  const handleRefresh = () => {
    refetch();
  };

  if (jobsError) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <ErrorDisplay 
          error={jobsError}
          title="Failed to load jobs"
          onRetry={handleRefresh}
        />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'grid', gap: 3 }}>
        {/* Top banner */}
        <Alert
          icon={<NotificationsActiveIcon />}
          severity="info"
          sx={{ borderRadius: 2 }}
          action={
            <Button size="small" color="inherit" onClick={handleRefresh}>
              Refresh
            </Button>
          }
        >
          Discover your next career opportunity! Apply to jobs that match your skills and interests.
        </Alert>

        {/* Jobs list */}
        <JobList
          jobs={jobs}
          loading={jobsLoading}
          starredJobIds={starredJobIds}
          onToggleStar={handleToggleStar}
          onApply={handleApply}
          onViewDetails={handleViewDetails}
          showApplyButton={isSignedIn}
          showStarButton={isSignedIn}
          emptyMessage="No jobs available at the moment. Check back later!"
          title="Available Positions"
        />
      </Box>

      {/* Profile Setup Dialog */}
      <UpdateProfileDialog
        open={profileOpen}
        onClose={() => setProfileOpen(false)}
        onSave={handleSaveProfile}
        saving={profileSaving}
      />

      {/* Apply Dialog */}
      {applyJobId && (
        <SimpleApplyDialog
          open={!!applyJobId}
          jobId={applyJobId}
          onClose={() => setApplyJobId(null)}
          userId={pyUserId}
        />
      )}
    </Container>
  );
};

export default JobsListPageRefactored;
