"use client";

import { useCallback, useEffect, useState } from "react";
import UserManagementSection from "@/components/UserManagementSection";
import SuperUserDialog from "@/components/SuperUserDialog";
import GlobalSnackbar from "@/components/GlobalSnackbar";
import { useAuth } from "@/context/auth-context";
import { useIsMounted } from "@/hooks/useIsMounted";
import { User } from "@/types/User";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Slide,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { useGlobalLoader } from "@/context/loader-context";
import SuperUserDeleteDialog from "@/super_admin_portal/admin_users/components/SuperUserDeleteDialog";

// Slide transition (like Gmail dialogs)
const Transition = (
  props: TransitionProps & { children: React.ReactElement }
) => <Slide direction="up" {...props} />;

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

type SnackbarState = {
  open: boolean;
  message: string;
  severity: "success" | "error" | "info" | "warning";
};

export default function UserManagement() {
  const { user } = useAuth() as {
    user: CustomUser | null;
    loading: boolean;
  };

  const { showLoader, hideLoader } = useGlobalLoader();
  const isMounted = useIsMounted();

  const [users, setUsers] = useState<User[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);

  const [superUserDialogOpen, setSuperUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [userTenantDialogOpen, setUserTenantDialogOpen] = useState(false);
  const [tenants, setTenants] = useState<
    { schema: string; tenant_name: string }[]
  >([]);
  const [selectedTenants, setSelectedTenants] = useState<string[]>([]);

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnackbar = useCallback(
    (message: string, severity: SnackbarState["severity"]) => {
      setSnackbar({ open: true, message, severity });
    },
    []
  );

  // === Fetch Users ===
  const fetchUsers = useCallback(
    async (pageNum: number, limit: number) => {
      setLoading(true);
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/graphql`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              query: `
                query GetPaginatedUsers($page: Int, $limit: Int) {
                  findUsersByUsersPaginated(page: $page, limit: $limit) {
                    users {
                      id
                      username
                      first_name
                      last_name
                      email
                      phone_number
                      user_type
                      tenant_ids
                      real_id
                    }
                    totalCount
                  }
                }
              `,
              variables: { page: pageNum + 1, limit },
            }),
          }
        );

        const result = await response.json();
        const data = result.data.findUsersByUsersPaginated;

        const formattedUsers = data.users.map((u: User, index: number) => ({
          ...u,
          id: index + pageNum * limit,
        }));

        if (isMounted.current) {
          setUsers(formattedUsers);
          setTotalCount(data.totalCount);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        if (isMounted.current) showSnackbar("Failed to load users", "error");
      } finally {
        if (isMounted.current) setLoading(false);
      }
    },
    [isMounted, showSnackbar]
  );

  useEffect(() => {
    fetchUsers(page, pageSize);
  }, [page, pageSize, fetchUsers]);

  // === Pagination Handlers ===
  const onPageChange = (newPage: number) => setPage(newPage);
  const onPageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(0);
  };

  // === CRUD Handlers ===
  const onCreateUser = () => {
    setSelectedUser(null);
    setSuperUserDialogOpen(true);
  };

  const onUserEdit = (user: User) => {
    setSelectedUser(user);
    setSuperUserDialogOpen(true);
  };

  const handleConfirmDeleteUser = (user: User) => {
    if (!user?.username) {
      showSnackbar("Invalid user selected", "error");
      return;
    }
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser?.username) {
      showSnackbar("Invalid user selected", "error");
      return;
    }

    showLoader();
    try {
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

      if (result.errors)
        throw new Error(result.errors[0]?.message || "Failed to delete user");

      if (result.data?.deleteUser) {
        showSnackbar("User deleted successfully", "success");
        fetchUsers(page, pageSize);
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

  // === Tenant Handlers ===
  const onTenantDialogOpen = async (user: User & { tenant_ids: string[] }) => {
    setSelectedUser(user);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/graphql`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `
              query {
                getAllActiveTenants {
                  schema
                  tenant_name
                }
              }
            `,
          }),
        }
      );

      const result = await response.json();
      const allTenants = result.data?.getAllActiveTenants || [];

      if (isMounted.current) {
        setTenants(allTenants);

        const matchedSchemas = allTenants
          .filter((tenant: { schema: string }) =>
            user.tenant_ids.includes(tenant.schema)
          )
          .map((tenant: { schema: string }) => tenant.schema);

        setSelectedTenants(matchedSchemas);
      }
    } catch (error) {
      console.error("Error fetching tenants:", error);
      showSnackbar("Failed to fetch tenants", "error");
    }

    setUserTenantDialogOpen(true);
  };

  const handleSaveUserTenants = async () => {
    if (!selectedUser) return;

    showLoader();
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/graphql`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `
              mutation UpdateTenantIds($id: Int!, $tenant_ids: [String!]!) {
                updateUserTenantIds(id: $id, tenant_ids: $tenant_ids) {
                  id
                  username
                  tenant_ids
                }
              }
            `,
            variables: {
              id: selectedUser.real_id,
              tenant_ids: selectedTenants,
            },
          }),
        }
      );

      const result = await response.json();

      if (result.errors)
        throw new Error(result.errors[0]?.message || "Mutation failed");

      showSnackbar("User tenants updated successfully", "success");
      fetchUsers(page, pageSize);
      setUserTenantDialogOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error("Error updating tenants:", error);
      showSnackbar("Failed to update user tenants", "error");
    } finally {
      hideLoader();
    }
  };

  return (
    <>
      {/* Snackbar */}
      <GlobalSnackbar
        open={snackbar.open}
        message={snackbar.message}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      />

      {/* Main Section */}
      <UserManagementSection
        users={users}
        totalCount={totalCount}
        loading={loading}
        page={page}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        onUserEdit={onUserEdit}
        onUserDelete={handleConfirmDeleteUser}
        onCreateUser={onCreateUser}
        createUsers
        superadmin
        onDialogOpen={onTenantDialogOpen}
        onDialogClose={() => setUserTenantDialogOpen(false)}
      />

      {/* Create/Edit User */}
      <SuperUserDialog
        open={superUserDialogOpen}
        user={selectedUser}
        inviterName={user?.username || ""}
        title={selectedUser ? "Edit User" : "Create User"}
        isEditing={!!selectedUser}
        usersRole={selectedUser?.user_type}
        button_title="User"
        groups={[]}
        tenantId=""
        setSnackbar={setSnackbar}
        onClose={() => {
          setSuperUserDialogOpen(false);
          setSelectedUser(null);
        }}
        onSuccess={() => {
          setSuperUserDialogOpen(false);
          setSelectedUser(null);
          fetchUsers(page, pageSize);
        }}
      />

      {/* Gmail-style Tenant Dialog */}
      <Dialog
        open={userTenantDialogOpen}
        onClose={() => setUserTenantDialogOpen(false)}
        TransitionComponent={Transition}
        keepMounted
        fullWidth
        maxWidth="sm"
        PaperProps={{
          elevation: 24,
          sx: {
            borderRadius: 3,
            overflow: "hidden",
            boxShadow: "0px 8px 30px rgba(0,0,0,0.35)",
          },
        }}
      >
        <DialogTitle>
          {selectedUser ? "Edit Tenants" : "Assign Tenants"}
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body1" color="textSecondary" gutterBottom>
            Select Tenants:
          </Typography>
          <FormGroup>
            {tenants.map((tenant) => (
              <FormControlLabel
                key={tenant.schema}
                control={
                  <Checkbox
                    checked={selectedTenants.includes(tenant.schema)}
                    onChange={(e) => {
                      const newSelection = e.target.checked
                        ? [...selectedTenants, tenant.schema]
                        : selectedTenants.filter((s) => s !== tenant.schema);
                      setSelectedTenants(newSelection);
                    }}
                    name={tenant.tenant_name}
                  />
                }
                label={tenant.tenant_name}
              />
            ))}
          </FormGroup>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setUserTenantDialogOpen(false)}
            color="secondary"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSaveUserTenants}
            variant="contained"
            color="primary"
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete User Dialog */}
      {selectedUser && (
        <SuperUserDeleteDialog
          open={deleteDialogOpen}
          onClose={() => {
            setDeleteDialogOpen(false);
            setSelectedUser(null);
          }}
          onConfirm={handleDeleteUser}
          username={selectedUser.username}
          userType={`${selectedUser.username} ${selectedUser.user_type}`}
        />
      )}
    </>
  );
}
