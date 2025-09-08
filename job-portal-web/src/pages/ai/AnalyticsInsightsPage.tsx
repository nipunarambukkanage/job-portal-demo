import * as React from "react";
import {
  Box,
  Paper,
  Stack,
  TextField,
  Typography,
  Autocomplete,
} from "@mui/material";
import AreaChart from "../../components/charts/AreaChart";
import {
  getAiAnalytics,
  type AnalyticsSeries,
} from "../../api/services/python/analytics";
import { getUserByEmail, listUsers, type PyUserForAnalytics } from "../../api/services/python/users";
import { jobsService } from "../../api/services/jobs";
import type { Job } from "../../api/types/job";
import { useUser } from "@clerk/clerk-react";

function toApex(series: AnalyticsSeries[]) {
  const categoriesSet = new Set<string>();
  series.forEach((s) => s.data.forEach((p) => categoriesSet.add(String(p.x))));
  const categories = Array.from(categoriesSet);
  const apexSeries = series.map((s) => ({
    name: s.name,
    data: categories.map((c) => s.data.find((p) => String(p.x) === c)?.y ?? 0),
  }));
  return { categories, series: apexSeries };
}

export default function AnalyticsInsightsPage() {
  const { isSignedIn, user } = useUser();

  const [from, setFrom] = React.useState<string>("");
  const [to, setTo] = React.useState<string>("");

  const [role, setRole] = React.useState<"org:member" | "org:admin" | null>(null);
  const [selfUserId, setSelfUserId] = React.useState<string | null>(null);

  // Admin filters
  const [users, setUsers] = React.useState<PyUserForAnalytics[]>([]);
  const [jobs, setJobs] = React.useState<Job[]>([]);
  const [selectedUser, setSelectedUser] = React.useState<PyUserForAnalytics | null>(null);
  const [selectedJob, setSelectedJob] = React.useState<Job | null>(null);

  const [chart, setChart] = React.useState<{
    categories: string[];
    series: { name: string; data: number[] }[];
  }>();

  // Resolve current python user + role
  React.useEffect(() => {
    (async () => {
      if (!isSignedIn || !user) return;
      const email =
        user.primaryEmailAddress?.emailAddress ||
        user.emailAddresses?.[0]?.emailAddress;
      if (!email) return;

      try {
        const py = await getUserByEmail(email);
        setSelfUserId(py?.id ?? null);
        setRole((py?.role as any) ?? "org:member");
      } catch {
        setSelfUserId(null);
        setRole("org:member");
      }
    })();
  }, [isSignedIn, user]);

  // Load admin dropdown data when role is admin
  React.useEffect(() => {
    (async () => {
      if (role !== "org:admin") return;

      try {
        const [allUsers, jobsPage] = await Promise.all([
          listUsers(200, 0),
          jobsService.list({ page: 1, pageSize: 200 }),
        ]);
        setUsers(allUsers);
        setJobs(jobsPage.items ?? []);
      } catch {
        setUsers([]);
        setJobs([]);
      }
    })();
  }, [role]);

  const load = React.useCallback(async () => {
    const params: any = {};
    if (from) params.from = from;
    if (to) params.to = to;

    // For members -> lock to their own id
    if (role === "org:member" && selfUserId) {
      params.user_id = selfUserId;
    }

    // For admins -> optional filters
    if (role === "org:admin") {
      if (selectedUser?.id) params.user_id = selectedUser.id;
      if (selectedJob?.id) params.job_id = selectedJob.id;
    }

    const res = await getAiAnalytics(params);
    setChart(toApex(res));
  }, [from, to, role, selfUserId, selectedUser, selectedJob]);

  React.useEffect(() => {
    if (!role) return;
    load();
  }, [role, load]);

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Analytics
      </Typography>

      <Paper sx={{ p: 2, mb: 2 }}>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            type="date"
            label="From"
            InputLabelProps={{ shrink: true }}
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
          <TextField
            type="date"
            label="To"
            InputLabelProps={{ shrink: true }}
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />

          {role === "org:admin" && (
            <>
              <Autocomplete
                options={users}
                getOptionLabel={(u) =>
                  u.full_name?.trim() ||
                  u.email ||
                  u.id
                }
                value={selectedUser}
                onChange={(_, val) => setSelectedUser(val)}
                renderInput={(params) => (
                  <TextField {...params} label="User (candidate)" />
                )}
                sx={{ minWidth: 260 }}
              />

              <Autocomplete
                options={jobs}
                getOptionLabel={(j) => j.title}
                value={selectedJob}
                onChange={(_, val) => setSelectedJob(val)}
                renderInput={(params) => (
                  <TextField {...params} label="Job" />
                )}
                sx={{ minWidth: 260 }}
              />
            </>
          )}
        </Stack>
      </Paper>

      {chart && (
        <Box sx={{ display: "grid", gridTemplateColumns: "1fr", gap: 2 }}>
          <Paper sx={{ p: 2 }}>
            <AreaChart series={chart.series} categories={chart.categories} />
          </Paper>
        </Box>
      )}
    </Box>
  );
}
