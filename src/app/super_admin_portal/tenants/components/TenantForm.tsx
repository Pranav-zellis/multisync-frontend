"use client";

import React from "react";
import {
  Box,
  Typography,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
  // Checkbox,
  // Select,
  // MenuItem,
  // OutlinedInput,
  // Chip,
  // FormHelperText,
  // InputLabel,
} from "@mui/material";
// import { SelectChangeEvent } from "@mui/material/Select";

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

// const ITEM_HEIGHT = 48;
// const ITEM_PADDING_TOP = 8;
// const MenuProps = {
//   PaperProps: {
//     style: {
//       maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
//       width: 250,
//     },
//   },
// };

export default function TenantForm({
  tenantName,
  setTenantName,
  // selectedTenants,
  // setSelectedTenants,
  statusActive,
  setStatusActive,
  statusInactive,
  setStatusInactive,
  statusFlaggedToDelete,
  setStatusFlaggedToDelete,
  errors,
  setErrors,
  isEditing,
}: // activeTenants,
TenantFormProps) {
  // const handleSelectedTenantsChange = (event: SelectChangeEvent<string[]>) => {
  //   const value = event.target.value as string[];
  //   setSelectedTenants(value);

  //   if (value.length > 0) {
  //     setErrors((prev) => ({ ...prev, selectedTenants: "" }));
  //   }
  // };

  // console.log(activeTenants);
  // const filteredTenants = React.useMemo(() => {
  //   if (tenantName && tenantName.trim() !== "") {
  //     return (activeTenants ?? []).filter((t) => t.tenant_name !== tenantName);
  //   }
  //   return activeTenants ?? [];
  // }, [activeTenants, tenantName]);
  // slugify function
  const slugify = (str: string) =>
    str
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "") // remove invalid chars
      .replace(/\s+/g, "-") // replace spaces with dashes
      .replace(/-+/g, "-"); // collapse multiple dashes

  const slugifyFirstWords = (str: string) => {
    const words = str.trim().split(/\s+/);
    return slugify(words.join(" "));
  };

  const slugName = tenantName ? slugifyFirstWords(tenantName) : "";

  return (
    <Box display="flex" flexDirection="column" gap={3}>
      {/* OLD: Tenant Name Text Input (optional) */}
      <TextField
        fullWidth
        label="Tenant Name"
        value={tenantName} // now stores/display raw input (with spaces)
        sx={{ my: 2 }}
        onChange={(e) => {
          const rawName = e.target.value;
          setTenantName(rawName); // store raw text
          if (rawName.trim()) {
            setErrors((prev) => ({ ...prev, tenantName: "" }));
          }
        }}
        error={Boolean(errors.tenantName)}
        helperText={
          errors.tenantName ? (
            errors.tenantName
          ) : tenantName ? (
            <Box
              display="flex"
              alignItems="center"
              color="success.main"
              gap={0.2}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "15px" }}
              >
                task_alt
              </span>
              <Typography variant="caption">
                Your tenant will now be called &quot;{slugName}&quot;
              </Typography>
            </Box>
          ) : null
        }
        FormHelperTextProps={{
          sx: { ml: 0 },
          component: "div", // 👈 ensures no <p> wrapping
        }}
      />

      {/* NEW: Multi-select box for active tenants */}

      {/* Tenant Status Checkboxes (unchanged) */}
      <Box>
        <Typography fontWeight={500} mb={0.5}>
          Tenant Status
        </Typography>
        <RadioGroup
          row
          value={
            statusActive
              ? "active"
              : statusInactive
              ? "inactive"
              : statusFlaggedToDelete
              ? "flagged_to_delete"
              : ""
          }
          onChange={(e) => {
            const value = e.target.value;
            setStatusActive(value === "active");
            setStatusInactive(value === "inactive");
            setStatusFlaggedToDelete(value === "flagged_to_delete");
            setErrors((prev) => ({ ...prev, tenantStatus: "" }));
          }}
        >
          <FormControlLabel value="active" control={<Radio />} label="Active" />
          <FormControlLabel
            value="inactive"
            control={<Radio />}
            label="Inactive"
          />
          {isEditing && (
            <FormControlLabel
              value="flagged_to_delete"
              control={<Radio />}
              label="Flagged to Delete"
            />
          )}
        </RadioGroup>
        {errors.tenantStatus && (
          <Typography variant="caption" color="error">
            {errors.tenantStatus}
          </Typography>
        )}
      </Box>

      {/* <Box>
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
      </Box> */}
    </Box>
  );
}
