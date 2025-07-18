// components/GlobalSnackbar.tsx
"use client";

import { Snackbar, Alert, AlertColor } from "@mui/material";

type GlobalSnackbarProps = {
  open: boolean;
  message: string;
  severity?: AlertColor;
  autoHideDuration?: number;
  onClose: () => void;
  anchorOrigin?: {
    vertical: "top" | "bottom";
    horizontal: "left" | "center" | "right";
  };
};

export default function GlobalSnackbar({
  open,
  message,
  severity = "info",
  autoHideDuration = 3000,
  onClose,
  anchorOrigin = { vertical: "top", horizontal: "center" },
}: GlobalSnackbarProps) {
  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={onClose}
      anchorOrigin={anchorOrigin}
    >
      <Alert onClose={onClose} severity={severity} sx={{ width: "100%" }}>
        {message}
      </Alert>
    </Snackbar>
  );
}
