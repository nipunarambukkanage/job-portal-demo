import { Box, Paper, Typography, Stack, MenuItem, Autocomplete, TextField } from '@mui/material';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import FormTextField from '../../components/forms/FormTextField';
import FormNumber from '../../components/forms/FormNumber';
import FormRichText from '../../components/forms/FormRichText';
import SubmitButton from '../../components/forms/SubmitButton';
import { jobsService } from '../../api/services/jobs';
import { locationService } from '../../api/services/location/locationService';
import { useNavigate } from 'react-router-dom';
import { useSnackbar } from 'notistack';
import { useState, useEffect } from 'react';

const schema = z.object({
  title: z.string().min(3),
  organizationId: z.string().uuid(),
  location: z.string().min(2),
  salaryMin: z.number().min(0).optional(),
  salaryMax: z.number().min(0).optional(),
  employmentType: z.string().min(1, 'Employment type is required'),
  description: z.string().min(10),
});

type FormValues = z.infer<typeof schema>;

// Hardcoded organization ID as requested
const DUMMY_ORGANIZATION_ID = '00000000-0000-0000-0000-000000000000';

// Employment type options
const EMPLOYMENT_TYPES = [
  { value: 'full-time', label: 'Full Time' },
  { value: 'part-time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'internship', label: 'Internship' },
];

export default function JobCreatePage() {
  const { control, handleSubmit, formState, setValue } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      organizationId: DUMMY_ORGANIZATION_ID,
      location: '',
      salaryMin: undefined,
      salaryMax: undefined,
      employmentType: '',
      description: '',
    },
  });

  const [locationOptions, setLocationOptions] = useState<string[]>([]);
  const [locationInput, setLocationInput] = useState('');
  const [loadingLocations, setLoadingLocations] = useState(false);

  const nav = useNavigate();
  const { enqueueSnackbar } = useSnackbar();

  // Fetch location suggestions when user types
  useEffect(() => {
    const fetchLocations = async () => {
      if (locationInput.length < 3) {
        setLocationOptions([]);
        return;
      }

      setLoadingLocations(true);
      try {
        const suggestions = await locationService.getLocationSuggestions(locationInput);
        setLocationOptions(suggestions);
      } catch (error) {
        console.error('Failed to fetch location suggestions:', error);
        enqueueSnackbar('Failed to load location suggestions', { variant: 'error' });
      } finally {
        setLoadingLocations(false);
      }
    };

    const debounceTimer = setTimeout(fetchLocations, 500);
    return () => clearTimeout(debounceTimer);
  }, [locationInput, enqueueSnackbar]);

  const onSubmit = async (data: FormValues) => {
    const payload = {
      ...data,
      salaryMin: data.salaryMin ?? undefined,
      salaryMax: data.salaryMax ?? undefined,
    };

    try {
      const job = await jobsService.create(payload);
      enqueueSnackbar('Job posted', { variant: 'success' });
      nav('/jobs/' + job.id);
    } catch (error) {
      enqueueSnackbar('Failed to create job', { variant: 'error' });
    }
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
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' },
              gap: 2,
            }}
          >
            <FormTextField name="title" control={control} label="Title" />

            <Controller
              name="employmentType"
              control={control}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  select
                  label="Employment Type"
                  error={!!fieldState.error}
                  helperText={fieldState.error?.message}
                  fullWidth
                >
                  {EMPLOYMENT_TYPES.map((option) => (
                    <MenuItem key={option.value} value={option.value}>
                      {option.label}
                    </MenuItem>
                  ))}
                </TextField>
              )}
            />

            <Controller
              name="location"
              control={control}
              render={({ field, fieldState }) => (
                <Autocomplete
                  freeSolo
                  options={locationOptions}
                  loading={loadingLocations}
                  inputValue={locationInput}
                  onInputChange={(_, value) => setLocationInput(value)}
                  onChange={(_, value) => {
                    field.onChange(value || '');
                    setValue('location', value || '', { shouldValidate: true });
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Location"
                      error={!!fieldState.error}
                      helperText={fieldState.error?.message}
                      onChange={field.onChange}
                    />
                  )}
                />
              )}
            />

            <FormNumber name="salaryMin" control={control} label="Minimum Salary (LKR)" />
            <FormNumber name="salaryMax" control={control} label="Maximum Salary (LKR)" />

            <Box sx={{ gridColumn: '1 / -1' }}>
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
