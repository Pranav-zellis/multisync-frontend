"use client";

import { Box, Typography } from "@mui/material";

export default function EmptyState() {
  return (
    <Box
      sx={{
        mt: 6,
        textAlign: "center",
        color: "text.secondary",
        px: 2,
      }}
    >
      <Typography variant="h6" gutterBottom>
        No tenants found for your account.
      </Typography>
      <Typography variant="body1" maxWidth={400} mx="auto">
        It seems you do not have access to any tenant accounts. Please contact your administrator for assistance.
      </Typography>
    </Box>
  );
}
