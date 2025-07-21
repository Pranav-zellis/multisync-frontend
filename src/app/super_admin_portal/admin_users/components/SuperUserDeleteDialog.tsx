"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  username: string | null;
}

export default function SuperUserDeleteDialog({
  open,
  onClose,
  onConfirm,
  username,
}: Props) {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Delete Super Admin</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to delete user{" "}
          <strong>{username}</strong>?
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button color="error" onClick={onConfirm}>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );
}
