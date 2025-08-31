import { TextField } from '@mui/material';
import { Controller, Control } from 'react-hook-form';
export default function FormTextField({ name, control, label, type='text' }:{ name: string; control: Control<any>; label: string; type?: string; }){
  return <Controller name={name} control={control} render={({ field, fieldState })=>(
    <TextField {...field} type={type} label={label} error={!!fieldState.error} helperText={fieldState.error?.message} fullWidth />
  )} />;
}
