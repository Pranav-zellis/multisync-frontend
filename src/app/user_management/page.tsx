"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Cookies from "js-cookie";

import UserManagementSection from "@/components/UserManagementSection";
import SuperUserDialog from "@/components/SuperUserDialog";
import { useAuth } from "@/context/auth-context";
import GlobalSnackbar from "@/components/GlobalSnackbar";
import { useIsMounted } from "@/hooks/useIsMounted";

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

  const isMounted = useIsMounted();

  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [tenant, setTenant] = useState<string | null>(null);
  const [tenant_name, setTenantName] = useState<string | null>(null);
  const [, setDialogOpen] = useState(false);

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
  const [editingSchema, setEditingSchema] = useState<string | null>(null);
  const [currentTenantName, setCurrentTenantName] = useState<string>("");

  useEffect(() => {
    const tenantCookie = Cookies.get("tenant");
    const tenantName = Cookies.get("tenant_name");

    if (tenantCookie) {
      setTenant(tenantCookie);
      setTenantName(tenantName);
    } else {
      router.replace("/"); // redirect to homepage if no tenant
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

  // 1. Fix the useEffect for fetching users when tenant, page, or pageSize changes:
  useEffect(() => {
    if (tenant) {
      fetchUsers(tenant, page, pageSize);
    }
  }, [tenant, page, pageSize, fetchUsers]);

  const onPageChange = (newPage: number) => setPage(newPage);
  const onPageSizeChange = (newSize: number) => {
    setPageSize(newSize);
    setPage(0); // reset to first page
  };

  const onCreateUser = () => {
    setSelectedUser(null);
    if (tenant) {
      setEditingSchema(tenant);
      setCurrentTenantName(tenant_name!);
      setSuperUserDialogOpen(true);
    }
  };

  const onUserEdit = (user: User) => {
    setSelectedUser(user);
    if (tenant) {
      setEditingSchema(tenant);
      setCurrentTenantName(tenant_name!);
      setSuperUserDialogOpen(true);
    }
  };

  const onUserDelete = (user: User) => {
    console.log("User delete request:", user);
    // TODO: Implement delete logic
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
        onDialogOpen={() => setDialogOpen(true)} // ✅ add this
        onDialogClose={() => setDialogOpen(false)} // ✅ add this
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
    </>
  );
}
