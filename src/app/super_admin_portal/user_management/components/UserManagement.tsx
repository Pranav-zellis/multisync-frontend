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
} from "@mui/material";
import { useGlobalLoader } from "@/context/loader-context";

// src/types/User.ts
// src/types/User.ts
// export interface User {
//   id: number;
//   username: string;
//   first_name: string;
//   last_name: string;
//   email: string;
//   phone_number: string;
//   user_type: string;
//   tenant_names?: string[]; // ✅ consistent
//   real_id: number;
// }

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

  const [UserDialogOpen, setUserDialogOpen] = useState(false);
  const isMounted = useIsMounted();
  const [tenant] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [tenants, setTenants] = useState<
    { schema: string; tenant_name: string }[]
  >([]);
  const [selectedTenants, setSelectedTenants] = useState<string[]>([]);

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

  const [superUserDialogOpen, setSuperUserDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

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

        const formattedUsers = data.users.map((u: any, index: number) => ({
          id: index + pageNum * limit,
          ...u,
        }));

        if (isMounted.current) {
          setUsers(formattedUsers);
          setTotalCount(data.totalCount);
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        if (isMounted.current) {
          showSnackbar("Failed to load users", "error");
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    },
    [isMounted, showSnackbar]
  );

  useEffect(() => {
    fetchUsers(page, pageSize);
  }, [tenant, page, pageSize, fetchUsers]);

  const onPageChange = (newPage: number) => setPage(newPage);
  const onPageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(0);
  };

  const onCreateUser = () => {
    setSelectedUser(null);
    setSuperUserDialogOpen(true);
  };

  const onUserEdit = (user: User) => {
    setSelectedUser(user);
    setSuperUserDialogOpen(true);
  };

  const onUserDelete = (user: User) => {
    console.log("Delete user:", user);
    // TODO: Add delete logic
  };

  const onDialogOpen = async (user: User & { tenant_ids: string[] }) => {
    setSelectedUser(user); // Set the selected user

    try {
      // Fetch tenants
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

      // Set all tenants in state
      if (isMounted.current) {
        setTenants(allTenants);
        // Filter tenant schemas that match user.tenant_ids
        const matchedSchemas = allTenants
          .filter((tenant: { schema: string }) =>
            user.tenant_ids.includes(tenant.schema)
          )
          .map((tenant: { schema: string }) => tenant.schema);

        setSelectedTenants(matchedSchemas); // Pre-select matching tenant checkboxes
      }
    } catch (error) {
      console.error("Error fetching tenants:", error);
      showSnackbar("Failed to fetch tenants", "error");
    }

    setUserDialogOpen(true); // Open the dialog
  };

  const handleSaveUserTenants = async () => {
    if (!selectedUser) {
      console.warn("No user selected");
      return;
    }
    showLoader();
    try {
      // 2️⃣ Update user-tenant assignment
      const updateResponse = await fetch(
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
              id: selectedUser.real_id, // DB id of the user
              tenant_ids: selectedTenants, // array of tenant schema strings
            },
          }),
        }
      );

      const updateResult = await updateResponse.json();

      if (updateResult.errors) {
        hideLoader();
        throw new Error(updateResult.errors[0]?.message || "Mutation failed");
      }

      fetchUsers(page, pageSize);
      console.log("Update success:", updateResult.data);
      showSnackbar("User tenants updated successfully", "success");

      // Close dialog after success
      setUserDialogOpen(false);
      hideLoader();
    } catch (error) {
      hideLoader();
      console.error("Error updating tenants:", error);
      showSnackbar("Failed to update user tenants", "error");
    } finally {
      hideLoader();
    }
  };

  return (
    <>
      <GlobalSnackbar
        open={snackbar.open}
        message={snackbar.message}
        severity={snackbar.severity}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
      />

      <UserManagementSection
        users={users}
        totalCount={totalCount}
        loading={loading}
        page={page}
        pageSize={pageSize}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
        onUserEdit={onUserEdit}
        onUserDelete={onUserDelete}
        onCreateUser={onCreateUser}
        createUsers={true}
        superadmin={true}
        superUserDialogOpen={superUserDialogOpen}
        onDialogOpen={onDialogOpen}
        onDialogClose={() => setUserDialogOpen(false)}
      />

      <SuperUserDialog
        open={superUserDialogOpen}
        user={selectedUser}
        inviterName={user?.username || ""}
        title={selectedUser ? `Edit User` : `Create User`}
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

      <Dialog
        open={UserDialogOpen}
        onClose={() => setUserDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>
          {selectedUser ? "Edit Tenants" : "Create Tenants"}
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
          <Button onClick={() => setUserDialogOpen(false)} color="secondary">
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
    </>
  );
}
