import * as React from "react";
import { TextField, MenuItem } from "@mui/material";
import { Controller } from "react-hook-form";
import type { Control } from "react-hook-form";

export type Option = { label: React.ReactNode; value: string | number };

export default function FormSelect({
  name,
  control,
  label,
  options,
}: {
  name: string;
  control: Control<any>;
  label: string;
  options: Option[];
}) {
  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => (
        <TextField
          select
          label={label}
          {...field}
          error={!!fieldState.error}
          helperText={fieldState.error?.message}
          fullWidth
        >
          {options.map((o) => (
            <MenuItem value={o.value} key={String(o.value)}>
              {o.label}
            </MenuItem>
          ))}
        </TextField>
      )}
    />
  );
}
