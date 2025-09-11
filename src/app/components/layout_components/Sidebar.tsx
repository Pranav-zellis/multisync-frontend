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
} from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";

type SidebarUser = {
  first_name?: string;
  groups?: string[];
  email?: string;
  username?: string;
  [key: string]: unknown; // for other dynamic fields if needed
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

          {/* Navigation Items */}
          <List >
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
                      mb: 2,
                      transition: "all 0.3s ease",
                      margin: showText ? "0 10px 0 0" : "0",
                      "& .material-symbols-outlined": {
                        fontSize: showText ? "22px" : "20px", // 👈 set icon size here
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
                  "&:hover": {
                    backgroundColor: "transparent", // removes rgba(0,0,0,0.04)
                  },
                }}
              >
                {/* Circle Avatar */}
                <Box
                  sx={{
                    borderRadius: "50%", // perfect circle
                    width: 40, // equal width & height
                    height: 40,
                    mr: showText ? 2 : 0,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    fontWeight: 600,
                    fontSize: 16,
                    color: "#fff",
                    backgroundColor: "#252830", // dark background
                    textTransform: "uppercase", // always uppercase initial
                    flexShrink: 0, // prevents shrinking
                  }}
                >
                  {user?.first_name?.charAt(0) || "N"}
                </Box>

                {/* Username */}
                <ListItemText
                  primary={user?.first_name || "Name"}
                  primaryTypographyProps={{
                    fontSize: 15,
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
              elevation: 5,
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

            {(user?.groups?.length ??
              (0 > 1 || user?.groups?.includes("*"))) && (
              <MenuItem
                onClick={() => {
                  handleMenuClose();
                  showLoader();
                  Cookies.remove("tenant", {
                    path: "/", // same path
                    domain: ".zellis.io", // same domain
                  });
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
