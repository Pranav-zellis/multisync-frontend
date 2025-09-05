"use client";

import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Radio,
  RadioGroup,
  FormControlLabel,
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
  // slugify function
  const slugify = (str: string) =>
    str
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "") // remove invalid chars
      .replace(/\s+/g, "-") // replace spaces with dashes
      .replace(/-+/g, "-"); // collapse multiple dashes

  const slugifyFirstWords = (str: string, wordLimit = 3) => {
    const words = str.trim().split(/\s+/).slice(0, wordLimit);
    return slugify(words.join(" "));
  };

  const slugName = tenantName ? slugifyFirstWords(tenantName, 3) : "";

  return (
    <Box display="flex" flexDirection="column" gap={3}>
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
            <Box display="flex" alignItems="center" color="success.main" gap={0.2}>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "15px" }}
              >
                task_alt
              </span>
              <Typography variant="caption">
                Your new tenant will be created as &quot;{slugName}&quot;
              </Typography>
            </Box>
          ) : null
        }
        FormHelperTextProps={{ sx: { ml: 0 } }}
      />

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
          <FormControlLabel value="inactive" control={<Radio />} label="Inactive" />
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
    </Box>
  );
}
