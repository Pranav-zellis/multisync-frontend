"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  CssBaseline,
  ThemeProvider,
  createTheme,
  useMediaQuery,
} from "@mui/material";
import Cookies from "js-cookie";
import { useAuth } from "@/context/auth-context";
import { useGlobalLoader } from "@/context/loader-context";
import { usePathname } from "next/navigation";

import AuthRedirect from "./layout_components/AuthRedirect";
import Header from "./layout_components/Header";
import Sidebar from "./layout_components/Sidebar";
import SessionDialog from "./layout_components/SessionDialog";

type CustomUser = {
  username: string;
  groups: string[];
  userPoolId: string;
  customAttributes: {
    email: string;
    email_verified: string;
    "custom:users_role": string;
    sub: string;
  };
};

export default function Shell({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth() as {
    user: CustomUser | null;
    loading: boolean;
  };

  const { showLoader, hideLoader } = useGlobalLoader();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [contentReady, setContentReady] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  const isMobile = useMediaQuery("(max-width:768px)");

  // Use Next.js hook for pathname, fallback to "/" if undefined
  const pathname = usePathname() || "/";
  // Determine admin status & routes
  // Determine admin status & routes
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
            label: "User Management",
            href: "/super_admin_portal/user_management",
            icon: "groups",
          },
          // {
          //   label: "Settings",
          //   href: "/super_admin_portal/settings",
          //   icon: "settings",
          // },
        ]
      : [
          { label: "Dashboard", href: "/dashboard", icon: "dashboard" },
          {
            label: "User Management",
            href: "/user_management",
            icon: "groups",
          },
        ];

  const theme = createTheme({
    palette: { mode: "light", primary: { main: "#FF982E" } },
    typography: { fontFamily: "Roboto, Helvetica, Arial, sans-serif" },
  });

  // Session expiration checker runs every 45 minutes
  useEffect(() => {
    const checkInterval = 45 * 60 * 1000;
    const interval = setInterval(() => {
      const accessToken = Cookies.get("access_token");
      if (!accessToken) setSessionExpired(true);
    }, checkInterval);
    return () => clearInterval(interval);
  }, []);

  const handleRelogin = () => {
    setSessionExpired(false);
    showLoader();
    Cookies.remove("tenant", {
      path: "/", // same path
      domain: ".zellis.io", // same domain
    });
    window.location.href = "/";
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex" }}>
        <AuthRedirect
          authLoading={authLoading}
          pathname={pathname}
          user={user}
          showLoader={showLoader}
          hideLoader={hideLoader}
          setContentReady={setContentReady}
        />
        {/* Sidebar shows only if user exists and path is not /tenants */}
        {user &&
          pathname !== "/tenants" &&
          (pathname.includes("/super_admin_portal") ||
            Cookies.get("tenant")) && (
            <Sidebar
              user={user}
              sidebarOpen={sidebarOpen}
              setSidebarOpen={setSidebarOpen}
              mobileOpen={mobileOpen}
              setMobileOpen={setMobileOpen}
              isMobile={isMobile}
              navItems={navItems}
              showLoader={showLoader}
            />
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
          <Header
            isMobile={isMobile}
            mobileOpen={mobileOpen}
            setMobileOpen={setMobileOpen}
          />

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
        <SessionDialog open={sessionExpired} onRelogin={handleRelogin} />
      </Box>
    </ThemeProvider>
  );
}
