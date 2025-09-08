import * as React from 'react';
import {
  Alert,
  Avatar,
  Box,
  Card,
  CardContent,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Stack,
  Typography,
  Chip,
  Button,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import TimelineIcon from '@mui/icons-material/Timeline';
import AssessmentIcon from '@mui/icons-material/Assessment';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import ReactApexChart from 'react-apexcharts';
import Spinner from '../../components/feedback/Spinner';

// ------- Dummy data (no backend calls) -------
const MONTHS = ['Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];

const useDummyData = () => {
  return React.useMemo(() => {
    const stats = {
      applications: 24,
      interviews: 5,
      offers: 2,
      views: 320,
      profileScore: 78,
      resumeScore: 84,
    };

    const applicationsOverTime = {
      categories: MONTHS,
      series: [
        { name: 'Applications', data: [3, 4, 2, 6, 5, 4] },
        { name: 'Shortlisted', data: [1, 2, 1, 3, 3, 2] },
      ],
    };

    const statusBreakdown = {
      labels: ['Submitted', 'Interview', 'Offered', 'Rejected'],
      series: [12, 5, 2, 7],
    };

    const sparkA = [8, 10, 7, 12, 9, 14, 12, 16, 13, 18];
    const sparkB = [3, 4, 2, 6, 5, 4, 7, 5, 6, 8];
    const sparkC = [1, 2, 3, 1, 3, 2, 4, 3, 2, 5];
    const sparkD = [40, 28, 35, 30, 45, 38, 50, 42, 48, 52];

    const recentActivity = [
      { title: 'Applied to Senior Full-Stack Developer @ Vercel', time: '2h ago' },
      { title: 'Recruiter viewed your profile', time: '5h ago' },
      { title: 'Interview scheduled: Backend Engineer @ Shopify', time: 'Yesterday' },
      { title: 'Application moved to Shortlist: Data Engineer @ Snowflake', time: '2 days ago' },
    ];

    const upcoming = [
      { title: 'Tech Interview — Backend Engineer @ Shopify', time: 'Sep 10, 10:30 AM' },
      { title: 'HR Screening — Platform Eng @ GitHub', time: 'Sep 12, 3:00 PM' },
    ];

    return {
      stats,
      applicationsOverTime,
      statusBreakdown,
      sparks: { sparkA, sparkB, sparkC, sparkD },
      recentActivity,
      upcoming,
    };
  }, []);
};

// ------- Charts configs -------
const sparkOptions = (name: string) =>
  ({
    chart: { type: 'area', height: 80, sparkline: { enabled: true } },
    stroke: { curve: 'smooth', width: 2 },
    fill: { opacity: 0.25 },
    tooltip: { enabled: true, x: { show: false }, y: { title: { formatter: () => name } } },
  }) as any;

const areaOptions = (categories: string[]) =>
  ({
    chart: { type: 'area', toolbar: { show: false } },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 3 },
    xaxis: { categories },
    yaxis: { labels: { formatter: (v: number) => Math.round(v).toString() } },
    legend: { position: 'top' },
    tooltip: { shared: true, intersect: false },
  }) as any;

const donutOptions = (labels: string[]) =>
  ({
    chart: { type: 'donut' },
    labels,
    legend: { position: 'bottom' },
    tooltip: { y: { formatter: (v: number) => `${v}` } },
    plotOptions: {
      pie: {
        donut: {
          size: '70%',
          labels: { show: true, total: { show: true, label: 'Total' } },
        },
      },
    },
  }) as any;

const radialOptions = (labels: string[]) =>
  ({
    chart: { type: 'radialBar' },
    plotOptions: {
      radialBar: {
        hollow: { size: '55%' },
        dataLabels: { name: { fontSize: '14px' }, value: { fontSize: '18px' } },
      },
    },
    labels,
  }) as any;

// ------- Stat Card -------
function StatCard({
  icon,
  label,
  value,
  spark,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  spark: number[];
}) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={2}>
          <Stack spacing={0.5}>
            <Typography variant="overline" color="text.secondary">
              {label}
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {value}
            </Typography>
          </Stack>
          <Avatar variant="rounded" sx={{ width: 44, height: 44 }}>
            {icon}
          </Avatar>
        </Stack>
        <Box mt={1}>
          <ReactApexChart
            type="area"
            height={80}
            series={[{ name: label, data: spark }]}
            options={sparkOptions(label)}
          />
        </Box>
      </CardContent>
    </Card>
  );
}

