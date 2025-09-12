"use client";

import React from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  InputAdornment,
} from "@mui/material";

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
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <span className="material-symbols-outlined">search</span>
                </InputAdornment>
              ),
            }}
            sx={{
              borderRadius: "50px", // fully rounded
              backgroundColor: "#f1f3f4", // light gray like Gmail
              "& .MuiOutlinedInput-root": {
                borderRadius: "50px",
                paddingRight: "8px",
                "& fieldset": {
                  border: "none",
                },
                "&:hover fieldset": {
                  border: "none",
                },
                "&.Mui-focused fieldset": {
                  border: "none",
                },
              },
            }}
          />

          <Button
            variant="contained"
            onClick={onCreateClick}
            sx={{
              borderRadius: "20px", // rounded
              textTransform: "none", // preserve normal casing
              fontWeight: 500,
              color: "#fff",
              px: 5, // horizontal padding
              py: 1, // vertical padding
              boxShadow:
                "0 1px 3px rgba(60,64,67,0.3), 0 4px 8px rgba(60,64,67,0.15)",
              "&:hover": {
                boxShadow:
                  "0 2px 4px rgba(60,64,67,0.3), 0 6px 12px rgba(60,64,67,0.2)",
              },
              whiteSpace: "nowrap",
            }}
          >
            + Create Super Admin
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
