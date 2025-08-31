import { TextField } from "@mui/material";
import { Controller } from "react-hook-form";
import type { Control } from "react-hook-form";

export default function FormNumber({
  name,
  control,
  label,
  min,
  max,
  step = 1,
}: {
  name: string;
  control: Control<any>;
  label: string;
  min?: number;
  max?: number;
  step?: number;
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          {...field}
          type="number"
          label={label}
          inputProps={{ min, max, step }}
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
          fullWidth
          onChange={(e) => {
            const v = e.target.value;
            field.onChange(v === "" ? undefined : Number(v));
          }}
        />
      )}
    />
  );
}