// ------- Main Component -------
export default function UserDashboardPage() {
  const [loading, setLoading] = React.useState(true);
  const { stats, applicationsOverTime, statusBreakdown, sparks, recentActivity, upcoming } =
    useDummyData();

  React.useEffect(() => {
    const t = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(t);
  }, []);

  if (loading) return <Spinner />;

  return (
    <Box sx={{ display: 'grid', gap: 2 }}>
      {/* Top banner */}
      <Alert
        icon={<NotificationsActiveIcon />}
        severity="info"
        sx={{ borderRadius: 2 }}
        action={
          <Button size="small" color="inherit" onClick={() => window.location.reload()}>
            Refresh
          </Button>
        }
      >
        Some features are still under development. This dashboard is for demonstration
        purposes only.
      </Alert>

      {/* Quick stats (4 cards) */}
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
        }}
      >
        <StatCard
          icon={<WorkOutlineIcon />}
          label="Applications"
          value={stats.applications}
          spark={sparks.sparkA}
        />
        <StatCard
          icon={<EventAvailableIcon />}
          label="Interviews"
          value={stats.interviews}
          spark={sparks.sparkB}
        />
        <StatCard
          icon={<LocalOfferIcon />}
          label="Offers"
          value={stats.offers}
          spark={sparks.sparkC}
        />
        <StatCard
          icon={<TrendingUpIcon />}
          label="Profile Views"
          value={stats.views}
          spark={sparks.sparkD}
        />
      </Box>

      {/* Charts row: area (left) + donut (right) */}
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', lg: '2fr 1fr' },
          alignItems: 'stretch',
        }}
      >
        <Paper sx={{ p: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1} mb={1}>
            <TimelineIcon fontSize="small" />
            <Typography variant="h6">Applications Over Time</Typography>
            <Chip size="small" label="Last 6 months" sx={{ ml: 'auto' }} />
          </Stack>
          <ReactApexChart
            type="area"
            height={320}
            series={applicationsOverTime.series}
            options={areaOptions(applicationsOverTime.categories)}
          />
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1} mb={1}>
            <AssessmentIcon fontSize="small" />
            <Typography variant="h6">Status Breakdown</Typography>
          </Stack>
          <ReactApexChart
            type="donut"
            height={320}
            series={statusBreakdown.series}
            options={donutOptions(statusBreakdown.labels)}
          />
        </Paper>
      </Box>

      {/* Scores + Activity (3 cards) */}
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
          alignItems: 'stretch',
        }}
      >
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Profile & Resume Scores
          </Typography>
          <ReactApexChart
            type="radialBar"
            height={320}
            series={[stats.profileScore, stats.resumeScore]}
            options={radialOptions(['Profile', 'Resume'])}
          />
          <Divider sx={{ my: 2 }} />
          <Stack direction="row" spacing={2} justifyContent="space-between">
            <Stack>
              <Typography variant="body2" color="text.secondary">
                Profile completeness
              </Typography>
              <Typography variant="h6">{stats.profileScore}%</Typography>
            </Stack>
            <Stack>
              <Typography variant="body2" color="text.secondary">
                Resume score
              </Typography>
              <Typography variant="h6">{stats.resumeScore}%</Typography>
            </Stack>
          </Stack>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Recent Activity
          </Typography>
          <List dense>
            {recentActivity.map((a, idx) => (
              <ListItem key={idx} disableGutters sx={{ py: 1 }}>
                <ListItemAvatar>
                  <Avatar sx={{ width: 36, height: 36 }}>
                    <TrendingUpIcon fontSize="small" />
                  </Avatar>
                </ListItemAvatar>
                <ListItemText
                  primaryTypographyProps={{ variant: 'body1' }}
                  secondaryTypographyProps={{ variant: 'caption', color: 'text.secondary' }}
                  primary={a.title}
                  secondary={a.time}
                />
              </ListItem>
            ))}
          </List>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Stack direction="row" alignItems="center" spacing={1} mb={1}>
            <EventAvailableIcon fontSize="small" />
            <Typography variant="h6">Upcoming Interviews</Typography>
          </Stack>
          {upcoming.length ? (
            <List dense>
              {upcoming.map((u, i) => (
                <ListItem key={i} disableGutters sx={{ py: 1 }}>
                  <ListItemAvatar>
                    <Avatar sx={{ width: 36, height: 36 }}>
                      <EventAvailableIcon fontSize="small" />
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText primary={u.title} secondary={u.time} />
                </ListItem>
              ))}
            </List>
          ) : (
            <Stack alignItems="center" justifyContent="center" sx={{ py: 4 }}>
              <Typography variant="body2" color="text.secondary">
                No interviews scheduled yet.
              </Typography>
              <Button size="small" sx={{ mt: 1 }}>
                Add Reminder
              </Button>
            </Stack>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
