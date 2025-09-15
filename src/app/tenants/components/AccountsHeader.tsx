"use client";

import { Box, Button, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useGlobalLoader } from "@/context/loader-context";
import Cookies from "js-cookie";

interface AccountsHeaderProps {
  showAdmin: boolean;
}

export default function AccountsHeader({ showAdmin }: AccountsHeaderProps) {
  const router = useRouter();
  const { showLoader } = useGlobalLoader();

  const handleAdminClick = () => {
    showLoader();
    router.push("/super_admin_portal/dashboard");
  };

  const handleLogout = async () => {
    try {
      showLoader();

      await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/logout`, {
        method: "GET",
        credentials: "include",
      });
      Cookies.remove("tenant", {
        path: "/", // same path
        // domain: ".zellis.io", // same domain
      });
      router.push("/");
    } catch (error) {
      console.error("Logout failed", error);
      router.push("/"); // fallback redirect
    }
  };

  return (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      mb={6}
      flexDirection={{ xs: "column", sm: "row" }}
      gap={{ xs: 2, sm: 0 }}
    >
      {/* Left Side - Title */}
      <Box textAlign={{ xs: "center", sm: "left" }}>
        <Typography
          variant="h5"
          component="h4"
          fontWeight="bold"
          color="primary"
          sx={{ fontSize: { xs: "1.5rem", sm: "2rem" } }}
        >
          Tenant Account
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          mt={0.5}
          sx={{ fontSize: { xs: "0.9rem", sm: "1rem" } }}
        >
          Please choose a tenant to continue to the dashboard.
        </Typography>
      </Box>

      {/* Right Side - Buttons */}
      <Box
        display="flex"
        gap={2}
        alignItems="center"
        justifyContent="flex-end"
        mt={{ xs: 2, sm: 0 }}
      >
        {showAdmin && (
          <Button
            variant="outlined"
            onClick={handleAdminClick}
            startIcon={
              <span
                className="material-symbols-outlined"
                style={{ fontSize: 20 }}
              >
                admin_panel_settings
              </span>
            }
            sx={{
              borderColor: "#FFA726",
              color: "#FFA726",
              textTransform: "none",
              borderRadius: 2,
              px: 2.5,
              height: 40,
              fontWeight: 500,
            }}
          >
            Admin Portal
          </Button>
        )}

        <Button
          variant="outlined"
          color="error"
          onClick={handleLogout}
          sx={{
            borderRadius: 2,
            px: 3,
            height: 40,
            fontWeight: 500,
            textTransform: "none",
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  );
}
