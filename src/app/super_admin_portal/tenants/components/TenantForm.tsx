// TenantForm.tsx
"use client";

import React from "react";
import { Box, Typography, TextField, FormControlLabel, Checkbox } from "@mui/material";

interface TenantFormProps {
  tenantName: string;
  setTenantName: (name: string) => void;
  statusActive: boolean;
  setStatusActive: (val: boolean) => void;
  statusInactive: boolean;
  setStatusInactive: (val: boolean) => void;
  errors: { tenantName: string; tenantStatus: string };
}

export default function TenantForm({
  tenantName,
  setTenantName,
  statusActive,
  setStatusActive,
  statusInactive,
  setStatusInactive,
  errors,
}: TenantFormProps) {
  return (
    <Box display="flex" flexDirection="column" gap={3}>
      <TextField
        fullWidth
        label="Tenant Name"
        value={tenantName}
        onChange={(e) => {
          setTenantName(e.target.value);
          if (e.target.value.trim()) {
            errors.tenantName = "";
          }
        }}
        error={Boolean(errors.tenantName)}
        helperText={errors.tenantName}
      />
      <Box>
        <Typography fontWeight={500} mb={0.5}>
          Tenant Status
        </Typography>
        <Box display="flex" gap={4}>
          <FormControlLabel
            control={
              <Checkbox
                checked={statusActive}
                onChange={(e) => {
                  setStatusActive(e.target.checked);
                  if (e.target.checked) {
                    setStatusInactive(false);
                    errors.tenantStatus = "";
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
                  setStatusInactive(e.target.checked);
                  if (e.target.checked) {
                    setStatusActive(false);
                    errors.tenantStatus = "";
                  }
                }}
              />
            }
            label="Inactive"
          />
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
