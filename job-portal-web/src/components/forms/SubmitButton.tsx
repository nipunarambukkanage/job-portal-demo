import { Button } from '@mui/material';
export default function SubmitButton({ disabled, children }:{ disabled?: boolean; children: React.ReactNode }){
  return <Button type='submit' variant='contained' disabled={disabled}>{children}</Button>;
}
