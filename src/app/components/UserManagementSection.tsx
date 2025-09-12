"use client";

import React from "react";
import { Box, Button, Typography } from "@mui/material";
import { DataGrid, GridColDef, GridActionsCellItem } from "@mui/x-data-grid";
import { useIsMounted } from "@/hooks/useIsMounted";
import { User } from "@/types/User"; // ✅ shared type

interface UserManagementTableProps {
  users?: User[];
  totalCount?: number;
  loading?: boolean;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onUserEdit: (user: User) => void;
  onUserDelete: (user: User) => void;
  onCreateUser: () => void;
  superUserDialogOpen?: boolean;
  createUsers?: boolean;
  superadmin?: boolean;
  UserDialogOpen?: boolean;
  onDialogOpen: (user: User & { tenant_ids: string[] }) => void;
  onDialogClose: () => void;
}

export default function UserManagementTable({
  users,
  totalCount,
  loading,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  onUserEdit,
  onUserDelete,
  onCreateUser,
  createUsers,
  superadmin,
  onDialogOpen,
}: UserManagementTableProps) {
  const isMounted = useIsMounted();

  const handleUserEdit = (user: User) => {
    if (isMounted.current) onUserEdit(user);
  };

  const handleUserDelete = (user: User) => {
    if (isMounted.current) onUserDelete(user);
  };

  const handleCreateUser = () => {
    if (isMounted.current && onCreateUser) onCreateUser();
  };

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 50 },
    { field: "username", headerName: "Username", flex: 1 },
    { field: "first_name", headerName: "First Name", flex: 1 },
    { field: "last_name", headerName: "Last Name", flex: 1 },
    { field: "email", headerName: "Email", flex: 1 },
    { field: "phone_number", headerName: "Phone", flex: 1 },
    { field: "user_type", headerName: "Role", flex: 1 },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      getActions: (params) => {
        if (superadmin) {
          return [
            <GridActionsCellItem
              key="tenantLinks"
              label="Tenant Links"
              onClick={() =>
                onDialogOpen({
                  ...params.row,
                  tenant_ids:
                    (params.row as User & { tenant_ids?: string[] })
                      .tenant_ids ?? [],
                })
              }
              showInMenu
            />,
          ];
        }
        return [
          <GridActionsCellItem
            key="edit"
            label="Edit"
            onClick={() => handleUserEdit(params.row as User)}
            showInMenu
          />,
          <GridActionsCellItem
            key="delete"
            label="Delete"
            onClick={() => handleUserDelete(params.row as User)}
            showInMenu
          />,
        ];
      },
    },
  ];

  return (
    <Box>
      {/* Header Controls */}
      <Box mb={2} display="flex" flexDirection="column" gap={2}>
        <Box
          display="flex"
          flexDirection={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          gap={2}
          width="100%"
        >
          <Typography variant="h6">User Management</Typography>
          {!createUsers && (
            <Button variant="contained" onClick={handleCreateUser}>
              + Create User
            </Button>
          )}
        </Box>
      </Box>

      {/* DataGrid Table */}
      <Box sx={{ width: "100%", overflowX: "auto" }}>
        <Box sx={{ minWidth: 1000 }}>
          <DataGrid
            rows={users ?? []}
            columns={columns}
            rowCount={totalCount ?? 0}
            pagination
            paginationMode="server"
            paginationModel={{
              page: (page ?? 0) + 1,
              pageSize: pageSize ?? 10,
            }}
            onPaginationModelChange={(model) => {
              if (isMounted.current) {
                if (
                  page !== undefined &&
                  onPageChange &&
                  model.page !== page + 1
                ) {
                  onPageChange(model.page - 1);
                }
                if (
                  pageSize !== undefined &&
                  onPageSizeChange &&
                  model.pageSize !== pageSize
                ) {
                  onPageSizeChange(model.pageSize);
                }
              }
            }}
            loading={loading ?? false}
            autoHeight
          />
        </Box>
      </Box>
    </Box>
  );
}
