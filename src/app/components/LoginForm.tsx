"use client";

import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import Image from "next/image";
import { useState } from "react";

export default function LoginForm() {
  const [redirecting, setRedirecting] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    setRedirecting(true);
    setLoading(true);

    setTimeout(() => {
      window.location.href = process.env.NEXT_PUBLIC_API_BASE_URL+"/auth/login";
    }, 1000); // 1 second delay before redirect
  };

  return (
    <>
      {/* Loader overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-black border-solid"></div>
        </div>
      )}

      {/* Redirect Alert Snackbar */}
      <Snackbar
        open={redirecting}
        autoHideDuration={1000}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity="info" variant="filled" sx={{ width: "100%" }}>
          Redirecting to login...
        </Alert>
      </Snackbar>

      <Container
        component="main"
        maxWidth="xs"
        sx={{ minHeight: "100vh", display: "flex", alignItems: "center" }}
      >
        <Paper elevation={3} sx={{ width: "100%", p: 4, borderRadius: 3 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Box sx={{ mb: 2 }}>
              <Image
                src="/images/ZELLIS_Multisync_dark.svg"
                alt="Company Logo"
                width={170}
                height={170}
              />
            </Box>

            <Typography component="h1" variant="h6" sx={{ mb: 3 }}>
              Login
            </Typography>

            <Button
              onClick={handleLogin}
              fullWidth
              variant="contained"
              sx={{
                bgcolor: "black",
                color: "white",
                fontWeight: "bold",
                borderRadius: 2,
                py: 1.5,
                "&:hover": {
                  bgcolor: "#222",
                },
              }}
            >
              Login
            </Button>
          </Box>
        </Paper>
      </Container>
    </>
  );
}
