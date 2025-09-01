"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Card, Typography, Chip, Box, Button } from "@mui/material";
import SuperUserDialog from "../../../components/SuperUserDialog";

type SuperAdmin = {
  id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number: string;
};

export default function SuperAdminCard() {
  const [superAdmins, setSuperAdmins] = useState<SuperAdmin[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SuperAdmin | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const isMounted = useRef(true);
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

  // Fetch Super Admins
  const fetchSuperAdmins = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/graphql`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          query: `
            query {
              getAllActiveUsers {
                id
                username
                email
                first_name
                last_name
                phone_number
              }
            }
          `,
        }),
      });
      const result = await res.json();
      if (isMounted.current && result?.data?.getAllActiveUsers) {
        setSuperAdmins(result.data.getAllActiveUsers);
      }
    } catch (err) {
      console.error("Error fetching super admins:", err);
    }
  }, [API_URL]);

  useEffect(() => {
    isMounted.current = true;
    fetchSuperAdmins();
    return () => {
      isMounted.current = false;
    };
  }, [fetchSuperAdmins]);

  // Snackbar function placeholder
  const setSnackbar = () => {
    // Implement global snackbar logic if needed
  };

  const handleCreateAdmin = () => {
    setIsEditing(false);
    setSelectedUser(null);
    setDialogOpen(true);
  };

  return (
    <>
      <Card
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          borderRadius: 3,
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          backgroundColor: "#f7f9ff",
          p: 3,
        }}
      >
        <Typography variant="h6" align="center" fontWeight={600} gutterBottom>
          Super Admins
        </Typography>

        <Box
          sx={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: 1.2,
            minHeight: 64,
            mt: 2,
          }}
        >
          {superAdmins.length > 0 ? (
            superAdmins.map((admin) => (
              <Chip
                key={admin.id}
                label={admin.username}
                variant="outlined"
                sx={{
                  borderColor: "#5071a5",
                  color: "#5071a5",
                  textTransform: "capitalize",
                  fontWeight: 500,
                  fontSize: "0.85rem",
                  px: 2,
                  height: 32,
                }}
              />
            ))
          ) : (
            <Typography align="center" color="text.secondary">
              No admins yet
            </Typography>
          )}
        </Box>

        <Box textAlign="center" mt={3}>
          <Button
            variant="outlined"
            sx={{
              borderColor: "#FFA726",
              color: "#FFA726",
              textTransform: "none",
              borderRadius: 2,
              px: 2,
            }}
            onClick={handleCreateAdmin}
          >
            Create New Admin
          </Button>
        </Box>
      </Card>

      <SuperUserDialog
        open={dialogOpen}
        user={selectedUser}
        inviterName={selectedUser?.username || ""}
        isEditing={isEditing}
        usersRole="Super Admin"
        groups={["*"]}
        title={isEditing ? "Edit Super Admin User" : "Create Super Admin User"}
        button_title="Super Admin"
        onClose={() => {
          setDialogOpen(false);
          setSelectedUser(null);
        }}
        onSuccess={async () => {
          if (!isMounted.current) return;
          await fetchSuperAdmins();
          if (!isMounted.current) return;
          setDialogOpen(false);
          setSelectedUser(null);
        }}
        setSnackbar={setSnackbar}
      />
    </>
  );
}
