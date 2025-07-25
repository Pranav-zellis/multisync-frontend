"use client";

import React from "react";
import Image from "next/image";
import { Box, IconButton } from "@mui/material";

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
      <Image
        src="/images/ZELLIS_Multisync_dark.svg"
        alt="Logo"
        width={220}
        height={22}
        style={{
          width: "auto",
          height: "22px",
          maxWidth: "220px",
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
