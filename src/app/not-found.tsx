"use client";

import Link from "next/link";
import { Box, Typography, Button } from "@mui/material";

export default function AdminNotFound() {
  return (
    <Box
      sx={{
        height: "70vh",
        overflow: "hidden", // disables scrolling
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
      }}
    >
      <Typography variant="h3" fontWeight="bold" gutterBottom>
        404 - Page Not Found
      </Typography>
      <Typography variant="body1" mb={3}>
        The page you are looking for does not exist.
      </Typography>
      <Button
        variant="contained"
        color="primary"
        component={Link}
        href="/"
        sx={{ mt: 2 }}
      >
        Go to Home
      </Button>
    </Box>
  );
}
