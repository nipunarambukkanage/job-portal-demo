import * as React from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import { applicationsService } from '../../api/services/applications';
import Spinner from '../../components/feedback/Spinner';
import { Box, Paper, Stack, Typography, Button, Chip } from '@mui/material';
import { statusColor, statusText } from '../../api/types/application';
import { HorizontalSplit } from '@mui/icons-material';

export default function ApplicationDetailPage() {
  const { id } = useParams();
  const [app, setApp] = React.useState<any>();
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    (async () => {
      if (!id) return;
      try {
        setApp(await applicationsService.detail(id));
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  if (loading) return <Spinner />;
  if (!app) return null;

  console.log('app***************************:', app);
  //   candidateId
  // :
  // "8e80c70e-d33b-4066-8d31-291e218fcd4e"
  // coverLetter
  // :
  // null
  // createdAtUtc
  // :
  // "2025-09-07T20:49:44.154102Z"
  // id
  // :
  // "6167a692-0757-45f8-b58e-2156b4452d71"
  // job
  // :
  // company
  // :
  // "Nipuna Rambukkanage (Pvt) Ltd"
  // id
  // :
  // "e8787b85-61f3-455b-a646-ac45e44b2596"
  // location
  // :
  // "Dehiwala, Colombo District, Western Province, 10350, Sri Lanka"
  // title
  // :
  // "Software Engineer"
  // [[Prototype]]
  // :
  // Object
  // jobId
  // :
  // "e8787b85-61f3-455b-a646-ac45e44b2596"
  // resumeUrl
  // :
  // "https://jobportal971778.blob.core.windows.net/resumes/2025/09/9f11cadc-5715-48c8-ad53-b284daab16d9_Dilki_Hanshini_-_CV.pdf"
  // status
  // :
  // 0
  // updatedAtUtc
  // :
  // "2025-09-07T20:49:44.154103Z"

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="h5">Application Details</Typography>
      </Stack>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
        <Typography variant="subtitle1">(ID: {app.id})</Typography>
      </Stack>
      <Stack direction="row" justifyContent="space-between" sx={{ mb: 2 }}>
        <Button
          disabled
          component={RouterLink}
          to={`/applications/${app.id}/status`}
          variant="outlined"
        >
          Update Status
        </Button>
      </Stack>
      <Paper sx={{ p: 2 }}>
        <Typography>
          <strong>Job Title:</strong> {app.job?.title}
        </Typography>
        <Typography>
          <strong>Company:</strong> {app.job?.company}
        </Typography>
        <Typography>
          <strong>Location:</strong> {app.job?.location}
        </Typography>
        <Typography sx={{ mt: 1 }}>
          <strong>Status:</strong>
        </Typography>
        <Chip
          size="small"
          label={statusText(app.status)}
          color={statusColor(app.status)}
          variant="outlined"
        />
        <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
          <Button component={RouterLink} to="/applications" variant="outlined">
            Back
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
