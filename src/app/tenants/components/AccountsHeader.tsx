"use client";

import { Box, Button, Typography } from "@mui/material";
import { useRouter } from "next/navigation";
import { useGlobalLoader } from "@/context/loader-context";

export default function AccountsHeader() {
  const router = useRouter();
  const { showLoader } = useGlobalLoader();

  const handleAdminClick = () => {
    showLoader();
    router.push("/super_admin_portal/dashboard");
  };

  return (
    <Box display="flex" justifyContent="space-between" alignItems="center" mb={6}>
      <Typography variant="h4" fontWeight={600} color="text.primary">
        Tenants
      </Typography>

      <Button
        variant="outlined"
        onClick={handleAdminClick}
        startIcon={
          <span className="material-symbols-outlined text-base">admin_panel_settings</span>
        }
        sx={{
          borderColor: "#FFA726",
          color: "#FFA726",
          textTransform: "none",
          borderRadius: 2,
          px: 2,
        }}
      >
        Admin Portal
      </Button>
    </Box>
  );
}
