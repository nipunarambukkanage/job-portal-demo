import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import type { Job } from '../../api/types/job';
import JobCard from './JobCard';
import LoadingGrid from '../common/LoadingGrid';
import EmptyState from '../tables/EmptyState';

interface JobListProps {
  jobs: Job[];
  loading?: boolean;
  starredJobIds?: string[];
  onToggleStar?: (jobId: string) => void;
  onApply?: (jobId: string) => void;
  onViewDetails?: (jobId: string) => void;
  showApplyButton?: boolean;
  showStarButton?: boolean;
  emptyMessage?: string;
  title?: string;
}

const JobList: React.FC<JobListProps> = ({
  jobs,
  loading = false,
  starredJobIds = [],
  onToggleStar,
  onApply,
  onViewDetails,
  showApplyButton = true,
  showStarButton = true,
  emptyMessage = 'No jobs found',
  title,
}) => {
  if (loading) {
    return <LoadingGrid count={6} />;
  }

  if (jobs.length === 0) {
    return (
      <EmptyState 
        message={emptyMessage}
      />
    );
  }

  return (
    <Box>
      {title && (
        <Typography variant="h5" gutterBottom sx={{ mb: 3 }}>
          {title}
        </Typography>
      )}
      
      <Stack spacing={2}>
        {jobs.map((job) => (
          <JobCard
            key={job.id}
            job={job}
            isStarred={starredJobIds.includes(job.id)}
            onToggleStar={onToggleStar}
            onApply={onApply}
            onViewDetails={onViewDetails}
            showApplyButton={showApplyButton}
            showStarButton={showStarButton}
          />
        ))}
      </Stack>
    </Box>
  );
};

export default JobList;
