"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";

interface SessionDialogProps {
  open: boolean;
  onRelogin: () => void;
}

export default function SessionDialog({ open, onRelogin }: SessionDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={(event, reason) => {
        // Prevent close on backdrop click or escape key
        if (reason === "backdropClick" || reason === "escapeKeyDown") {
          return;
        }
      }}
    >
      <DialogTitle>Session Expired</DialogTitle>
      <DialogContent>
        Your session has expired. Please log in again.
      </DialogContent>
      <DialogActions>
        <Button onClick={onRelogin} color="primary" autoFocus>
          Re-login
        </Button>
      </DialogActions>
    </Dialog>
  );
}
