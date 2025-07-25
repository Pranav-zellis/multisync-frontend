"use client";

import React, { useState } from "react";
import {
  Menu,
  MenuItem,
  Box,
  Icon,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
} from "@mui/material";
import TenantDialog from "./TenantDialog";

interface Tenant {
  schema: string;
  tenant_name: string;
  tenant_status: "active" | "inactive" | "flagged_to_delete";
}

export interface UpdateTenantInput {
  schema: string;
  tenant_name: string;
  tenant_status: "active" | "inactive" | "flagged_to_delete";
}

interface TenantActionsMenuProps {
  tenant: Tenant;
  onCreateAdmin: (schema: string, tenantName: string) => void;
  updateTenant: (data: UpdateTenantInput) => Promise<Tenant>;
  showLoader: () => void;
  hideLoader: () => void;
  showSnackbar: (message: string, severity: "success" | "error") => void;
}

const TenantActionsMenu: React.FC<TenantActionsMenuProps> = ({
  tenant,
  onCreateAdmin,
  updateTenant,
  showLoader,
  hideLoader,
  showSnackbar,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [confirmInput, setConfirmInput] = useState("");

  const [currentTenantName, setCurrentTenantName] = useState(tenant.tenant_name);
  const [statusActive, setStatusActive] = useState(tenant.tenant_status === "active");
  const [statusInactive, setStatusInactive] = useState(tenant.tenant_status === "inactive");
  const [statusFlaggedToDelete, setStatusFlaggedToDelete] = useState(
    tenant.tenant_status === "flagged_to_delete"
  );

  const [errors, setErrors] = useState({ tenantName: "", tenantStatus: "" });

  const open = Boolean(anchorEl);

  // Menu handlers
  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleMenuClose = () => setAnchorEl(null);

  // Edit dialog handlers
  const handleEdit = () => {
    setIsEditing(true);
    setCurrentTenantName(tenant.tenant_name);
    setStatusActive(tenant.tenant_status === "active");
    setStatusInactive(tenant.tenant_status === "inactive");
    setStatusFlaggedToDelete(tenant.tenant_status === "flagged_to_delete");
    setErrors({ tenantName: "", tenantStatus: "" });
    setDialogOpen(true);
    handleMenuClose();
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setIsEditing(false);
    setErrors({ tenantName: "", tenantStatus: "" });
  };

  const handleDialogSave = async () => {
    const selectedStatus = statusActive
      ? "active"
      : statusInactive
      ? "inactive"
      : statusFlaggedToDelete
      ? "flagged_to_delete"
      : null;

    if (!selectedStatus) {
      setErrors((prev) => ({ ...prev, tenantStatus: "Select exactly one status" }));
      return;
    }

    try {
      showLoader();
      await updateTenant({
        schema: tenant.schema,
        tenant_name: currentTenantName,
        tenant_status: selectedStatus,
      });
      showSnackbar("Tenant updated successfully", "success");
      handleDialogClose();
    } catch (error) {
      console.error("Update error:", error);
      showSnackbar("Failed to update tenant", "error");
    } finally {
      hideLoader();
    }
  };

  // Delete confirmation handlers
  const confirmTenantDelete = async () => {
    try {
      showLoader();
      await updateTenant({
        schema: tenant.schema,
        tenant_name: tenant.tenant_name,
        tenant_status: "flagged_to_delete",
      });
      showSnackbar("Tenant flagged for deletion", "success");
    } catch (error) {
      console.error("Delete error:", error);
      showSnackbar("Failed to delete tenant", "error");
    } finally {
      hideLoader();
      setConfirmDeleteOpen(false);
      setConfirmInput("");
    }
  };

  const handleDelete = () => {
    setConfirmDeleteOpen(true);
    setConfirmInput("");
    handleMenuClose();
  };

  // Menu action handler
  const handleActionClick = (action: string) => {
    switch (action) {
      case "tenantEdit":
        handleEdit();
        break;
      case "tenantDelete":
        handleDelete();
        break;
      case "createAdmin":
        onCreateAdmin(tenant.schema, tenant.tenant_name);
        handleMenuClose();
        break;
      default:
        handleMenuClose();
        break;
    }
  };

  return (
    <>
      {/* Actions Icon */}
      <Box display="flex" justifyContent="center" alignItems="center" height="100%">
        <Icon className="material-symbols-outlined" style={{ cursor: "pointer" }} onClick={handleMenuOpen}>
          more_vert
        </Icon>
      </Box>

      {/* Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <MenuItem onClick={() => handleActionClick("tenantEdit")}>Edit</MenuItem>
        <MenuItem onClick={() => handleActionClick("tenantDelete")}>Delete</MenuItem>
        <MenuItem onClick={() => handleActionClick("createAdmin")}>Create New Admin User</MenuItem>
      </Menu>

      {/* Edit Dialog */}
      <TenantDialog
        open={dialogOpen}
        tenantName={currentTenantName}
        setTenantName={setCurrentTenantName}
        statusActive={statusActive}
        setStatusActive={setStatusActive}
        statusInactive={statusInactive}
        setStatusInactive={setStatusInactive}
        statusFlaggedToDelete={statusFlaggedToDelete}
        setStatusFlaggedToDelete={setStatusFlaggedToDelete}
        errors={errors}
        setErrors={setErrors}
        onClose={handleDialogClose}
        onSave={handleDialogSave}
        isEditing={isEditing}
      />

      {/* Confirm Delete Dialog */}
      <Dialog
        open={confirmDeleteOpen}
        onClose={() => {
          setConfirmDeleteOpen(false);
          setConfirmInput("");
        }}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: { width: 500, maxWidth: "100%" },
        }}
      >
        <DialogTitle>Confirm Deletion</DialogTitle>
        <DialogContent>
          <DialogContentText>
            This is a destructive process. Upon confirming, <strong>{tenant.tenant_name}</strong> tenant will
            be permanently deleted.
            <br />
            <br />
            Please type <strong>{tenant.tenant_name}</strong> in the input below to confirm.
          </DialogContentText>
          <TextField
            fullWidth
            margin="normal"
            label="Confirm tenant name"
            variant="outlined"
            value={confirmInput}
            onChange={(e) => setConfirmInput(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={confirmTenantDelete}
            color="error"
            variant="contained"
            disabled={
              confirmInput.trim().toLowerCase() !== tenant.tenant_name.trim().toLowerCase()
            }
          >
            Confirm Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TenantActionsMenu;
