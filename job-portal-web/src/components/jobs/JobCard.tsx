import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Button,
  Stack,
  Chip,
  Tooltip,
  Box,
} from '@mui/material';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import NewReleasesIcon from '@mui/icons-material/NewReleases';
import PlaceIcon from '@mui/icons-material/Place';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';

import type { Job } from '../../api/types/job';
import { getJobTags, formatSalary, calculatePopularityScore } from '../../utils/jobUtils';

interface JobCardProps {
  job: Job;
  isStarred?: boolean;
  onToggleStar?: (jobId: string) => void;
  onApply?: (jobId: string) => void;
  onViewDetails?: (jobId: string) => void;
  showApplyButton?: boolean;
  showStarButton?: boolean;
}

const JobCard: React.FC<JobCardProps> = ({
  job,
  isStarred = false,
  onToggleStar,
  onApply,
  onViewDetails,
  showApplyButton = true,
  showStarButton = true,
}) => {
  const tags = getJobTags(job);
  const popularityScore = calculatePopularityScore(job);

  const handleStarClick = () => {
    onToggleStar?.(job.id);
  };

  const handleApplyClick = () => {
    onApply?.(job.id);
  };

  const handleViewClick = () => {
    onViewDetails?.(job.id);
  };

  return (
    <Card variant="outlined" sx={{ overflow: 'hidden' }}>
      <CardContent>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          justifyContent="space-between"
          spacing={2}
          mb={1}
        >
          <Box>
            <Typography variant="h6" component="h3" gutterBottom>
              {job.title}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {job.company}
            </Typography>
          </Box>
          
          {showStarButton && (
            <Tooltip title={isStarred ? 'Remove from favorites' : 'Add to favorites'}>
              <IconButton
                size="small"
                onClick={handleStarClick}
                color={isStarred ? 'warning' : 'default'}
              >
                {isStarred ? <StarIcon /> : <StarBorderIcon />}
              </IconButton>
            </Tooltip>
          )}
        </Stack>

        {/* Job tags */}
        {tags.length > 0 && (
          <Stack direction="row" spacing={1} mb={2} flexWrap="wrap" gap={1}>
            {tags.map((tag) => (
              <Chip
                key={tag.key}
                label={tag.label}
                color={tag.color}
                size="small"
                variant={tag.variant}
                icon={tag.key === 'hot' ? <WhatshotIcon /> : 
                      tag.key === 'new' ? <NewReleasesIcon /> : undefined}
              />
            ))}
          </Stack>
        )}

        {/* Job details */}
        <Stack spacing={1} mb={2}>
          {job.location && (
            <Stack direction="row" alignItems="center" spacing={1}>
              <PlaceIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {job.location}
              </Typography>
            </Stack>
          )}
          
          {(job.salaryMin || job.salaryMax) && (
            <Stack direction="row" alignItems="center" spacing={1}>
              <MonetizationOnIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                {formatSalary(job.salaryMin, job.salaryMax)}
              </Typography>
            </Stack>
          )}
        </Stack>

        {job.description && (
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{
              display: '-webkit-box',
              WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {job.description}
          </Typography>
        )}

        {/* Popularity score */}
        <Box sx={{ mt: 2 }}>
          <Typography variant="caption" color="text.secondary">
            Popularity: {Math.round(popularityScore)}%
          </Typography>
        </Box>
      </CardContent>

      <CardActions sx={{ justifyContent: 'space-between', px: 2, pb: 2 }}>
        <Button size="small" onClick={handleViewClick} variant="outlined">
          View Details
        </Button>
        
        {showApplyButton && (
          <Button 
            size="small" 
            onClick={handleApplyClick}
            variant="contained"
            color="primary"
          >
            Apply
          </Button>
        )}
      </CardActions>
    </Card>
  );
};

export default JobCard;
