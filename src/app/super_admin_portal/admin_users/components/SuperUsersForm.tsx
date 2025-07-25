"use client";

import React from "react";
import { TextField, Box, Select, MenuItem, Alert } from "@mui/material";

export const supportedCountryCodes = ["+91", "+1", "+44", "+61", "+971"];

export const isValidUsername = (username: string) =>
  username.length <= 50 && /^[a-zA-Z0-9_]+$/.test(username);

export const isValidName = (name: string) =>
  name.length <= 50 && /^[a-zA-Z\s]+$/.test(name);

export const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isPhoneValid = (phone: string) => /^[0-9]{6,14}$/.test(phone);

interface Props {
  form: any;
  setForm: (val: any) => void;
  error?: string | null;
  isEditMode?: boolean; // <-- NEW PROP
}

export default function SuperUsersForm({
  form,
  setForm,
  error,
  isEditMode = false,
}: Props) {
  return (
    <>
      {error && <Alert severity="error">{error}</Alert>}

      <TextField
        label="Username"
        required
        fullWidth
        value={form.username || ""}
        onChange={(e) => setForm({ ...form, username: e.target.value })}
        error={!!form.username && !isValidUsername(form.username)}
        helperText={
          form.username && !isValidUsername(form.username)
            ? "Up to 50 characters. Letters, numbers, underscores only."
            : ""
        }
        disabled={isEditMode} // <-- DISABLED WHEN EDITING
      />

      <TextField
        label="Email"
        type="email"
        required
        fullWidth
        value={form.email || ""}
        onChange={(e) => setForm({ ...form, email: e.target.value })}
        error={!!form.email && !isValidEmail(form.email)}
        helperText={
          form.email && !isValidEmail(form.email) ? "Enter a valid email" : ""
        }
        disabled={isEditMode} // <-- DISABLED WHEN EDITING
        sx={{ my: 2 }}
      />

      <Box display="flex" gap={2}>
        <TextField
          label="First Name"
          required
          fullWidth
          value={form.first_name || ""}
          onChange={(e) => setForm({ ...form, first_name: e.target.value })}
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
          onChange={(e) => setForm({ ...form, last_name: e.target.value })}
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
          onChange={(e) => setForm({ ...form, countryCode: e.target.value })}
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
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          error={!!form.phone && !isPhoneValid(form.phone)}
          helperText={
            form.phone && !isPhoneValid(form.phone)
              ? "Enter 6–14 digits only"
              : ""
          }
        />
      </Box>
    </>
  );
}
