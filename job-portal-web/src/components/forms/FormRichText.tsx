import { TextField } from "@mui/material";
import { Controller } from "react-hook-form";
import type { Control } from "react-hook-form";

export default function FormRichText({
  name,
  control,
  label,
  minRows = 5,
}: {
  name: string;
  control: Control<any>;
  label: string;
  minRows?: number;
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          label={label}
          multiline
          minRows={minRows}
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
          fullWidth
        />
      )}
    />
  );
}
