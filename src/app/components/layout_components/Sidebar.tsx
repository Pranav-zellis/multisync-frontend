"use client";

import React, { useState } from "react";
import {
  Avatar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";

interface SidebarProps {
  user: any;
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
    Cookies.remove("tenant");
    router.push("/");
  };

  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
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
          transition: "width 0.3s",
          borderRight: "none",
          overflowX: "hidden",
        },
      }}
    >
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#f5f9ff",
          py: 2,
        }}
      >
        {/* Navigation Items */}
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

          <List sx={{ pt: "30px" }}>
            {navItems.map(({ label, href, icon }) => {
              const selected = pathname === href;
              const showText = sidebarOpen || isMobile;
              return (
                <ListItemButton
                  key={href}
                  selected={selected}
                  onClick={() => handleNavigate(href)}
                  sx={{
                    my: 1,
                    mx: 2,
                    flexDirection: showText ? "row" : "column",
                    justifyContent: "center",
                    alignItems: "center",
                    px: showText ? 2 : 1,
                    height: showText ? 48 : 72,
                    borderRadius: 2,
                    "&.Mui-selected": {
                      backgroundColor: "transparent",
                      "& .MuiListItemIcon-root": {
                        backgroundColor: "#FF982E",
                        color: "#fff",
                      },
                    },
                    "&:hover": {
                      backgroundColor: "transparent",
                      "& .MuiListItemIcon-root": {
                        backgroundColor: "#FF982E",
                        color: "#fff",
                      },
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      borderRadius: "15px",
                      backgroundColor: selected ? "#6b6661ff" : "transparent",
                      color: selected ? "#fff" : "#000",
                      mr: showText ? 2 : 0,
                      justifyContent: "center",
                      alignItems: "center",
                      minHeight: 40,
                      mb: showText ? 0 : "4px",
                      textAlign: "center",
                    }}
                  >
                    <span className="material-symbols-outlined">{icon}</span>
                  </ListItemIcon>
                  <ListItemText
                    primary={label}
                    primaryTypographyProps={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: selected ? "#000" : "#888",
                      textAlign: "center",
                    }}
                  />
                </ListItemButton>
              );
            })}
          </List>
        </Box>

        {/* Profile Section (Floating Menu) */}
        <Box
          sx={{
            p: 1,
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
          }}
        >
          {(() => {
            const showText = sidebarOpen || isMobile;

            return (
              <ListItemButton
                onClick={handleProfileClick}
                sx={{
                  flexDirection: showText ? "row" : "column",
                  justifyContent: "center",
                  alignItems: "center",
                  px: showText ? 2 : 1,
                  height: showText ? 48 : 72,
                  borderRadius: 2,
                }}
              >
                <ListItemIcon
                  sx={{
                    borderRadius: "15px",
                    mr: showText ? 2 : 0,
                    justifyContent: "center",
                    alignItems: "center",
                    minHeight: 40,
                    mb: showText ? 0 : "4px",
                    textAlign: "center",
                    fontWeight: 600,
                    fontSize: 14,
                    color: "white",
                    background: "#252830",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "120px",
                  }}
                >
                  {user?.username?.charAt(0).toUpperCase() || "N"}
                </ListItemIcon>

                <ListItemText
                  primary={user?.username || "Name"}
                  primaryTypographyProps={{
                    fontSize: 12,
                    fontWeight: 600,
                    color: "#333",
                  }}
                />
              </ListItemButton>
            );
          })()}

          {/* Floating Menu */}
          <Menu
            anchorEl={anchorEl}
            open={openProfileMenu}
            onClose={handleMenuClose}
            anchorOrigin={{
              vertical: "top",
              horizontal: "right",
            }}
            transformOrigin={{
              vertical: "bottom",
              horizontal: "right",
            }}
            PaperProps={{
              elevation: 3,
              sx: { minWidth: 180 },
            }}
          >
            <MenuItem onClick={() => alert("Profile")}>
              <span
                className="material-symbols-outlined"
                style={{ marginRight: 8 }}
              >
                account_circle
              </span>
              Profile
            </MenuItem>

            {(user?.groups?.length > 1 || user?.groups?.includes("*")) && (
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  showLoader();
                  Cookies.remove("tenant");
                  router.push("/tenants");
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ marginRight: 8 }}
                >
                  change_circle
                </span>
                Change Tenant
              </MenuItem>
            )}

            <MenuItem
              onClick={() => {
                handleMenuClose();
                handleLogout();
              }}
              sx={{ color: "error.main" }}
            >
              <span
                className="material-symbols-outlined"
                style={{ marginRight: 8 }}
              >
                logout
              </span>
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </Box>
    </Drawer>
  );
}
