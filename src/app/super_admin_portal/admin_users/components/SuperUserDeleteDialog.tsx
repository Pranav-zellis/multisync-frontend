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
  Alert,
} from "@mui/material";
import { useState, useEffect, useCallback } from "react";

import { useAuth } from "@/context/auth-context";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>; // ensure delete API is async
  username: string;
}

export default function SuperUserDeleteDialog({
  open,
  onClose,
  onConfirm,
  username,
}: Props) {
  const [confirmation, setConfirmation] = useState("");
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [countdown, setCountdown] = useState(5);

  const { user } = useAuth();
  const router = useRouter();
  const isMatch = confirmation.trim() === username;
  const isSelfDelete = user?.username === username;

  const handleClose = () => {
    setConfirmation("");
    onClose();
  };

  const handleConfirm = async () => {
    setConfirmation("");
    await onConfirm();

    if (isSelfDelete) {
      setShowLogoutDialog(true);
      setCountdown(5);
    }
  };

  const handleLogout = useCallback(async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`, {
      method: "GET",
      credentials: "include",
    });
    Cookies.remove("tenant", {
      path: "/",
      domain: ".zellis.io",
    });
    router.push("/");
  }, [router]); // ✅ add router to deps

  // countdown effect for logout
  useEffect(() => {
    if (!showLogoutDialog) return;

    if (countdown === 0) {
      handleLogout();
      return;
    }

    const timer = setTimeout(() => setCountdown((prev) => prev - 1), 1000);
    return () => clearTimeout(timer);
  }, [showLogoutDialog, countdown, handleLogout]);

  return (
    <>
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            width: 500,
            maxWidth: "100%",
          },
        }}
      >
        <DialogTitle>Delete Super Admin</DialogTitle>
        <DialogContent>
          {isSelfDelete && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              You are deleting the currently logged-in user. After confirmation,
              you will be logged out automatically.
            </Alert>
          )}

          <Typography sx={{ mb: 2 }}>
            This is a destructive process. Upon confirming,
            <strong> {username}</strong> will be deleted permanently.
            <br />
            <br />
            Please type <strong>{username}</strong> below to confirm.
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
              disabled={isSelfDelete} // ❌ prevent closing if self delete
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

      {/* 🚀 Logout Countdown Dialog */}
      <Dialog open={showLogoutDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Logging Out</DialogTitle>
        <DialogContent>
          <Typography>
            Your account has been deleted. You will be logged out in{" "}
            <strong>{countdown}</strong> seconds...
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleLogout}
            color="error"
            variant="contained"
            fullWidth
          >
            Logout Now
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
