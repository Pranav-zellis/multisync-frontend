// TenantDialog.tsx
"use client";

import React, { useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import TenantForm from "./TenantForm";

interface TenantDialogProps {
  open: boolean;
  tenantName: string;
  setTenantName: (name: string) => void;
  statusActive: boolean;
  setStatusActive: (val: boolean) => void;
  statusInactive: boolean;
  setStatusInactive: (val: boolean) => void;
  errors: { tenantName: string; tenantStatus: string };
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
  errors,
  onClose,
  onSave,
  isEditing,
}: TenantDialogProps) {
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
          errors={errors}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={onSave}
          disabled={!tenantName.trim() || (!statusActive && !statusInactive)}
        >
          {isEditing ? "Update Tenant" : "Create Tenant"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
