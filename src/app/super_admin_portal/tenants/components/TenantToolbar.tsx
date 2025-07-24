"use client";

import React from "react";
import { Box, TextField, Button, Typography } from "@mui/material";

interface TenantToolbarProps {
  search: string;
  setSearch: (value: string) => void;
  onCreateClick: () => void;
}

export default function TenantToolbar({
  search,
  setSearch,
  onCreateClick,
}: TenantToolbarProps) {
  return (
    <Box mb={2} display="flex" flexDirection="column" gap={2}>
      {/* Header Row */}
      <Box display="flex" flexDirection={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ sm: "center" }} gap={1}>
        <Typography variant="h6" sx={{ fontSize: { xs: "1rem", sm: "1.25rem" } }}>
          Tenant List
        </Typography>

        {/* Controls */}
        <Box
          display="flex"
          flexDirection={{ xs: "column", sm: "row" }}
          gap={1}
          alignItems={{ xs: "stretch", sm: "center" }}
        >
          <TextField
            placeholder="Search..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            fullWidth={true}
            sx={{ maxWidth: { sm: "200px" } }}
          />
          <Button
            variant="contained"
            onClick={onCreateClick}
            sx={{ whiteSpace: "nowrap" }}
          >
            + Create Tenant
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
