"use client";

import React, { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
} from "@mui/material";
import TenantForm from "./TenantForm";
import { User } from "@/types/User"; // ✅ shared type
import UserManagementSection from "@/components/UserManagementSection";



interface TenantDialogProps {
  open: boolean;
  tenantName: string; // current selected tenant name string
  setTenantName: (name: string) => void;
  statusActive: boolean;
  setStatusActive: (val: boolean) => void;
  statusInactive: boolean;
  setStatusInactive: (val: boolean) => void;
  statusFlaggedToDelete: boolean;
  setStatusFlaggedToDelete: (val: boolean) => void;
  errors: {
    tenantName: string;
    tenantStatus: string;
  };
  setErrors: React.Dispatch<
    React.SetStateAction<{
      tenantName: string;
      tenantStatus: string;
    }>
  >;
  onClose: () => void;
  onSave: () => void;

  isEditing: boolean;
  users?: User[];
  totalCount?: number;
  loading?: boolean;
  page?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  onUserEdit?: (user: User) => void;
  onUserDelete?: (user: User) => void;
  onCreateUser?: () => void;
  activeTenants?: { tenant_name: string; schema: string }[]; // list of active tenants
}

export default function TenantDialog({
  open,
  tenantName,
  setTenantName,
  statusActive,
  setStatusActive,
  statusInactive,
  setStatusInactive,
  statusFlaggedToDelete,
  setStatusFlaggedToDelete,
  errors,
  setErrors,
  onClose,
  onSave,
  isEditing,
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
  activeTenants,
}: TenantDialogProps) {
  // Manage internal state for tenant dropdown selection
  const [selectedTenant, setSelectedTenant] = useState(tenantName);

  // Sync external tenantName changes (e.g. when dialog opens)
  useEffect(() => {
    setSelectedTenant(tenantName);
  }, [tenantName]);

  const isValidStatus =
    statusActive || statusInactive || (isEditing && statusFlaggedToDelete);

  const [selectedTenants, setSelectedTenants] = useState<string[]>([]);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth={false}
      PaperProps={{
        sx: {
          width: "100%",
          maxWidth: "100%",
        },
      }}
    >
      <DialogTitle>
        {isEditing ? "Edit Tenant" : "Create New Tenant"}
      </DialogTitle>

      <DialogContent dividers>
        {/* Section 1: Tenant Form */}
        <Box mb={4} display="flex" justifyContent="center">
          <Box
            component="form"
            width="100%"
            maxWidth="100%"
            p={3}
            bgcolor="background.paper"
            borderRadius={2}
            sx={{ border: 2, borderColor: "divider" }}
          >
            <Typography variant="h6" gutterBottom>
              Tenant Details
            </Typography>

            <TenantForm
              tenantName={tenantName}
              setTenantName={setTenantName}
              selectedTenants={selectedTenants} // <-- Pass the new state here
              setSelectedTenants={setSelectedTenants} // <-- And the setter
              statusActive={statusActive}
              setStatusActive={setStatusActive}
              statusInactive={statusInactive}
              setStatusInactive={setStatusInactive}
              statusFlaggedToDelete={statusFlaggedToDelete}
              setStatusFlaggedToDelete={setStatusFlaggedToDelete}
              errors={errors}
              setErrors={setErrors}
              isEditing={isEditing}
              activeTenants={activeTenants}
            />

            <Box mt={3} display="flex" justifyContent="flex-end" gap={2}>
              <Button
                variant="contained"
                onClick={() => {
                  setTenantName(selectedTenant); // propagate selected tenant name upward
                  onSave();
                }}
                disabled={!selectedTenant || !isValidStatus}
              >
                {isEditing ? "Update Tenant" : "Create Tenant"}
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Section 2: User Management */}
        {isEditing && (
          <UserManagementSection
            users={users ?? []}
            totalCount={totalCount ?? 0}
            loading={loading ?? false}
            page={page ?? 0}
            pageSize={pageSize ?? 10}
            onPageChange={onPageChange ?? (() => {})}
            onPageSizeChange={onPageSizeChange ?? (() => {})}
            onUserEdit={onUserEdit ?? (() => {})}
            onUserDelete={onUserDelete ?? (() => {})}
            onCreateUser={onCreateUser ?? (() => {})}
            onDialogOpen={() => {}} // ✅ added
            onDialogClose={() => {}} // ✅ added
          />
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} sx={{ color: "orange" }}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
