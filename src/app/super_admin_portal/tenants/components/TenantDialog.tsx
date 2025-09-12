"use client";

import React, { useEffect, useState, forwardRef } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  Slide,
  Divider,
  useTheme,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import TenantForm from "./TenantForm";
import { User } from "@/types/User";
import UserManagementSection from "@/components/UserManagementSection";

// Slide transition (upwards like Gmail)
const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

interface TenantDialogProps {
  open: boolean;
  tenantName: string;
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
  activeTenants?: { tenant_name: string; schema: string }[];
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
  const theme = useTheme();

  const [selectedTenant, setSelectedTenant] = useState(tenantName);
  const [selectedTenants, setSelectedTenants] = useState<string[]>([]);

  useEffect(() => {
    setSelectedTenant(tenantName);
  }, [tenantName]);

  const isValidStatus =
    statusActive || statusInactive || (isEditing && statusFlaggedToDelete);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      keepMounted
      fullWidth
      maxWidth={false}
      PaperProps={{
        elevation: 24,
        sx: {
          bottom: { xs: 16, sm: 24 },
          m: 0,
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: theme.shadows[24] ?? "0px 8px 30px rgba(0,0,0,0.35)",
        },
      }}
    >
      <DialogTitle
        sx={{
          m: 0,
          p: "8px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 18,
          fontWeight: 600,
          cursor: "default",
        }}
      >
        {isEditing ? "Edit Tenant" : "Create New Tenant"}
      </DialogTitle>

      <Divider sx={{ borderColor: "rgba(0,0,0,0.06)" }} />

      <DialogContent dividers sx={{ p: 2 }}>
        {/* Section 1: Tenant Form */}
        <Box mb={4} display="flex" justifyContent="center">
          <Box
            component="form"
            width="100%"
            maxWidth="100%"
            p={2}
            bgcolor="background.paper"
            borderRadius={2}
            sx={{ border: 1, borderColor: "divider" }}
          >
            <Typography variant="h6" gutterBottom>
              Tenant Details
            </Typography>

            <TenantForm
              tenantName={tenantName}
              setTenantName={setTenantName}
              selectedTenants={selectedTenants}
              setSelectedTenants={setSelectedTenants}
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
                  setTenantName(selectedTenant);
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
            onDialogOpen={() => {}}
            onDialogClose={() => {}}
          />
        )}
      </DialogContent>

      <Divider sx={{ borderColor: "rgba(0,0,0,0.06)" }} />

      <DialogActions
        sx={{
          p: 1,
          px: 2,
          gap: 1,
          display: "flex",
          justifyContent: "flex-end",
          background: theme.palette.background.paper,
        }}
      >
        <Button onClick={onClose} sx={{ textTransform: "none", color: "orange" }}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
