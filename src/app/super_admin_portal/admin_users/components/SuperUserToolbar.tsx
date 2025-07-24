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
    <Box mb={2} display="flex" flexDirection="column" gap={2}>
      <Box
        display="flex"
        flexDirection={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ sm: "center" }}
        gap={1}
      >
        <Typography
          variant="h6"
          sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}
        >
          Super Admin Users
        </Typography>

        <Box
          display="flex"
          flexDirection={{ xs: "column", sm: "row" }}
          gap={1}
          alignItems={{ xs: "stretch", sm: "center" }}
          width={{ xs: "100%", sm: "auto" }}
        >
          <TextField
            placeholder="Search..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth
            sx={{
              maxWidth: { xs: "100%", sm: "200px" },
            }}
          />

          <Button
            variant="contained"
            onClick={onCreateClick}
            sx={{
              whiteSpace: "nowrap",
              fontSize: { xs: "0.75rem", sm: "0.875rem" },
              px: { xs: 1.5, sm: 2.5 },
              py: { xs: 0.75, sm: 1 },
              width: { xs: "100%", sm: "auto" },
            }}
          >
            + Create Super Admin
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
