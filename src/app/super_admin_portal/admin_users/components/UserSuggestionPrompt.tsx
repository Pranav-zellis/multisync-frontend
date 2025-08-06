// components/UserSuggestionPrompt.tsx
"use client";

import React from "react";
import { Typography, Paper, Alert, Stack, Button } from "@mui/material";
import { usePathname } from "next/navigation";
import { useTheme } from "@mui/material/styles";

export interface UserSuggestion {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  user_type: string; // e.g., "Super Admin", "Tenant Admin", "User"
  tenant_names: string; // Comma-separated tenant names or a string summary
}

interface Props {
  user: UserSuggestion;
  tenant_name: string[];
  source: "username" | "email" | null;
  onAccept: () => void;
  onReject: () => void;
}

export default function UserSuggestionPrompt({
  user,
  tenant_name,
  source,
  onAccept,
  onReject,
}: Props) {
  const pathname = usePathname();
  const isSuperAdmin = user.user_type === "Super Admin";
  const isFromAdminUsers = pathname.includes("admin_users");
  const theme = useTheme();
  return (
    <Paper
      sx={{
        p: 2,
        mt: 2,
        my: 2,
        backgroundColor: "rgb(255, 244, 229)",
        border: `1px solid rgba(0, 0, 0, 0.54)`,
      }}
    >
      {!isSuperAdmin && (
        <Typography variant="subtitle1" gutterBottom>
          {!isFromAdminUsers ? (
            <>
              A user with{" "}
              {source === "email"
                ? `email ID "${user.email}"`
                : `username "${user.username}"`}{" "}
              already exists in our system under the following tenant(s):{" "}
              <strong>{user.tenant_names}</strong>. Please click "YES" if you
              wish to add the existing user as an{" "}
              <strong>{user.user_type}</strong> to the tenant{" "}
              <strong>{tenant_name}</strong>.
            </>
          ) : (
            <>
              A user with{" "}
              {source === "email"
                ? `email ID "${user.email}"`
                : `username "${user.username}"`}{" "}
              already exists as a tenant <strong>{user.user_type}</strong>.
              Promoting a tenant-level user to super admin is not allowed.
            </>
          )}
        </Typography>
      )}

      <Typography variant="body2" sx={{ mb: 1 }}>
        <b>
          {user.first_name} {user.last_name}
        </b>{" "}
        – {user.email} – {user.phone_number} - {user.user_type}
      </Typography>

      {isSuperAdmin && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          This user is a Super Admin and cannot be added to a tenant.
        </Alert>
      )}

      <Stack direction="row" spacing={2}>
        {user.user_type !== "Super Admin" &&
        !pathname.includes("admin_users") ? (
          <>
            <Button
              variant="outlined"
              onClick={onAccept}
              sx={{
                borderColor: theme.palette.success.main,
                color: theme.palette.success.main,
                backgroundColor: "rgba(76, 175, 80, 0.15)", // light green translucent
                backdropFilter: "blur(6px)",
                transition: "all 0.3s ease",
                "&:hover": {
                  backgroundColor: "rgba(76, 175, 80, 0.3)",
                  borderColor: theme.palette.success.dark,
                },
              }}
            >
              Yes
            </Button>
            {/* <Button
                variant="contained"
                color="error"
                onClick={handleRejectSuggestion}
              >
                No
              </Button> */}
          </>
        ) : (
          <Button
            variant="outlined"
            onClick={onReject}
            sx={{
              borderColor: theme.palette.error.main,
              color: theme.palette.error.main,
              backgroundColor: "rgba(244, 67, 54, 0.15)", // light red translucent
              backdropFilter: "blur(6px)",
              transition: "all 0.3s ease",
              "&:hover": {
                backgroundColor: "rgba(244, 67, 54, 0.3)",
                borderColor: theme.palette.error.dark,
              },
            }}
          >
            Dismiss
          </Button>
        )}
      </Stack>
    </Paper>
  );
}
