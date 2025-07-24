"use client";

import React from "react";
import {
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
} from "@mui/material";

interface TenantFormProps {
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
  isEditing: boolean;
}

export default function TenantForm({
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
  isEditing,
}: TenantFormProps) {
  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <TextField
        fullWidth
        label="Tenant Name"
        value={tenantName}
        sx={{ my: 2 }}
        onChange={(e) => {
          const name = e.target.value;
          setTenantName(name);
          if (name.trim()) {
            setErrors((prev) => ({ ...prev, tenantName: "" }));
          }
        }}
        error={Boolean(errors.tenantName)}
        helperText={errors.tenantName}
      />

      <Box>
        <Typography fontWeight={500} mb={0.5}>
          Tenant Status
        </Typography>
        <Box display="flex" gap={4} flexWrap="wrap">
          <FormControlLabel
            control={
              <Checkbox
                checked={statusActive}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setStatusActive(checked);
                  if (checked) {
                    setStatusInactive(false);
                    setStatusFlaggedToDelete(false);
                    setErrors((prev) => ({ ...prev, tenantStatus: "" }));
                  }
                }}
              />
            }
            label="Active"
          />
          <FormControlLabel
            control={
              <Checkbox
                checked={statusInactive}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setStatusInactive(checked);
                  if (checked) {
                    setStatusActive(false);
                    setStatusFlaggedToDelete(false);
                    setErrors((prev) => ({ ...prev, tenantStatus: "" }));
                  }
                }}
              />
            }
            label="Inactive"
          />
          {isEditing && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={statusFlaggedToDelete}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setStatusFlaggedToDelete(checked);
                    if (checked) {
                      setStatusActive(false);
                      setStatusInactive(false);
                      setErrors((prev) => ({ ...prev, tenantStatus: "" }));
                    }
                  }}
                />
              }
              label="Flagged to Delete"
            />
          )}
        </Box>
        {errors.tenantStatus && (
          <Typography variant="caption" color="error">
            {errors.tenantStatus}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
