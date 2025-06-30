"use client";

import * as React from "react";
import { useState, useEffect, useMemo } from "react";
import {
  Box,
  CssBaseline,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Menu,
  MenuItem,
  Tooltip,
  useMediaQuery,
  createTheme,
  ThemeProvider,
} from "@mui/material";
import { useRouter, usePathname } from "next/navigation";
import Cookies from "js-cookie";

const drawerWidthExpanded = 240;
const drawerWidthCollapsed = 72;

const navItems = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "dashboard" },
  { label: "Tenants", href: "/admin/Tenant", icon: "deployed_code_account" },
  { label: "Settings", href: "/admin/settings", icon: "settings" },
];

type User = {
  username?: string;
  email?: string;
  id?: string;
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  const prefersDarkMode = useMediaQuery("(prefers-color-scheme: light)");
  const [darkMode, setDarkMode] = useState(prefersDarkMode);
  const [hovered, setHovered] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState(true); // loading state
  const isMenuOpen = Boolean(anchorEl);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode ? "dark" : "light",
          primary: {
            main: "#1976d2",
            header: "#1565c0",
          },
        },
        typography: {
          fontFamily: `"Roboto", "Helvetica", "Arial", sans-serif`,
        },
      }),
    [darkMode]
  );

  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    const token = Cookies.get("id_token_admin");
    if (!token) {
      router.push("/admin/login");
      return;
    }

    fetch("http://localhost:4000/admin/me", { credentials: "include" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) {
          router.push("/admin/login");
        } else {
          setUser(data);
        }
      })
      .catch(() => router.push("/admin/login"))
      .finally(() => setLoading(false)); // Stop loading regardless of success or failure
  }, [router]);

  if (pathname.startsWith("/admin/login")) return <>{children}</>;

  const drawer = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Box>
        <Toolbar sx={{ justifyContent: "center", px: hovered ? 2 : 0 }}>
          <img
            src={
              darkMode ? "/images/logo-light.png" : "/images/logo-dark-new.png"
            }
            alt="Logo"
            style={{
              width: hovered ? 170 : 40,
              height: 40,
              objectFit: "contain",
              transition: "width 0.3s",
            }}
          />
        </Toolbar>
        <Divider />
        <List sx={{ px: isMobile || hovered ? 2 : 0 }}>
          {navItems.map(({ label, href, icon }) => {
            const selected = pathname === href;
            return (
              <ListItemButton
                key={href}
                selected={selected}
                onClick={() => {
                  router.push(href);
                  setMobileOpen(false);
                }}
                sx={{
                  justifyContent: isMobile || hovered ? "initial" : "center",
                  px: isMobile || hovered ? 2 : 0,
                  borderRadius: 2,
                  my: 0.5,
                  backgroundColor: selected ? "action.selected" : "transparent",
                  "&:hover": {
                    backgroundColor: "action.hover",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: isMobile || hovered ? 2 : 0,
                    justifyContent: "center",
                    color: selected ? "primary.main" : "text.secondary",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ color: "inherit" }}
                  >
                    {icon}
                  </span>
                </ListItemIcon>
                {(isMobile || hovered) && <ListItemText primary={label} />}
              </ListItemButton>
            );
          })}
        </List>
      </Box>
    </Box>
  );

  return (
    <>
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-white z-[13000] flex items-center justify-center">
          <div
            className="w-16 h-16 rounded-full border-t-4 border-black border-solid border-r-4 border-r-transparent animate-spin"
            role="status"
            aria-label="Loading"
          />
        </div>
      )}

      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Box sx={{ display: "flex" }}>
          {/* AppBar */}
          <AppBar
            position="fixed"
            color="primary"
            sx={{
              zIndex: (theme) => theme.zIndex.drawer + 1,
              backgroundColor: (theme) => theme.palette.primary.header,
              transition: theme.transitions.create(["width", "margin"], {
                easing: theme.transitions.easing.sharp,
                duration: theme.transitions.duration.leavingScreen,
              }),
            }}
          >
            <Toolbar>
              <IconButton
                color="inherit"
                edge="start"
                onClick={() => setMobileOpen(!mobileOpen)}
                sx={{ mr: 2, display: { md: "none" } }}
              >
                <span className="material-symbols-outlined">menu</span>
              </IconButton>
              <Typography variant="h6" sx={{ flexGrow: 1 }}>
                <img
                  src={
                    darkMode
                      ? "/images/logo-light.png"
                      : "/images/logo-light.png"
                  }
                  alt="Logo"
                  style={{
                    width: 150,
                    height: 60,
                    objectFit: "contain",
                  }}
                />
              </Typography>
              <Tooltip title={darkMode ? "Light mode" : "Dark mode"}>
                <IconButton
                  onClick={() => setDarkMode(!darkMode)}
                  color="inherit"
                >
                  <span className="material-symbols-outlined">
                    {darkMode ? "light_mode" : "dark_mode"}
                  </span>
                </IconButton>
              </Tooltip>
              <IconButton
                edge="end"
                onClick={(e) => setAnchorEl(e.currentTarget)}
                color="inherit"
              >
                {user?.username ? (
                  <Avatar>{user.username.charAt(0).toUpperCase()}</Avatar>
                ) : (
                  <span className="material-symbols-outlined">
                    account_circle
                  </span>
                )}
              </IconButton>
            </Toolbar>
          </AppBar>

          {/* Permanent Drawer (Desktop) */}
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: "none", md: "block" },
              "& .MuiDrawer-paper": {
                width: hovered ? drawerWidthExpanded : drawerWidthCollapsed,
                transition: "width 0.2s, box-shadow 0.2s, transform 0.2s",
                boxSizing: "border-box",
                overflowX: "hidden",
                boxShadow: "0 8px 20px rgba(0,0,0,0.12)",
                ...(hovered && {
                  boxShadow: "0 12px 40px rgba(0,0,0,0.24)",
                  transform: "translateZ(10px) translateY(-4px)",
                }),
              },
            }}
            open
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            {drawer}
          </Drawer>

          {/* Temporary Drawer (Mobile) */}
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            ModalProps={{ keepMounted: true }}
            sx={{
              display: { xs: "block", md: "none" },
              "& .MuiDrawer-paper": {
                width: drawerWidthExpanded,
                boxSizing: "border-box",
                overflowX: "hidden",
              },
            }}
          >
            {drawer}
          </Drawer>

          {/* Main Content */}
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              mt: "64px",
              ml: {
                md: `${hovered ? drawerWidthExpanded : drawerWidthCollapsed}px`,
              },
              width: {
                md: `calc(100% - ${
                  hovered ? drawerWidthExpanded : drawerWidthCollapsed
                }px)`,
              },
              transition: (theme) =>
                theme.transitions.create(["margin", "width"], {
                  easing: theme.transitions.easing.sharp,
                  duration: theme.transitions.duration.leavingScreen,
                }),
            }}
          >
            {children}
          </Box>

          {/* Avatar Menu */}
          <Menu
            anchorEl={anchorEl}
            open={isMenuOpen}
            onClose={() => setAnchorEl(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
            transformOrigin={{ vertical: "top", horizontal: "right" }}
          >
            <MenuItem onClick={() => setAnchorEl(null)}>Profile</MenuItem>
            <MenuItem
              onClick={() => {
                fetch("http://localhost:4000/admin/logout", {
                  method: "GET",
                  credentials: "include",
                }).then((res) => {
                  if (res.ok) router.push("/admin/login");
                });
                setAnchorEl(null);
              }}
            >
              Logout
            </MenuItem>
          </Menu>
        </Box>
      </ThemeProvider>
    </>
  );
}
