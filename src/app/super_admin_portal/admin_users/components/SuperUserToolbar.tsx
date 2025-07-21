"use client";

import React from "react";
import { Box, TextField, Button, Typography } from "@mui/material";

interface SuperUserToolbarProps {
  search: string;
  setSearch: (value: string) => void;
  onCreateClick: () => void;
}

export default function SuperUserToolbar({
  search,
  setSearch,
  onCreateClick,
}: SuperUserToolbarProps) {
  return (
    <Box mb={2} display="flex" flexDirection="column" gap={1}>
      <Typography variant="h6">Super Admin Users</Typography>

      <Box
        display="flex"
        flexWrap="wrap"
        alignItems="center"
        justifyContent="flex-end"
        gap={1}
        sx={{ width: "100%" }}
      >
        <TextField
          placeholder="Search..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            minWidth: "100px",
            width: {
              xs: "150px",
              sm: "200px",
            },
          }}
        />
        <Button
          variant="contained"
          onClick={onCreateClick}
          sx={{
            whiteSpace: "nowrap",
            fontSize: {
              xs: "0.75rem",
              sm: "0.875rem",
            },
            px: {
              xs: 1.5,
              sm: 2.5,
            },
            py: {
              xs: 0.75,
              sm: 1,
            },
          }}
        >
          + Create Super Admin
        </Button>
      </Box>
    </Box>
  );
}
