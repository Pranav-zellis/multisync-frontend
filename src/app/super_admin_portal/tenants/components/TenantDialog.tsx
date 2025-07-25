"use client";

import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import TenantForm from "./TenantForm";

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
}: TenantDialogProps) {
  const isValidStatus =
    statusActive || statusInactive || (isEditing && statusFlaggedToDelete);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>{isEditing ? "Edit Tenant" : "Create New Tenant"}</DialogTitle>
      <DialogContent>
        <TenantForm
          tenantName={tenantName}
          setTenantName={setTenantName}
          statusActive={statusActive}
          setStatusActive={setStatusActive}
          statusInactive={statusInactive}
          setStatusInactive={setStatusInactive}
          statusFlaggedToDelete={statusFlaggedToDelete}
          setStatusFlaggedToDelete={setStatusFlaggedToDelete}
          errors={errors}
          setErrors={setErrors}
          isEditing={isEditing}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={onSave}
          disabled={!tenantName || !isValidStatus}
        >
          {isEditing ? "Update Tenant" : "Create Tenant"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
