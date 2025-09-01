"use client";

import React from "react";
import {
  Box,
  Typography,
  TextField,
  FormControlLabel,
  Checkbox,
  Select,
  MenuItem,
  OutlinedInput,
  Chip,
  FormHelperText,
  InputLabel,
} from "@mui/material";
import { SelectChangeEvent } from "@mui/material/Select";

interface TenantFormProps {
  tenantName: string;
  setTenantName: (name: string) => void;
  selectedTenants: string[]; // for multi-select values
  setSelectedTenants: (tenants: string[]) => void;
  statusActive: boolean;
  setStatusActive: (val: boolean) => void;
  statusInactive: boolean;
  setStatusInactive: (val: boolean) => void;
  statusFlaggedToDelete: boolean;
  setStatusFlaggedToDelete: (val: boolean) => void;
  errors: {
    tenantName: string;
    tenantStatus: string;
    selectedTenants?: string;
  };
  setErrors: React.Dispatch<
    React.SetStateAction<{
      tenantName: string;
      tenantStatus: string;
      selectedTenants?: string;
    }>
  >;
  isEditing: boolean;
  activeTenants?: { tenant_name: string; schema: string }[]; // list of tenants for multi-select
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};

export default function TenantForm({
  tenantName,
  setTenantName,
  selectedTenants,
  setSelectedTenants,
  statusActive,
  setStatusActive,
  statusInactive,
  setStatusInactive,
  statusFlaggedToDelete,
  setStatusFlaggedToDelete,
  errors,
  setErrors,
  isEditing,
  activeTenants,
}: TenantFormProps) {
  const handleSelectedTenantsChange = (event: SelectChangeEvent<string[]>) => {
    const value = event.target.value as string[];
    setSelectedTenants(value);

    if (value.length > 0) {
      setErrors((prev) => ({ ...prev, selectedTenants: "" }));
    }
  };

  console.log(activeTenants);
  const filteredTenants = React.useMemo(() => {
    if (tenantName && tenantName.trim() !== "") {
      return (activeTenants ?? []).filter((t) => t.tenant_name !== tenantName);
    }
    return activeTenants ?? [];
  }, [activeTenants, tenantName]);

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      {/* OLD: Tenant Name Text Input (optional) */}
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

      {/* NEW: Multi-select box for active tenants */}

      {/* Tenant Status Checkboxes (unchanged) */}
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

      <Box>
        <InputLabel id="select-link-tenants-label" sx={{ mb: 1 }}>
          Select Link Tenants
        </InputLabel>
        <Select
          multiple
          fullWidth
          label="Favorite Animal"
          value={selectedTenants}
          onChange={handleSelectedTenantsChange}
          input={<OutlinedInput label="Select Link Tenants" />}
          renderValue={(selected) => (
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
              {(selected as string[]).map((value) => (
                <Chip key={value} label={value} />
              ))}
            </Box>
          )}
          MenuProps={MenuProps}
          error={Boolean(errors.selectedTenants)}
        >
          {filteredTenants.map((tenant) => (
            <MenuItem key={tenant.schema} value={tenant.tenant_name}>
              <Checkbox
                checked={selectedTenants.indexOf(tenant.tenant_name) > -1}
              />
              <Typography>{tenant.tenant_name}</Typography>
            </MenuItem>
          ))}
        </Select>

        {errors.selectedTenants && (
          <FormHelperText error>{errors.selectedTenants}</FormHelperText>
        )}
      </Box>
    </Box>
  );
}
