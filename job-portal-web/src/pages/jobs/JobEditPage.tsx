import * as React from "react";
import { Box, Paper, Typography, Stack } from "@mui/material";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import FormTextField from "../../components/forms/FormTextField";
import FormNumber from "../../components/forms/FormNumber";
import FormRichText from "../../components/forms/FormRichText";
import SubmitButton from "../../components/forms/SubmitButton";
import { jobsService } from "../../api/services/jobs";
import { useNavigate, useParams } from "react-router-dom";
import Spinner from "../../components/feedback/Spinner";
import { useSnackbar } from "notistack";

const schema = z.object({
  title: z.string().min(3),
  company: z.string().min(2),
  location: z.string().min(2),
  salaryMin: z.number().min(0).optional(),
  salaryMax: z.number().min(0).optional(),
  description: z.string().min(10),
});

type FormValues = z.infer<typeof schema>;

export default function JobEditPage() {
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
        const j = await jobsService.detail(id);
        reset({
          title: j.title,
          company: j.company,
          location: j.location,
          salaryMin: (j as any).salaryMin ?? undefined,
          salaryMax: (j as any).salaryMax ?? undefined,
          description: j.description ?? "",
        });
      } finally {
        setLoading(false);
      }
    })();
  }, [id, reset]);

  const onSubmit = async (data: FormValues) => {
    if (!id) return;
    const payload = {
      ...data,
      salaryMin: data.salaryMin ?? undefined,
      salaryMax: data.salaryMax ?? undefined,
    };
    await jobsService.update(id, payload);
    enqueueSnackbar("Job updated", { variant: "success" });
    nav("/jobs/" + id);
  };

  if (loading) return <Spinner />;

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        Edit Job
      </Typography>
      <Paper sx={{ p: 2 }}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" },
              gap: 2,
            }}
          >
            <FormTextField name="title" control={control} label="Title" />
            <FormTextField name="company" control={control} label="Company" />
            <FormTextField name="location" control={control} label="Location" />
            <FormNumber name="salaryMin" control={control} label="Salary Min" />
            <FormNumber name="salaryMax" control={control} label="Salary Max" />
            <Box sx={{ gridColumn: "1 / -1" }}>
              <FormRichText name="description" control={control} label="Description" />
            </Box>
          </Box>

          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
            <SubmitButton disabled={formState.isSubmitting}>Save</SubmitButton>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}
