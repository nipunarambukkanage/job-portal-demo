import * as React from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Stack
} from "@mui/material";

export type UpdateProfileValues = {
  full_name?: string;
  headline?: string;
  about?: string;
};

type Props = {
  open: boolean;
  initial?: UpdateProfileValues;
  onClose: () => void;
  onSave: (values: UpdateProfileValues) => Promise<void> | void;
  saving?: boolean;
};

export default function UpdateProfileDialog({
  open, initial, onClose, onSave, saving
}: Props) {
  const [values, setValues] = React.useState<UpdateProfileValues>(initial ?? {});
  React.useEffect(() => setValues(initial ?? {}), [initial, open]);

  return (
    <Dialog open={open} onClose={saving ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Update your profile</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Full name"
            value={values.full_name ?? ""}
            onChange={(e) => setValues(v => ({ ...v, full_name: e.target.value }))}
          />
          <TextField
            label="Headline"
            value={values.headline ?? ""}
            onChange={(e) => setValues(v => ({ ...v, headline: e.target.value }))}
          />
          <TextField
            label="About"
            value={values.about ?? ""}
            onChange={(e) => setValues(v => ({ ...v, about: e.target.value }))}
            multiline minRows={3}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cancel</Button>
        <Button
          variant="contained"
          disabled={saving}
          onClick={() => onSave(values)}
        >
          {saving ? "Saving..." : "Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
