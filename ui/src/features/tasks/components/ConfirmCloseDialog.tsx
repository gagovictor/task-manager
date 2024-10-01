import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from '@mui/material';

interface ConfirmCloseDialogProps {
  open: boolean;
  title?: string;
  description?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmCloseDialog: React.FC<ConfirmCloseDialogProps> = ({
  open,
  title = 'Unsaved Changes',
  description = 'You have unsaved changes. Are you sure you want to close?',
  onConfirm,
  onCancel,
}) => {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      aria-labelledby="confirm-close-dialog-title"
      aria-describedby="confirm-close-dialog-description"
    >
      <DialogTitle id="confirm-close-dialog-title">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText id="confirm-close-dialog-description">
          {description}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} color="primary">
          Cancel
        </Button>
        <Button onClick={onConfirm} color="primary" autoFocus>
          Discard Changes
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ConfirmCloseDialog;
