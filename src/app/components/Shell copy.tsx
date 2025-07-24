"use client";

import React, { useState, useEffect } from "react";
import {
  Avatar,
  Box,
  CssBaseline,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  ThemeProvider,
  createTheme,
  useMediaQuery,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { usePathname, useRouter } from "next/navigation";
import Cookies from "js-cookie";
import { useAuth } from "@/context/auth-context";
import { useGlobalLoader } from "@/context/loader-context";

const drawerWidthCollapsed = 92;
const drawerWidthExpanded = 240;

export default function Shell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();
  const { showLoader, hideLoader } = useGlobalLoader();

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [contentReady, setContentReady] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  const isMobile = useMediaQuery("(max-width:768px)");
  const isMenuOpen = Boolean(anchorEl);

  const isAdmin =
    user?.customAttributes?.["custom:users_role"] === "Super Admin" ||
    user?.groups?.includes("Admin");
  const isAdminRoute = pathname.includes("/super_admin_portal");

  const navItems =
    isAdmin && isAdminRoute
      ? [
          {
            label: "Dashboard",
            href: "/super_admin_portal/dashboard",
            icon: "dashboard",
          },
          {
            label: "Super admin",
            href: "/super_admin_portal/admin_users",
            icon: "admin_panel_settings",
          },
          {
            label: "Tenants",
            href: "/super_admin_portal/tenants",
            icon: "groups",
          },
          {
            label: "Settings",
            href: "/super_admin_portal/settings",
            icon: "settings",
          },
        ]
      : [{ label: "Dashboard", href: "/dashboard", icon: "dashboard" }];

  const theme = createTheme({
    palette: { mode: "light", primary: { main: "#FF982E" } },
    typography: { fontFamily: "Roboto, Helvetica, Arial, sans-serif" },
  });

  // Auth and redirect logic
  useEffect(() => {
    if (authLoading) return;

    let isCancelled = false;

    const groups = user?.groups || [];
    const tenant = Cookies.get("tenant");

    const role = user?.customAttributes?.["custom:users_role"];
    const isSuperAdmin = role === "Super Admin";
    const isAdminRoute = pathname.startsWith("/super_admin_portal");

    // 1. Redirect if not logged in
    if (!user && pathname !== "/") {
      showLoader();
       window.location.href = `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`;
      return;
    }

    // 2. Restrict Super Admin routes to Super Admin only
    if (isAdminRoute && !isSuperAdmin) {
      // Show 404 or redirect
      router.replace("/404"); // Or use a custom NotFound component
      return;
    }

    // 3. Redirect normal users with only one tenant
    const onlyOneGroup = groups.length === 1 && groups[0] !== "*";
    if (onlyOneGroup && pathname !== "/dashboard") {
      showLoader();
      router.replace("/dashboard");
      return;
    }

    // 4. Valid case — load page content
    showLoader();

    const timer = setTimeout(() => {
      if (!isCancelled) {
        hideLoader();
        setContentReady(true);
      }
    }, 700);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [authLoading, pathname, user]);

  // Session expiration checker - every 45 minutes
  useEffect(() => {
    // const checkInterval = 1 * 60 * 1000; // 45 minutes
    const checkInterval = 45 * 60 * 1000; // 45 minutes

    const interval = setInterval(() => {
      const accessToken = Cookies.get("access_token");
      if (!accessToken) {
        setSessionExpired(true);
      }
    }, checkInterval);

    return () => clearInterval(interval);
  }, []);

  const handleNavigate = (href: string) => {
    if (pathname !== href) {
      setContentReady(false); // hide content before navigation
      showLoader();
      router.push(href);
    }
  };

  const handleRelogin = () => {
    setSessionExpired(false);
    showLoader();
    Cookies.remove("tenant");
    window.location.href = "/"; // force full reload to login page
  };

  const drawerContent = (
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
      <Box>
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
            <IconButton onClick={() => setSidebarOpen(!sidebarOpen)}>
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
                }}
              >
                <ListItemIcon
                  sx={{
                    borderRadius: "15px",
                    backgroundColor: selected ? "#FF982E" : "transparent",
                    color: "#000",
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

      <Box
        sx={{
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: sidebarOpen ? "flex-start" : "center",
          gap: 1,
          cursor: "pointer",
        }}
        onClick={(e) => setAnchorEl(e.currentTarget)}
      >
        <Avatar sx={{ bgcolor: "#252830" }}>
          {user?.username?.charAt(0).toUpperCase() || "N"}
        </Avatar>
        {sidebarOpen && (
          <Box
            sx={{
              fontWeight: 600,
              fontSize: 14,
              color: "#252830",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              maxWidth: "120px",
            }}
          >
            {user?.username || "Name"}
          </Box>
        )}
      </Box>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex" }}>
        {user && pathname !== "/tenants" && (
          <Drawer
            variant={isMobile ? "temporary" : "permanent"}
            open={isMobile ? mobileOpen : true}
            onClose={() => setMobileOpen(false)}
            sx={{
              width:
                sidebarOpen || isMobile
                  ? drawerWidthExpanded
                  : drawerWidthCollapsed,
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
            {drawerContent}
          </Drawer>
        )}

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            bgcolor: "#EDF1F8",
            minHeight: "100vh",
            p: { xs: 1, sm: 2, md: 3 },
            visibility: contentReady ? "visible" : "hidden",
            display: "flex",
            flexDirection: "column",
            maxWidth: "100vw",
            overflowX: "hidden",
          }}
        >
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
              <IconButton
                onClick={() => setMobileOpen(!mobileOpen)}
                size="large"
              >
                <span className="material-symbols-outlined">
                  {mobileOpen ? "menu_open" : "menu"}
                </span>
              </IconButton>
            )}
          </Box>

          <Box
            sx={{
              backgroundColor: "#fff",
              borderRadius: 2,
              p: { xs: 2, sm: 4 },
              minHeight: {
                xs: "calc(100vh - 90px)",
                sm: "calc(100vh - 100px)",
              },
              boxShadow: "0px 4px 20px rgba(0, 0, 0, 0.05)",
              width: "100%",
              maxWidth: 1900,
              marginX: "auto",
              overflowX: "auto",
            }}
          >
            {children}
          </Box>
        </Box>

        <Menu
          anchorEl={anchorEl}
          open={isMenuOpen}
          onClose={() => setAnchorEl(null)}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <MenuItem onClick={() => setAnchorEl(null)}>Profile</MenuItem>

          {(user?.groups?.length > 1 || user?.groups?.includes("*")) && (
            <MenuItem
              onClick={() => {
                setAnchorEl(null);
                showLoader();
                Cookies.remove("tenant");
                setTimeout(() => router.push("/tenants"), 200);
              }}
            >
              Change Account
            </MenuItem>
          )}

          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              showLoader();
              fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`, {
                method: "GET",
                credentials: "include",
              }).then(() => {
                Cookies.remove("tenant");
                router.push("/");
              });
            }}
          >
            Logout
          </MenuItem>
        </Menu>

        {/* Session Expired Dialog */}
        <Dialog
          open={sessionExpired}
          onClose={(event, reason) => {
            // Prevent close on backdrop click or escape key
            if (reason === "backdropClick" || reason === "escapeKeyDown") {
              return;
            }
            // Allow close if needed otherwise do nothing
          }}
        >
          <DialogTitle>Session Expired</DialogTitle>
          <DialogContent>
            Your session has expired. Please log in again.
          </DialogContent>
          <DialogActions>
            <Button onClick={handleRelogin} color="primary" autoFocus>
              Re-login
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ThemeProvider>
  );
}
