import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';

const CODE_LENGTH = 6;

export type VerifyPhoneDialogProps = {
  open: boolean;
  onSubmit: (code: string) => void;
  onClose: () => void;
};

export const VerifyPhoneDialog = ({ open, onSubmit, onClose }: VerifyPhoneDialogProps) => {
  const [codeValue, setCodeValue] = React.useState<string>('');
  const handleClose = () => onClose();
  const handleValueChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setCodeValue(newValue);
  };

  const handleSubmit = () => {
    if (codeValue) onSubmit(codeValue);
  };

  const isSubmitDisabled = !codeValue || codeValue.length !== CODE_LENGTH;

  return (
    <Dialog open={open} onClose={handleClose}>
      <DialogTitle>Verify Phone Number</DialogTitle>
      <DialogContent>
        <DialogContentText>Please enter the {CODE_LENGTH}-digit code sent to your phone number </DialogContentText>
        <TextField
          autoFocus
          margin="dense"
          size="medium"
          id="verification-code"
          label="Verification Code"
          type="tel"
          inputProps={{ inputMode: 'numeric', pattern: `[0-9]{${CODE_LENGTH}}`, maxLength: CODE_LENGTH }}
          variant="standard"
          value={codeValue}
          onChange={handleValueChange}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button onClick={handleSubmit} disabled={isSubmitDisabled}>
          Verify
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default React.memo(VerifyPhoneDialog);
