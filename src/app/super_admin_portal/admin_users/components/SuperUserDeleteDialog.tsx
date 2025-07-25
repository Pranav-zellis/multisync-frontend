"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  TextField,
  Box,
} from "@mui/material";
import { useState } from "react";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  username: string;
}

export default function SuperUserDeleteDialog({
  open,
  onClose,
  onConfirm,
  username,
}: Props) {
  const [confirmation, setConfirmation] = useState("");

  const isMatch = confirmation.trim() === username;

  const handleClose = () => {
    setConfirmation("");
    onClose();
  };

  const handleConfirm = () => {
    setConfirmation("");
    onConfirm();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        sx: {
          width: 500, // your custom width in px
          maxWidth: "100%", // ensures responsive on small screens
        },
      }}
    >
      <DialogTitle>Delete Super Admin</DialogTitle>
      <DialogContent>
        <Typography sx={{ mb: 2 }}>
          This is a destructive process. Upon confirming, 
          <strong> {username}</strong> super admin will be deleted forever.
          <br />
          <br />
          Please type <strong>{username}</strong> in the input below to confirm.
        </Typography>
        <TextField
          autoFocus
          fullWidth
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          placeholder={`Enter "${username}" to confirm`}
          variant="outlined"
        />
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Box display="flex" gap={1} width="100%" justifyContent="flex-end">
          <Button
            onClick={handleClose}
            variant="outlined"
            color="inherit"
            fullWidth
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirm}
            color="error"
            variant="contained"
            disabled={!isMatch}
            fullWidth
          >
            Confirm Delete
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
}
