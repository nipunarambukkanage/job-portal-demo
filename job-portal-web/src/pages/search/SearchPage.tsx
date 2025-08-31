import * as React from "react";
import { Box, Stack, TextField, Button, Typography, Paper } from "@mui/material";
import { useAppDispatch, useAppSelector } from "../../store/hooks";
import { searchJobs, setQuery, clear } from "../../store/slices/searchSlice";
import { Link as RouterLink } from "react-router-dom";

export default function SearchPage() {
  const dispatch = useAppDispatch();
  const { query, results, total, status } = useAppSelector((s) => s.search);
  const [local, setLocal] = React.useState(query);

  const onSearch = () => {
    dispatch(setQuery(local));
    dispatch(searchJobs({ q: local, page: 1, pageSize: 20 }));
  };

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2 }}>
        Search Jobs
      </Typography>
      <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ mb: 2 }}>
        <TextField
          value={local}
          onChange={(e) => setLocal(e.target.value)}
          placeholder="Search by title, company, location…"
          size="small"
          fullWidth
        />
        <Button variant="contained" onClick={onSearch}>
          Search
        </Button>
        <Button
          onClick={() => {
            setLocal("");
            dispatch(clear());
          }}
        >
          Clear
        </Button>
      </Stack>

      {status === "loading" && <Typography>Searching…</Typography>}
      {status !== "loading" && total > 0 && (
        <Typography color="text.secondary" sx={{ mb: 1 }}>
          {total} result{total === 1 ? "" : "s"}
        </Typography>
      )}

      <Stack spacing={1}>
        {results.map((r) => (
          <Paper key={r.id} sx={{ p: 2 }}>
            <Typography variant="subtitle1" fontWeight={700}>
              {r.title}
            </Typography>
            <Typography color="text.secondary">
              {r.company || "—"} • {r.location || "—"}
            </Typography>
            <Button component={RouterLink} to={`/jobs/${r.id}`} size="small" sx={{ mt: 1 }}>
              View
            </Button>
          </Paper>
        ))}
      </Stack>
    </Box>
  );
}
