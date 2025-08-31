import { Stack, Pagination as MPagination, Typography } from "@mui/material";

export default function Pagination({
  page,
  pageSize,
  total,
  onChange,
}: {
  page: number;
  pageSize: number;
  total: number;
  onChange: (page: number) => void;
}) {
  const pages = Math.max(1, Math.ceil(total / pageSize));
  return (
    <Stack direction="row" spacing={2} alignItems="center" justifyContent="flex-end" sx={{ mt: 2 }}>
      <Typography variant="body2" color="text.secondary">
        {total} total
      </Typography>
      <MPagination
        page={page}
        count={pages}
        onChange={(_, p) => onChange(p)}
        shape="rounded"
        variant="outlined"
        size="small"
      />
    </Stack>
  );
}
