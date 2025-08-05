"use client";

import React, { Dispatch, SetStateAction } from "react";
import {
  TextField,
  Box,
  Select,
  MenuItem,
  Alert,
  Checkbox,
  FormControlLabel,
  FormControl,
  FormLabel,
  FormGroup,
  FormHelperText,
} from "@mui/material";

// Supported country codes
export const supportedCountryCodes = ["+91", "+1", "+44", "+61", "+971"];

// Validators
export const isValidUsername = (username: string) =>
  username.length <= 50 && /^[a-zA-Z0-9_]+$/.test(username);

export const isValidName = (name: string) =>
  name.length <= 50 && /^[a-zA-Z\s]+$/.test(name);

export const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isPhoneValid = (phone: string) => /^[0-9]{6,14}$/.test(phone);

// Form type definition
export interface FormType {
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  countryCode: string;
  role?: string;
}

// Props
interface Props {
  form: FormType;
  setForm: Dispatch<SetStateAction<FormType>>;
  error?: string | null;
  isEditMode?: boolean;
  showRole: boolean; // true = hide role picker (super admin), false = show checkboxes
}

export default function SuperUsersForm({
  form,
  setForm,
  error,
  isEditMode = false,
  showRole,
}: Props) {
  const showRoleError = !showRole && !form.role;

  return (
    <>
      {error && <Alert severity="error">{error}</Alert>}

      <TextField
        label="Username"
        required
        fullWidth
        value={form.username || ""}
        onChange={(e) =>
          setForm((prev) => ({ ...prev, username: e.target.value }))
        }
        error={!!form.username && !isValidUsername(form.username)}
        helperText={
          form.username && !isValidUsername(form.username)
            ? "Up to 50 characters. Letters, numbers, underscores only."
            : ""
        }
        disabled={isEditMode}
        sx={{ mt: 1 }}
      />

      <TextField
        label="Email"
        type="email"
        required
        fullWidth
        value={form.email || ""}
        onChange={(e) =>
          setForm((prev) => ({ ...prev, email: e.target.value }))
        }
        error={!!form.email && !isValidEmail(form.email)}
        helperText={
          form.email && !isValidEmail(form.email) ? "Enter a valid email" : ""
        }
        disabled={isEditMode}
        sx={{ my: 2 }}
      />

      <Box display="flex" gap={2}>
        <TextField
          label="First Name"
          required
          fullWidth
          value={form.first_name || ""}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, first_name: e.target.value }))
          }
          error={!!form.first_name && !isValidName(form.first_name)}
          helperText={
            form.first_name && !isValidName(form.first_name)
              ? "Only letters, max 50 chars"
              : ""
          }
        />
        <TextField
          label="Last Name"
          fullWidth
          value={form.last_name || ""}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, last_name: e.target.value }))
          }
          error={!!form.last_name && !isValidName(form.last_name)}
          helperText={
            form.last_name && !isValidName(form.last_name)
              ? "Only letters, max 50 chars"
              : ""
          }
        />
      </Box>

      <Box display="flex" gap={1} sx={{ my: 2 }}>
        <Select
          value={form.countryCode}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, countryCode: e.target.value }))
          }
          size="small"
        >
          {supportedCountryCodes.map((code) => (
            <MenuItem key={code} value={code}>
              {code}
            </MenuItem>
          ))}
        </Select>
        <TextField
          label="Phone number (optional)"
          fullWidth
          value={form.phone || ""}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, phone: e.target.value }))
          }
          error={!!form.phone && !isPhoneValid(form.phone)}
          helperText={
            form.phone && !isPhoneValid(form.phone)
              ? "Enter 6–14 digits only"
              : ""
          }
        />
      </Box>

      {/* Show checkbox roles if NOT super admin */}
      {!showRole && (
        <Box display="flex" gap={1} sx={{ my: 2 }}>
          <FormControl component="fieldset">
            <FormLabel component="legend" sx={{ mb: 1 }}>
              Select Role
            </FormLabel>

            <FormGroup row>
              <FormControlLabel
                label="Admin User"
                control={
                  <Checkbox
                    checked={form.role === "Admin"}
                    onChange={() =>
                      setForm((prev) => ({
                        ...prev,
                        role: prev.role === "Admin" ? "" : "Admin",
                      }))
                    }
                  />
                }
              />
              <FormControlLabel
                label="User"
                control={
                  <Checkbox
                    checked={form.role === "User"}
                    onChange={() =>
                      setForm((prev) => ({
                        ...prev,
                        role: prev.role === "User" ? "" : "User",
                      }))
                    }
                  />
                }
              />
            </FormGroup>
          </FormControl>
        </Box>
      )}
    </>
  );
}
