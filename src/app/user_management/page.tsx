"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

import UserManagementSection from "@/components/UserManagementSection";
import SuperUserDialog from "@/components/SuperUserDialog";
import { useAuth } from "@/context/auth-context";
import GlobalSnackbar from "@/components/GlobalSnackbar";
import { useIsMounted } from "@/hooks/useIsMounted";
import { useGlobalLoader } from "@/context/loader-context";
import SuperUserDeleteDialog from "@/super_admin_portal/admin_users/components/SuperUserDeleteDialog";

interface User {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  user_type: string;
  tenant_names: string[];
}

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
  const router = useRouter();
  const { user } = useAuth() as {
    user: CustomUser | null;
    loading: boolean;
  };

  const { showLoader, hideLoader } = useGlobalLoader();
  const isMounted = useIsMounted();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [tenant, setTenant] = useState<string | null>(null);
  const [tenant_name, setTenantName] = useState<string | null>(null);

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
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false); // ✅ for delete
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [editingSchema, setEditingSchema] = useState<string | null>(null);
  const [currentTenantName, setCurrentTenantName] = useState<string>("");

  useEffect(() => {
    const tenantCookie = Cookies.get("tenant");
    const tenantName = Cookies.get("tenant_name");

    if (tenantCookie) {
      setTenant(tenantCookie);
      setTenantName(tenantName || null);
    } else {
      router.replace("/"); // redirect if no tenant
    }
  }, [router]);

  const fetchUsers = useCallback(
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

        if (isMounted.current) {
          setUsers(formattedUsers);
          setTotalCount(data.totalCount);
        }
      } catch (err) {
        console.error("Failed to fetch users:", err);
        if (isMounted.current) {
          showSnackbar("Failed to load users", "error");
        }
      } finally {
        if (isMounted.current) {
          setLoading(false);
        }
      }
    },
    [showSnackbar, isMounted]
  );

  useEffect(() => {
    if (tenant) {
      fetchUsers(tenant, page, pageSize);
    }
  }, [tenant, page, pageSize, fetchUsers]);

  const onPageChange = (newPage: number) => setPage(newPage);
  const onPageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(0);
  };

  const onCreateUser = () => {
    setSelectedUser(null);
    if (tenant) {
      setEditingSchema(tenant);
      setCurrentTenantName(tenant_name || "");
      setSuperUserDialogOpen(true);
    }
  };

  const onUserEdit = (user: User) => {
    setSelectedUser(user);
    if (tenant) {
      setEditingSchema(tenant);
      setCurrentTenantName(tenant_name || "");
      setSuperUserDialogOpen(true);
    }
  };

  // ✅ open delete dialog instead of window.confirm
  const onUserDelete = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
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
            variables: {
              input: { username: selectedUser.username },
            },
          }),
        }
      );

      const result = await res.json();

      if (result.errors) {
        throw new Error(result.errors[0]?.message || "Failed to delete user");
      }

      if (result.data?.deleteUser) {
        showSnackbar("User deleted successfully", "success");
        if (tenant) {
          fetchUsers(tenant, page, pageSize);
        }
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

  return (
    <>
      <GlobalSnackbar
        open={snackbar.open}
        message={snackbar.message}
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
        onDialogOpen={(user) => {
          setSelectedUser(user);
          setSuperUserDialogOpen(true);
        }}
        onDialogClose={() => {
          setSelectedUser(null);
          setSuperUserDialogOpen(false);
        }}
      />

      <SuperUserDialog
        open={superUserDialogOpen}
        user={selectedUser}
        inviterName={user?.username || ""}
        title={
          selectedUser
            ? `Edit User for "${currentTenantName}"`
            : `Create User for "${currentTenantName}"`
        }
        isEditing={!!selectedUser}
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
          if (tenant) {
            fetchUsers(tenant, page, pageSize);
          }
        }}
        setSnackbar={setSnackbar}
      />

      {/* 🗑 Delete Confirmation Dialog */}
      {selectedUser && (
        <SuperUserDeleteDialog
          open={deleteDialogOpen}
          onClose={() => {
            setDeleteDialogOpen(false);
            setSelectedUser(null);
          }}
          onConfirm={handleConfirmDelete}
          username={selectedUser.username}
          userType={`${selectedUser.username} ${selectedUser.user_type}`}
        />
      )}
    </>
  );
}
