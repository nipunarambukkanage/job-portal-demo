import { Box, Paper, Typography, Stack } from "@mui/material";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import FormTextField from "../../components/forms/FormTextField";
import SubmitButton from "../../components/forms/SubmitButton";
import { orgsService } from "../../api/services/orgs";
import { useNavigate } from "react-router-dom";
import { useSnackbar } from "notistack";

const schema = z.object({
  name: z.string().min(2),
  website: z.string().url().optional().or(z.literal("").transform(() => undefined)),
});

type FormValues = z.infer<typeof schema>;

export default function OrgCreatePage() {
  const { control, handleSubmit, formState } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", website: "" },
  });
  const nav = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  const onSubmit = async (data: FormValues) => {
    const org = await orgsService.create(data);
    enqueueSnackbar("Organization created", { variant: "success" });
    nav("/orgs/" + org.id);
  };

  return (
    <Box>
      <Typography variant="h5" gutterBottom>
        New Organization
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
            <FormTextField name="name" control={control} label="Name" />
            <FormTextField name="website" control={control} label="Website (https://…)" />
          </Box>
          <Stack direction="row" justifyContent="flex-end" sx={{ mt: 2 }}>
            <SubmitButton disabled={formState.isSubmitting}>Create</SubmitButton>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}
