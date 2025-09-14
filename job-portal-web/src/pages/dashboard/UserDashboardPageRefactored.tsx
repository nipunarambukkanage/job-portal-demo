import React from 'react';
import { Box, Paper, Typography, Alert, Button } from '@mui/material';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import { useAsyncState } from '../../hooks';
import { Spinner } from '../../components/feedback';

// Demo data hook
const useDashboardData = () => {
  const { data, loading, error, execute } = useAsyncState<{
    stats: { applications: number; interviews: number; offers: number; views: number };
    recentActivity: Array<{ type: string; message: string; timestamp: string }>;
  }>();

  React.useEffect(() => {
    execute(async () => {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return {
        stats: {
          applications: 12,
          interviews: 3,
          offers: 1,
          views: 245,
        },
        recentActivity: [
          { type: 'application', message: 'Applied to Software Engineer at TechCorp', timestamp: '2 hours ago' },
          { type: 'view', message: 'Profile viewed by HR Manager', timestamp: '1 day ago' },
          { type: 'interview', message: 'Interview scheduled with StartupXYZ', timestamp: '3 days ago' },
        ],
      };
    });
  }, [execute]);

  return { data, loading, error, refetch: () => execute };
};

const StatCard: React.FC<{ 
  title: string; 
  value: number; 
  description?: string 
}> = ({ title, value, description }) => (
  <Paper sx={{ p: 2, textAlign: 'center' }}>
    <Typography variant="h4" color="primary" gutterBottom>
      {value}
    </Typography>
    <Typography variant="h6" gutterBottom>
      {title}
    </Typography>
    {description && (
      <Typography variant="body2" color="text.secondary">
        {description}
      </Typography>
    )}
  </Paper>
);

const UserDashboardPageRefactored: React.FC = () => {
  const { data, loading, error, refetch } = useDashboardData();

  if (loading) return <Spinner />;
  
  if (error) {
    return (
      <Alert severity="error" action={
        <Button color="inherit" onClick={refetch}>Retry</Button>
      }>
        Failed to load dashboard data
      </Alert>
    );
  }

  if (!data) return null;

  return (
    <Box sx={{ display: 'grid', gap: 3, p: 2 }}>
      {/* Banner */}
      <Alert
        icon={<NotificationsActiveIcon />}
        severity="info"
        action={<Button color="inherit" onClick={refetch}>Refresh</Button>}
      >
        Welcome to your dashboard! Here's your latest activity and statistics.
      </Alert>

      {/* Stats Grid */}
      <Box sx={{ 
        display: 'grid', 
        gap: 2,
        gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }
      }}>
        <StatCard 
          title="Applications" 
          value={data.stats.applications}
          description="Total submitted"
        />
        <StatCard 
          title="Interviews" 
          value={data.stats.interviews}
          description="Scheduled"
        />
        <StatCard 
          title="Offers" 
          value={data.stats.offers}
          description="Received"
        />
        <StatCard 
          title="Profile Views" 
          value={data.stats.views}
          description="This month"
        />
      </Box>

      {/* Recent Activity */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Recent Activity
        </Typography>
        <Box sx={{ display: 'grid', gap: 1 }}>
          {data.recentActivity.map((activity, index) => (
            <Box 
              key={index}
              sx={{ 
                p: 1, 
                bgcolor: 'background.default',
                borderRadius: 1,
                border: '1px solid',
                borderColor: 'divider'
              }}
            >
              <Typography variant="body2">
                {activity.message}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {activity.timestamp}
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
};

export default UserDashboardPageRefactored;
