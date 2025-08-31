import { Box, Paper, Typography, Stack } from "@mui/material";
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
  salaryMin: z.number().min(0).optional(),
  salaryMax: z.number().min(0).optional(),
  description: z.string().min(10),
});

type FormValues = z.infer<typeof schema>;

export default function JobCreatePage() {
  const { control, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { title: "", company: "", location: "", salaryMin: undefined, salaryMax: undefined, description: "" },
  });
  const nav = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const onSubmit = async (data: FormValues) => {
    const payload = {
      ...data,
      salaryMin: data.salaryMin ?? undefined,
      salaryMax: data.salaryMax ?? undefined,
    };
    const job = await jobsService.create(payload);
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
            <SubmitButton disabled={formState.isSubmitting}>Create</SubmitButton>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}
