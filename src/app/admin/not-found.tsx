"use client";

import Link from "next/link";
import { Box, Typography, Button } from "@mui/material";

export default function AdminNotFound() {
  return (
    <Box
      sx={{
        height: "100vh",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        px: 2,
      }}
    >
      <Typography variant="h3" fontWeight="bold" gutterBottom>
        404 - Admin Page Not Found
      </Typography>
      <Typography variant="body1" mb={3}>
        The admin page you are looking for does not exist.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        component={Link}
        href="/admin/dashboard"
        sx={{ mt: 2 }}
      >
        Go to Admin Dashboard
      </Button>
    </Box>
  );
}
