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
  Slide,
} from "@mui/material";
import { useState, useEffect, useCallback, forwardRef } from "react";
import { TransitionProps } from "@mui/material/transitions";
import { useAuth } from "@/context/auth-context";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

// ✅ Gmail-style Transition
const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface Props {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  username: string;
  userType?: string;
}

export default function SuperUserDeleteDialog({
  open,
  onClose,
  onConfirm,
  username,
  userType,
}: Props) {
  const [confirmation, setConfirmation] = useState("");
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [countdown, setCountdown] = useState(5);
  const [instantClose, setInstantClose] = useState(false);

  const { user } = useAuth();
  const router = useRouter();
  const isMatch = confirmation.trim() === username;
  const isSelfDelete = user?.username === username;
  const displayUserType = userType ?? "Super Admin";

  const handleClose = () => {
    setConfirmation("");
    setInstantClose(true); // bypass animation
    onClose();

    // reset instantClose after short delay
    setTimeout(() => setInstantClose(false), 250);
  };

  const handleConfirm = async () => {
    setConfirmation("");
    await onConfirm();

    if (isSelfDelete) {
      setShowLogoutDialog(true);
      setCountdown(5);
    } else {
      handleClose();
    }
  };

  const handleLogout = useCallback(async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`, {
      method: "GET",
      credentials: "include",
    });
    Cookies.remove("tenant", {
      path: "/", // same path
      domain: ".zellis.io", // same domain
    });
    router.push("/");
  }, [router]);

  // countdown for auto logout
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
        keepMounted
        TransitionComponent={instantClose ? Transition : Transition}
        PaperProps={{
          sx: {
            width: 500,
            maxWidth: "100%",
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: "0px 8px 28px rgba(0,0,0,0.35)",
          },
        }}
      >
        <DialogTitle>Delete {displayUserType}</DialogTitle>
        <DialogContent>
          {isSelfDelete && (
            <Alert severity="warning" sx={{ mb: 2 }}>
              You are deleting the currently logged-in user. After confirmation,
              you will be logged out automatically.
            </Alert>
          )}
          <Typography sx={{ mb: 2 }}>
            This is a destructive process. Upon confirming,{" "}
            <strong>{username}</strong> will be deleted permanently.
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
      <Dialog
        open={showLogoutDialog}
        maxWidth="xs"
        fullWidth
        keepMounted
        TransitionComponent={Transition}
      >
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
