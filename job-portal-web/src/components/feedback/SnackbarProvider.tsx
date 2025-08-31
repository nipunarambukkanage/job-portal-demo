import { SnackbarProvider as NSP } from 'notistack';
export default function SnackbarProvider({ children }: { children: React.ReactNode }) {
  return <NSP maxSnack={3} autoHideDuration={3500} anchorOrigin={{ vertical:'bottom', horizontal:'right' }}>{children}</NSP>;
}
