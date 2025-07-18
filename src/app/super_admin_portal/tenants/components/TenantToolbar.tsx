"use client";

import React from "react";
import { Box, TextField, Button, Typography } from "@mui/material";

interface TenantToolbarProps {
  search: string;
  setSearch: (value: string) => void;
  onCreateClick: () => void;
}

export default function TenantToolbar({ search, setSearch, onCreateClick }: TenantToolbarProps) {
  return (
    <Box mb={2} display="flex" flexDirection="column" gap={1}>
      <Typography variant="h6">Tenant List</Typography>
      <Box display="flex" flexWrap="wrap" justifyContent="flex-end" gap={1}>
        <TextField
          placeholder="Search..."
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Button variant="contained" onClick={onCreateClick}>
          + Create Tenant
        </Button>
      </Box>
    </Box>
  );
}
