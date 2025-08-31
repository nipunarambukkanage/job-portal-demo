import * as React from "react";
import { Box, Grid, Paper, Typography, Stack } from "@mui/material";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import FormTextField from "../../components/forms/FormTextField";
import SubmitButton from "../../components/forms/SubmitButton";
import { orgsService } from "../../api/services/orgs";
import { useNavigate, useParams } from "react-router-dom";
import Spinner from "../../components/feedback/Spinner";
import { useSnackbar } from "notistack";

const schema = z.object({
  name: z.string().min(2),
  website: z.string().url().optional().or(z.literal("").transform(() => undefined)),
});

type FormValues = z.infer<typeof schema>;

export default function OrgEditPage() {
  const { id } = useParams();
  const nav = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = React.useState(true);

  const { control, handleSubmit, formState, reset } = useForm<FormValues>({
    resolver: zodResolver(schema),
  });

  React.useEffect(() => {
    (async () => {
      if (!id) return;
      try {
        const o = await orgsService.detail(id);
        reset({ name: o.name, website: o.website || "" });
      } finally {
        setLoading(false);
      }
    })();
  }, [id, reset]);

  const onSubmit = async (data: FormValues) => {
    if (!id) return;
    await orgsService.update(id, data);
    enqueueSnackbar("Organization updated", { variant: "success" });
    nav("/orgs/" + id);
  };

  if (loading) return <Spinner />;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Edit Organization
      </Typography>
      <Paper sx={{ p: 2 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormTextField name="name" control={control} label="Name" />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormTextField name="website" control={control} label="Website (https://…)" />
            </Grid>
          </Grid>
          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
            <SubmitButton disabled={formState.isSubmitting}>Save</SubmitButton>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}
