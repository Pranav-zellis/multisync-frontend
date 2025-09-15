"use client";

import React, { useState } from "react";
import {
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
  Avatar,
  Button,
  Divider,
} from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";

type CustomAttributes = {
  email?: string;
  email_verified?: string;
  phone_number?: string;
  phone_number_verified?: string;
  name?: string;
  family_name?: string;
  "custom:inviter_name"?: string;
  "custom:users_role"?: string;
  sub?: string;
  [key: string]: unknown; // allow future keys
};

type SidebarUser = {
  first_name?: string;
  groups?: string[];
  email?: string;
  username?: string;
  customAttributes?: CustomAttributes; // 👈 add this
  [key: string]: unknown;
};

interface SidebarProps {
  user: SidebarUser | null;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  isMobile: boolean;
  navItems: { label: string; href: string; icon: string }[];
  showLoader: () => void;
}

export default function Sidebar({
  user,
  sidebarOpen,
  setSidebarOpen,
  mobileOpen,
  setMobileOpen,
  isMobile,
  navItems,
  showLoader,
}: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openProfileMenu = Boolean(anchorEl);

  const handleClick = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const drawerWidthCollapsed = 92;
  const drawerWidthExpanded = 240;

  const handleNavigate = (href: string) => {
    if (pathname !== href) {
      showLoader();
      if (isMobile) setMobileOpen(false);
      router.push(href);
    }
  };

  const handleLogout = async () => {
    showLoader();
    await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`, {
      method: "GET",
      credentials: "include",
    });
    Cookies.remove("tenant", {
      path: "/", // same path
      domain: ".zellis.io", // same domain
    });
    router.push("/");
  };

  return (
    <Drawer
      variant={isMobile ? "temporary" : "permanent"}
      open={isMobile ? mobileOpen : true}
      onClose={() => setMobileOpen(false)}
      sx={{
        width:
          sidebarOpen || isMobile ? drawerWidthExpanded : drawerWidthCollapsed,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width:
            sidebarOpen || isMobile
              ? drawerWidthExpanded
              : drawerWidthCollapsed,
          boxSizing: "border-box",
          backgroundColor: "#f5f9ff",
          borderRight: "none",
          overflowX: "hidden",
          transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1)", // 👈 Gmail-like easing
        },
      }}
    >
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          py: 2,
          transition: "all 0.3s ease-in-out", // smooth container transition
        }}
      >
        {/* Navigation Section */}
        <Box>
          {/* Sidebar Toggle */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent:
                sidebarOpen || isMobile ? "space-between" : "center",
              px: 2,
              mb: 2,
              transition: "all 0.3s ease-in-out", // smooth movement
            }}
          >
            {!isMobile && (
              <IconButton
                onClick={() => setSidebarOpen(!sidebarOpen)}
                aria-label="Toggle sidebar"
              >
                <span className="material-symbols-outlined">
                  {sidebarOpen ? "menu_open" : "menu"}
                </span>
              </IconButton>
            )}
          </Box>

          {/* Navigation Items */}
          <List>
            {navItems.map(({ label, href, icon }) => {
              const selected = pathname === href;
              const showText = sidebarOpen || isMobile;
              return (
                <ListItemButton
                  key={href}
                  selected={selected}
                  onClick={() => handleNavigate(href)}
                  sx={{
                    display: "flex",
                    flexDirection: showText ? "row" : "column",
                    justifyContent: "center",
                    alignItems: "center",
                    px: showText ? 2 : 1,
                    height: showText ? 48 : 60,
                    borderRadius: showText && selected ? 24 : 2,
                    margin: showText ? "8px 15px 8px 13px" : "7px 0 7px 0",
                    transition: "all 0.3s ease",
                    "& .MuiListItemIcon-root": {
                      backgroundColor: "transparent",
                      borderRadius: 4,
                      padding: 0,
                    },
                    "& .MuiListItemText-root": {
                      opacity: showText ? 1 : 1, // 👈 fade text
                      transition: "opacity 0.25s ease-in-out",
                    },
                    "&.Mui-selected": {
                      backgroundColor: showText ? "#FF982E" : "transparent",
                      borderRadius: 24,
                      "& .MuiListItemIcon-root": {
                        backgroundColor: "#FF982E",
                        color: "#fff",
                      },
                      "& .MuiListItemText-primary": {
                        color: showText ? "#fff" : "#FF982E",
                      },
                    },
                    "&.Mui-selected:hover": {
                      backgroundColor: showText ? "#FF982E" : "transparent",
                    },
                    "&:hover": {
                      backgroundColor: showText ? "#FF982E" : "unset",
                      borderRadius: 24,
                      "& .MuiListItemIcon-root": {
                        backgroundColor: showText ? "transparent" : "#FF982E",
                        color: "#fff",
                      },
                      "& .MuiListItemText-primary": {
                        color: showText ? "#8e5a27ff" : "#FF982E",
                      },
                    },
                  }}
                >
                  {/* Icon */}
                  <ListItemIcon
                    sx={{
                      borderRadius: "12px",
                      backgroundColor: selected ? "#FF982E" : "#f0f2f5",
                      color: selected ? "#fff" : "#555",
                      justifyContent: "center",
                      alignItems: "center",
                      minHeight: 32,
                      minWidth: 44,
                      transition: "all 0.3s ease-in-out", // smooth resize
                      "& .material-symbols-outlined": {
                        fontSize: showText ? "22px" : "20px",
                        transition: "font-size 0.25s ease-in-out",
                      },
                    }}
                  >
                    <span className="material-symbols-outlined">{icon}</span>
                  </ListItemIcon>

                  {/* Text */}
                  <ListItemText
                    primary={label}
                    primaryTypographyProps={{
                      fontSize: showText ? 13 : 12,
                      fontWeight: 600,
                      color: selected
                        ? showText
                          ? "#fff" // expanded + selected → white
                          : "#FF982E" // collapsed + selected → orange
                        : "#888", // default grey
                      textAlign: showText ? "left" : "center",
                    }}
                  />
                </ListItemButton>
              );
            })}
          </List>
        </Box>

        {/* Profile Section */}
        <Box
          sx={{
            p: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            flexDirection: !sidebarOpen && !isMobile ? "column" : "row", // 🔥 stack on desktop collapsed
            gap: !sidebarOpen && !isMobile ? 0.5 : 0, // spacing when stacked
          }}
        >
          {/* Avatar */}
          <IconButton onClick={handleClick} sx={{ p: 0 }}>
            <Avatar
              sx={{
                bgcolor: "#252830",
                width: 40,
                height: 40,
                fontWeight: 600,
                fontSize: 16,
                textTransform: "uppercase",
              }}
            >
              {user?.first_name?.charAt(0) || "N"}
            </Avatar>
          </IconButton>

          {/* Username */}
          <Typography
            onClick={handleClick}
            sx={{
              ml: sidebarOpen || isMobile ? 1 : 0, // inline spacing if row
              mt: !sidebarOpen && !isMobile ? 0.5 : 0, // little gap below avatar if stacked
              fontWeight: 600,
              fontSize: 15,
              color: "#333",
              textAlign: "center", // center align when stacked
              cursor: "pointer", // 👈 makes it clickable
            }}
          >
            {user?.first_name || "Name"}
          </Typography>

          {/* Dropdown Menu */}
          <Menu
            anchorEl={anchorEl}
            open={openProfileMenu}
            onClose={handleClose}
            anchorOrigin={{ vertical: "top", horizontal: "right" }}
            transformOrigin={{ vertical: "bottom", horizontal: "right" }}
            PaperProps={{
              elevation: 8,
              sx: {
                minWidth: 280,
                borderRadius: 3,
                overflow: "visible",
                p: 1,
              },
            }}
          >
            {/* Profile Top Section */}
            <Box sx={{ textAlign: "center", px: 2, pb: 2 }}>
              <Avatar
                sx={{
                  bgcolor: "#252830",
                  width: 64,
                  height: 64,
                  mx: "auto",
                  fontSize: 22,
                  fontWeight: 600,
                }}
              >
                {user?.first_name?.charAt(0) || "N"}
              </Avatar>
              <Typography sx={{ mt: 1, fontWeight: 600, fontSize: 16 }}>
                {user?.first_name || "Name"}
              </Typography>
              <Typography sx={{ fontSize: 14, color: "text.secondary" }}>
                {user?.customAttributes?.email ?? "user@example.com"}
              </Typography>
              <Button
                variant="outlined"
                size="small"
                sx={{ mt: 1, borderRadius: 5, textTransform: "none" }}
                onClick={() => {
                  handleClose();
                  alert("Manage Account clicked");
                }}
              >
                Manage your Account
              </Button>
            </Box>

            <Divider />

            {/* Change Tenant Option */}
            {((user?.groups?.length ?? 0) > 1 ||
              user?.groups?.includes("*")) && (
              <MenuItem
                onClick={() => {
                  handleClose();
                  showLoader();
                  Cookies.remove("tenant", {
                    path: "/", // same path
                    domain: ".zellis.io", // same domain
                  });
                  router.push("/tenants");
                }}
              >
                <ListItemIcon>
                  <span className="material-symbols-outlined">swap_calls</span>
                </ListItemIcon>
                Change Tenant
              </MenuItem>
            )}

            {/* Logout */}
            <MenuItem
              onClick={() => {
                handleClose();
                handleLogout?.();
              }}
              sx={{ color: "error.main" }}
            >
              <ListItemIcon>
                <span className="material-symbols-outlined">logout</span>
              </ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Box>
    </Drawer>
  );
}
