import * as React from "react";
import { Box, Grid, Paper, Typography, Stack } from "@mui/material";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import FormTextField from "../../components/forms/FormTextField";
import FormNumber from "../../components/forms/FormNumber";
import FormRichText from "../../components/forms/FormRichText";
import SubmitButton from "../../components/forms/SubmitButton";
import { jobsService } from "../../api/services/jobs";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";

const schema = z.object({
  title: z.string().min(3),
  company: z.string().min(2),
  location: z.string().min(2),
  salaryMin: z.number().min(0).optional().nullable(),
  salaryMax: z.number().min(0).optional().nullable(),
  description: z.string().min(10),
});

type FormValues = z.infer<typeof schema>;

export default function JobCreatePage() {
  const { control, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", company: "", location: "", salaryMin: null, salaryMax: null, description: "" },
  });
  const nav = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const onSubmit = async (data: FormValues) => {
    const job = await jobsService.create(data);
    enqueueSnackbar("Job posted", { variant: "success" });
    nav("/jobs/" + job.id);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Post a Job
      </Typography>
      <Paper sx={{ p: 2 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormTextField name="title" control={control} label="Title" />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormTextField name="company" control={control} label="Company" />
            </Grid>
            <Grid item xs={12} md={6}>
              <FormTextField name="location" control={control} label="Location" />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormNumber name="salaryMin" control={control} label="Salary Min" />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormNumber name="salaryMax" control={control} label="Salary Max" />
            </Grid>
            <Grid item xs={12}>
              <FormRichText name="description" control={control} label="Description" />
            </Grid>
          </Grid>
          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
            <SubmitButton disabled={formState.isSubmitting}>Create</SubmitButton>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}
