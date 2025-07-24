"use client";

import React from "react";
import { Box, IconButton, useMediaQuery } from "@mui/material";

interface HeaderProps {
  isMobile: boolean;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
}

export default function Header({ isMobile, mobileOpen, setMobileOpen }: HeaderProps) {
  return (
    <Box
      sx={{
        mb: { xs: 2, sm: 3 },
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <img
        src="/images/ZELLIS_Multisync_dark.svg"
        alt="Logo"
        style={{
          width: "auto",
          height: 22,
          maxWidth: 220,
        }}
      />
      {isMobile && (
        <IconButton onClick={() => setMobileOpen(!mobileOpen)} size="large">
          <span className="material-symbols-outlined">
            {mobileOpen ? "menu_open" : "menu"}
          </span>
        </IconButton>
      )}
    </Box>
  );
}
