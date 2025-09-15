"use client";

import React, { useState, useEffect } from "react";
import {
  Menu,
  MenuItem,
  Box,
  Icon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import TenantDialog from "./TenantDialog";
import SuperUserDialog from "../../../components/SuperUserDialog";
import { useAuth } from "@/context/auth-context";
import { User } from "@/types/User";
import SuperUserDeleteDialog from "@/super_admin_portal/admin_users/components/SuperUserDeleteDialog";

interface Tenant {
  schema: string;
  tenant_name: string;
  tenant_status: "active" | "inactive" | "flagged_to_delete";
}

export interface UpdateTenantInput {
  schema: string;
  tenant_name: string;
  tenant_status: "active" | "inactive" | "flagged_to_delete";
}

interface TenantActionsMenuProps {
  tenant: Tenant;
  onCreateAdmin: (schema: string, tenantName: string) => void;
  updateTenant: (data: UpdateTenantInput) => Promise<Tenant>;
  showLoader: () => void;
  hideLoader: () => void;
  showSnackbar: (message: string, severity: "success" | "error") => void;
}

const TenantActionsMenu: React.FC<TenantActionsMenuProps> = ({
  tenant,
  onCreateAdmin,
  updateTenant,
  showLoader,
  hideLoader,
  showSnackbar,
}) => {
  const { user } = useAuth();
  const [superUserDialogOpen, setSuperUserDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // Dialog & Editing
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Tenant delete confirmation
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmInput, setConfirmInput] = useState("");

  // User dialogs
  const [users, setUsers] = useState<User[]>([]);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // For SuperUserDeleteDialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [currentTenantName, setCurrentTenantName] = useState(
    tenant.tenant_name
  );
  const [statusActive, setStatusActive] = useState(
    tenant.tenant_status === "active"
  );
  const [statusInactive, setStatusInactive] = useState(
    tenant.tenant_status === "inactive"
  );
  const [statusFlaggedToDelete, setStatusFlaggedToDelete] = useState(
    tenant.tenant_status === "flagged_to_delete"
  );
  const [editingSchema, setEditingSchema] = useState<string | null>(null);

  const [activeTenants, setActiveTenants] = useState<
    { tenant_name: string; schema: string }[]
  >([]);

  const [, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const [errors, setErrors] = useState({ tenantName: "", tenantStatus: "" });

  // === Fetch Users API ===
  const fetchUsers = React.useCallback(
    async (tenantSchema: string, pageNum: number, limit: number) => {
      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/graphql`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              query: `
              query GetPaginatedUsers($tenantSchemas: [String!]!, $page: Int, $limit: Int) {
                findUsersByTenantSchemasPaginated(
                  tenantSchemas: $tenantSchemas,
                  page: $page,
                  limit: $limit
                ) {
                  users {
                    id
                    username
                    first_name
                    last_name
                    email
                    phone_number
                    user_type
                    tenant_names
                  }
                  totalCount
                  currentPage
                  totalPages
                }
              }
            `,
              variables: {
                tenantSchemas: [tenantSchema],
                page: pageNum + 1,
                limit,
              },
            }),
          }
        );

        const result = await response.json();
        const data = result.data.findUsersByTenantSchemasPaginated;

        const formattedUsers = data.users.map((u: User, index: number) => ({
          ...u,
          id: index + pageNum * limit,
        }));

        setUsers(formattedUsers);
        setTotalCount(data.totalCount);
      } catch (err) {
        console.error("Failed to fetch users:", err);
        showSnackbar("Failed to load users", "error");
      } finally {
        setLoading(false);
      }
    },
    [showSnackbar]
  );

  useEffect(() => {
    async function fetchActiveTenants() {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/graphql`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              query: `
            query {
              tenants(skip: 0, take: 100) {
                activeTenants {
                  tenant_name
                  schema
                }
              }
            }
          `,
            }),
          }
        );
        const json = await res.json();
        setActiveTenants(json.data.tenants.activeTenants || []);
      } catch (error) {
        console.error("Failed to fetch active tenants:", error);
      }
    }
    fetchActiveTenants();
  }, []);

  useEffect(() => {
    if (dialogOpen && isEditing) {
      fetchUsers(tenant.schema, page, pageSize);
    }
  }, [page, pageSize, dialogOpen, isEditing, fetchUsers, tenant.schema]);

  // Paging handlers
  const handlePageChange = (newPage: number) => setPage(newPage);
  const handlePageSizeChange = (newPageSize: number) => {
    setPageSize(newPageSize);
    setPage(0);
  };

  // Menu handlers
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);

  // === User Actions ===
  const handleUserEdit = (user: User) => {
    setSelectedUser(user);
    setEditingSchema(tenant.schema);
    setCurrentTenantName(tenant.tenant_name);
    setSuperUserDialogOpen(true);
  };

  const handleUserDelete = (user: User) => {
    if (!user?.username) {
      showSnackbar("Invalid user selected", "error");
      return;
    }
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDeleteUser = async () => {
    if (!selectedUser?.username) return;

    try {
      showLoader();
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/graphql`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({
            query: `
            mutation DeleteUser($input: DeleteUserInput!) {
              deleteUser(input: $input)
            }
          `,
            variables: { input: { username: selectedUser.username } },
          }),
        }
      );

      const result = await res.json();
      if (result.errors) throw new Error(result.errors[0]?.message);

      if (result.data?.deleteUser) {
        showSnackbar("User deleted successfully", "success");
        fetchUsers(tenant.schema, page, pageSize);
      } else {
        showSnackbar("Failed to delete user", "error");
      }
    } catch (err) {
      console.error("Error deleting user:", err);
      showSnackbar("Error deleting user", "error");
    } finally {
      hideLoader();
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    }
  };

  // === Tenant Actions ===
  const handleEdit = () => {
    setIsEditing(true);
    setCurrentTenantName(tenant.tenant_name);
    setStatusActive(tenant.tenant_status === "active");
    setStatusInactive(tenant.tenant_status === "inactive");
    setStatusFlaggedToDelete(tenant.tenant_status === "flagged_to_delete");
    setErrors({ tenantName: "", tenantStatus: "" });
    setPage(0);
    setDialogOpen(true);
    fetchUsers(tenant.schema, 0, pageSize);
    handleMenuClose();
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setIsEditing(false);
    setErrors({ tenantName: "", tenantStatus: "" });
    setUsers([]);
  };

  const handleDialogSave = async () => {
    const selectedStatus = statusActive
      ? "active"
      : statusInactive
      ? "inactive"
      : statusFlaggedToDelete
      ? "flagged_to_delete"
      : null;

    if (!selectedStatus) {
      setErrors((prev) => ({
        ...prev,
        tenantStatus: "Select exactly one status",
      }));
      return;
    }

    try {
      showLoader();

      const slugify = (str: string) =>
        str
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9\s-]/g, "")
          .replace(/\s+/g, "-")
          .replace(/-+/g, "-");

      const slugifiedTenantName = currentTenantName
        ? slugify(currentTenantName)
        : "";

      await updateTenant({
        schema: tenant.schema,
        tenant_name: slugifiedTenantName,
        tenant_status: selectedStatus,
      });
      showSnackbar("Tenant updated successfully", "success");
      handleDialogClose();
    } catch (error) {
      console.error("Update error:", error);
      showSnackbar("Failed to update tenant", "error");
    } finally {
      hideLoader();
    }
  };

  const confirmTenantDelete = async () => {
    try {
      showLoader();
      await updateTenant({
        schema: tenant.schema,
        tenant_name: tenant.tenant_name,
        tenant_status: "flagged_to_delete",
      });
      showSnackbar("Tenant flagged for deletion", "success");
    } catch (error) {
      console.error("Delete error:", error);
      showSnackbar("Failed to delete tenant", "error");
    } finally {
      hideLoader();
      setConfirmDeleteOpen(false);
      setConfirmInput("");
    }
  };

  const handleCreateUser = () => {
    setSelectedUser(null);
    setEditingSchema(tenant.schema);
    setCurrentTenantName(tenant.tenant_name);
    setSuperUserDialogOpen(true);
  };

  const handleDelete = () => {
    setConfirmDeleteOpen(true);
    setConfirmInput("");
    handleMenuClose();
  };

  const handleActionClick = (action: string) => {
    switch (action) {
      case "tenantEdit":
        handleEdit();
        break;
      case "tenantDelete":
        handleDelete();
        break;
      case "createAdmin":
        onCreateAdmin(tenant.schema, tenant.tenant_name);
        handleMenuClose();
        break;
      default:
        handleMenuClose();
        break;
    }
  };

  return (
    <>
      {/* Actions Icon */}
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <Icon
          className="material-symbols-outlined"
          style={{ cursor: "pointer" }}
          onClick={handleMenuOpen}
        >
          more_vert
        </Icon>
      </Box>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={() => handleActionClick("tenantEdit")}>Edit</MenuItem>
        <MenuItem onClick={() => handleActionClick("tenantDelete")}>Delete</MenuItem>
        <MenuItem onClick={() => handleActionClick("createAdmin")}>
          Create New Admin User
        </MenuItem>
      </Menu>

      {/* Tenant Edit Dialog */}
      <TenantDialog
        open={dialogOpen}
        tenantName={currentTenantName}
        setTenantName={setCurrentTenantName}
        statusActive={statusActive}
        setStatusActive={setStatusActive}
        statusInactive={statusInactive}
        setStatusInactive={setStatusInactive}
        statusFlaggedToDelete={statusFlaggedToDelete}
        setStatusFlaggedToDelete={setStatusFlaggedToDelete}
        errors={errors}
        setErrors={setErrors}
        onClose={handleDialogClose}
        onSave={handleDialogSave}
        isEditing={isEditing}
        users={users.map((u) => ({
          ...u,
          tenant_names: Array.isArray(u.tenant_names)
            ? u.tenant_names
            : u.tenant_names
            ? [u.tenant_names]
            : [],
          real_id: u.id ?? u.id,
        }))}
        totalCount={totalCount}
        loading={loading}
        page={page}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
        onUserEdit={handleUserEdit}
        onUserDelete={handleUserDelete}
        onCreateUser={handleCreateUser}
        activeTenants={activeTenants}
      />

      {/* Super User Delete Dialog */}
      {selectedUser && (
        <SuperUserDeleteDialog
          open={deleteDialogOpen}
          onClose={() => {
            setDeleteDialogOpen(false);
            setSelectedUser(null);
          }}
          onConfirm={handleConfirmDeleteUser}
          username={selectedUser.username}
          userType={`${selectedUser.username} ${selectedUser.user_type}`}
        />
      )}

      {/* Tenant Confirm Delete Dialog */}
      <Dialog
        open={confirmDeleteOpen}
        onClose={() => {
          setConfirmDeleteOpen(false);
          setConfirmInput("");
        }}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { width: 500, maxWidth: "100%" } }}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This is a destructive process. Upon confirming,{" "}
            <strong>{tenant.tenant_name}</strong> tenant will be permanently deleted.
            <br />
            <br />
            Please type <strong>{tenant.tenant_name}</strong> in the input below
            to confirm.
          </DialogContentText>
          <TextField
            fullWidth
            margin="normal"
            label="Confirm tenant name"
            variant="outlined"
            value={confirmInput}
            onChange={(e) => setConfirmInput(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={confirmTenantDelete}
            color="error"
            variant="contained"
            disabled={
              confirmInput.trim().toLowerCase() !==
              tenant.tenant_name.trim().toLowerCase()
            }
          >
            Confirm Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Super User Create/Edit Dialog */}
      <SuperUserDialog
        open={superUserDialogOpen}
        user={selectedUser}
        inviterName={user?.username || ""}
        title={
          selectedUser
            ? `Edit User for \"${currentTenantName}\"`
            : `Create User for \"${currentTenantName}\"`
        }
        isEditing={Boolean(selectedUser)}
        usersRole={selectedUser?.user_type}
        button_title="User"
        groups={[currentTenantName]}
        tenantId={editingSchema ?? undefined}
        onClose={() => {
          setSuperUserDialogOpen(false);
          setSelectedUser(null);
        }}
        onSuccess={() => {
          setSuperUserDialogOpen(false);
          setSelectedUser(null);
          fetchUsers(tenant.schema, page, pageSize);
        }}
        setSnackbar={setSnackbar}
      />
    </>
  );
};

export default TenantActionsMenu;
