"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridActionsCellItem,
} from "@mui/x-data-grid";
import { Box } from "@mui/material";

import GlobalSnackbar from "@/components/GlobalSnackbar";
import SuperUserDialog from "../../../components/SuperUserDialog";
import SuperUserDeleteDialog from "./SuperUserDeleteDialog";
import SuperUserToolbar from "./SuperUserToolbar";
import { useGlobalLoader } from "@/context/loader-context";
import { DELETE_SUPER_ADMIN, GET_SUPER_ADMIN } from "../ts/schema";
import { useIsMounted } from "@/hooks/useIsMounted";
import { useAuth } from "@/context/auth-context";

export interface SuperUser {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
}

type SnackbarState = {
  open: boolean;
  message: string;
  severity: "success" | "error" | "info" | "warning";
};

export default function SuperUserGrid() {
  const { showLoader, hideLoader } = useGlobalLoader();

  const { user } = useAuth();
  // State
  const [users, setUsers] = useState<SuperUser[]>([]);
  const [total, setTotal] = useState(0);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [search, setSearch] = useState("");

  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });

  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SuperUser | null>(null);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [gridLoading, setGridLoading] = useState(false);

  const isMounted = useIsMounted();
  const isClient = useRef(false);

  // Snackbar helper
  const showSnackbar = useCallback(
    (message: string, severity: SnackbarState["severity"]) => {
      setSnackbar({ open: true, message, severity });
    },
    []
  );

  // Fetch users with mounted checks
  const fetchUsers = useCallback(async () => {
    setGridLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/graphql`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            query: GET_SUPER_ADMIN,
            variables: {
              input: {
                page: paginationModel.page + 1,
                pageSize: paginationModel.pageSize,
                search: search || null,
              },
            },
          }),
        }
      );

      const json = await res.json();
      if (!res.ok || json.errors) throw new Error("Failed to fetch users");

      if (isMounted.current) {
        setUsers(json.data.getSuperAdmins.users);
        setTotal(json.data.getSuperAdmins.totalCount);
      }
    } catch (error: unknown) {
      if (isMounted.current) {
        console.error("Fetch users error:", error);
        showSnackbar(
          error instanceof Error ? error.message : "Failed to load users",
          "error"
        );
      }
    } finally {
      if (isMounted.current) {
        setGridLoading(false);
      }
    }
  }, [paginationModel, search, isMounted, showSnackbar]);

  useEffect(() => {
    isClient.current = true;
    fetchUsers();
  }, [fetchUsers]);

  // Edit user handler
  const handleEdit = (user: SuperUser) => {
    setSelectedUser(user);
    setIsEditing(true);
    setDialogOpen(true);
  };

  // Delete dialog open
  const handleDelete = (user: SuperUser) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  // Confirm user deletion
  const handleConfirmDelete = async () => {
    try {
      if (!isMounted.current) return;
      showLoader();

      if (!selectedUser?.username) {
        throw new Error("Selected user is invalid or missing username.");
      }

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/graphql`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            query: DELETE_SUPER_ADMIN,
            variables: {
              input: { username: selectedUser.username },
            },
          }),
        }
      );

      const json = await res.json();
      if (!res.ok || json.errors) {
        throw new Error(json.errors?.[0]?.message || "Failed to delete user");
      }

      if (!isMounted.current) return;
      showSnackbar("User deleted successfully!", "success");
      setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
    } catch (err: unknown) {
      if (!isMounted.current) return;
      showSnackbar(
        err instanceof Error ? err.message : "An unknown error occurred",
        "error"
      );
    } finally {
      if (!isMounted.current) return;
      setSelectedUser(null);
      setDeleteDialogOpen(false);
      hideLoader();
    }
  };

  // DataGrid columns
  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 90 },
    { field: "username", headerName: "Username", flex: 1 },
    { field: "first_name", headerName: "First Name", flex: 1 },
    { field: "last_name", headerName: "Last Name", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "phone_number", headerName: "Phone", flex: 1 },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      getActions: (params) => [
        <GridActionsCellItem
          key="edit"
          label="Edit"
          onClick={() => handleEdit(params.row)}
          showInMenu
        />,
        <GridActionsCellItem
          key="delete"
          label="Delete"
          onClick={() => handleDelete(params.row)}
          showInMenu
        />,
      ],
    },
  ];

  if (!isClient.current) return null;

  return (
    <Box>
      <GlobalSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      />

      <SuperUserToolbar
        search={search}
        setSearch={setSearch}
        onCreateClick={() => {
          setDialogOpen(true);
          setSelectedUser(null);
          setIsEditing(false);
        }}
      />

      <Box sx={{ width: "100%", overflowX: "auto" }}>
        <DataGrid
          rows={users}
          columns={columns}
          rowCount={total}
          loading={gridLoading}
          pageSizeOptions={[5, 10, 25]}
          paginationModel={paginationModel}
          onPaginationModelChange={setPaginationModel}
          paginationMode="server"
          autoHeight
          sx={{ minWidth: 650 }}
        />
      </Box>

      <SuperUserDialog
        open={dialogOpen}
        user={selectedUser}
        inviterName={user?.username || ""}
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
          await fetchUsers();
          if (!isMounted.current) return;
          setDialogOpen(false);
          setSelectedUser(null);
        }}
        setSnackbar={setSnackbar}
      />

      <SuperUserDeleteDialog
        open={deleteDialogOpen}
        username={selectedUser?.username || ""}
        onClose={() => {
          setDeleteDialogOpen(false);
          setSelectedUser(null);
        }}
        onConfirm={handleConfirmDelete}
      />
    </Box>
  );
}
