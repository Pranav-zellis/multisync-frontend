"use client";

import React, { useEffect, useRef } from "react";
import { Box, Button, Typography } from "@mui/material";
import { DataGrid, GridColDef, GridActionsCellItem } from "@mui/x-data-grid";
import { User } from "@/types/User";

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
  onCreateUser?: () => void;
  createUsers?: boolean;
  superadmin?: boolean;
  onDialogOpen: (user: User & { tenant_ids: string[] }) => void;
  onDialogClose?: () => void; // ✅ add this
}

export default function UserManagementTable({
  users = [],
  totalCount = 0,
  loading = false,
  page = 0,
  pageSize = 10,
  onPageChange,
  onPageSizeChange,
  onUserEdit,
  onUserDelete,
  onCreateUser,
  createUsers,
  superadmin,
  onDialogOpen,
}: UserManagementTableProps) {
  const isMounted = useRef(true);

  // Track mounted state to prevent state updates on unmounted components
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleUserEdit = (user: User) => {
    if (isMounted.current) onUserEdit(user);
  };

  const handleUserDelete = (user: User) => {
    if (isMounted.current) onUserDelete(user);
  };

  const handleCreateUser = () => {
    if (isMounted.current && onCreateUser) onCreateUser();
  };

  // Ensure pageSizeOptions includes the default pageSize
  const pageSizeOptions = [5, 10, 25, 50];

  const columns: GridColDef[] = [
    { field: "id", headerName: "ID", width: 60 },
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
            <GridActionsCellItem
              key="delete"
              label="Delete"
              onClick={() => handleUserDelete(params.row as User)}
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
      {/* Header */}
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
          {!createUsers && onCreateUser && (
            <Button variant="contained" onClick={handleCreateUser}>
              + Create User
            </Button>
          )}
        </Box>
      </Box>

      {/* DataGrid */}
      <Box sx={{ width: "100%", overflowX: "auto" }}>
        <Box sx={{ minWidth: 1000 }}>
          <DataGrid
            rows={users.map((u) => ({
              ...u,
              id: u.id + 1, // ensure unique id
            }))}
            columns={columns}
            rowCount={totalCount}
            pagination
            paginationMode="server"
            pageSizeOptions={pageSizeOptions} // ✅ include default
            paginationModel={{
              page,
              pageSize,
            }}
            onPaginationModelChange={(model) => {
              if (!isMounted.current) return;
              if (model.page !== page && onPageChange) onPageChange(model.page);
              if (model.pageSize !== pageSize && onPageSizeChange)
                onPageSizeChange(model.pageSize);
            }}
            loading={loading}
            autoHeight
            disableRowSelectionOnClick
          />
        </Box>
      </Box>
    </Box>
  );
}
