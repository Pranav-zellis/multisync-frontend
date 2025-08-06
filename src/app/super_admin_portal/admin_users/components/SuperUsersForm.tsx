"use client";

import React, { useState, Dispatch, SetStateAction, useEffect } from "react";
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
  Typography,
} from "@mui/material";
import UserSuggestionPrompt from "./UserSuggestionPrompt";

export interface UserSuggestion {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  user_type: string; // e.g., "Super Admin", "Tenant Admin", "User"
  tenant_names: string; // Comma-separated tenant names or a string summary
}

interface FormType {
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  countryCode: string;
  role?: string;
  tenant?: string;
}

interface Props {
  form: FormType;
  setForm: Dispatch<SetStateAction<FormType>>;
  error?: string | null;
  isEditMode?: boolean;
  showRole: boolean;
  tenant_name: string[];
  setIsUserExists?: (exists: boolean) => void; // optional callback to parent
}

export const supportedCountryCodes = ["+91", "+1", "+44", "+61", "+971"];

export const isValidUsername = (username: string) =>
  username.length <= 50 && /^[a-zA-Z0-9_]+$/.test(username);

export const isValidName = (name: string) =>
  name.length <= 50 && /^[a-zA-Z\s]+$/.test(name);

export const isValidEmail = (email: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

export const isPhoneValid = (phone: string) => /^[0-9]{6,14}$/.test(phone);

export default function SuperUsersForm({
  form,
  setForm,
  error,
  isEditMode = false,
  showRole,
  setIsUserExists,
}: Props) {
  const [userSuggestions, setUserSuggestions] = useState<UserSuggestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSuggestionPrompt, setShowSuggestionPrompt] = useState(false);
  const [suggestionSourceField, setSuggestionSourceField] = useState<
    "username" | "email" | null
  >(null);

  // Derived flag whether user exists based on suggestions
  const isUserExists = userSuggestions.length > 0;

  // Notify parent of isUserExists changes
  useEffect(() => {
    if (setIsUserExists) {
      setIsUserExists(isUserExists);
    }
  }, [isUserExists, setIsUserExists]);

  // Fetch user suggestions by username or email
  async function fetchUserSuggestions(
    username?: string,
    email?: string,
    source?: "username" | "email"
  ) {
    if (!username && !email) {
      setUserSuggestions([]);
      setShowSuggestionPrompt(false);
      setSuggestionSourceField(null);
      return;
    }

    setLoading(true);
    try {
      const query = `
        query FindUser($email: String, $username: String) {
          findUserByEmailOrUsername(email: $email, username: $username) {
            username
            first_name
            last_name
            email
            phone_number
            user_type
            tenant_names
          }
        }
      `;

      const variables = {
        email: email || null,
        username: username || null,
      };

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/graphql`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ query, variables }),
        }
      );

      const json = await response.json();
      const found = json.data?.findUserByEmailOrUsername;

      if (found?.length > 0) {
        setUserSuggestions([found[0]]);
        setShowSuggestionPrompt(true);
        setSuggestionSourceField(source || null);
      } else {
        setUserSuggestions([]);
        setShowSuggestionPrompt(false);
        setSuggestionSourceField(null);
      }
    } catch (err) {
      console.error("Error fetching user suggestions:", err);
      setUserSuggestions([]);
      setSuggestionSourceField(null);
    } finally {
      setLoading(false);
    }
  }

  const handleUsernameBlur = () => {
    fetchUserSuggestions(form.username ?? undefined, undefined, "username");
  };

  const handleEmailBlur = () => {
    fetchUserSuggestions(undefined, form.email ?? undefined, "email");
  };

  const handleAcceptSuggestion = () => {
    const user = userSuggestions[0];

    if (user.user_type === "Super Admin") {
      alert("This is a Super Admin and cannot be added to a tenant.");
      return;
    }

    setForm((prev) => ({
      ...prev,
      username: user.username,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone_number.replace(/^\+\d{1,3}/, ""),
      countryCode:
        supportedCountryCodes.find((code) =>
          user.phone_number.startsWith(code)
        ) || "+91",
      role: user.user_type,
    }));

    setShowSuggestionPrompt(false);
  };

  const handleRejectSuggestion = () => {
    setForm((prev) => ({
      ...prev,
      ...(suggestionSourceField === "email" && { email: "" }),
      ...(suggestionSourceField === "username" && { username: "" }),
    }));

    setUserSuggestions([]);
    setShowSuggestionPrompt(false);
  };

  return (
    <>
      {error && <Alert severity="error">{error}</Alert>}

      {/* Username Field */}
      <TextField
        label="Username"
        required
        fullWidth
        value={form.username || ""}
        onChange={(e) =>
          setForm((prev) => ({ ...prev, username: e.target.value }))
        }
        onBlur={handleUsernameBlur}
        error={!!form.username && !isValidUsername(form.username)}
        helperText={
          form.username && !isValidUsername(form.username)
            ? "Up to 50 characters. Letters, numbers, underscores only."
            : ""
        }
        disabled={isEditMode || isUserExists}
        sx={{ mt: 1 }}
      />

      {loading && <Typography variant="body2">Checking user...</Typography>}

      <Box sx={{ mt: 1 }}>
        {showSuggestionPrompt &&
          suggestionSourceField === "username" &&
          userSuggestions.length > 0 && (
            <UserSuggestionPrompt
              user={userSuggestions[0]}
              tenant_name={[form.tenant ?? ""]}
              source={suggestionSourceField}
              onAccept={handleAcceptSuggestion}
              onReject={handleRejectSuggestion}
            />
          )}
      </Box>

      {/* Suggestion Prompt */}
      {/* {suggestionSourceField === "username" && <SuggestionPrompt />} */}
      {/* Email Field */}
      <TextField
        label="Email"
        type="email"
        required
        fullWidth
        value={form.email || ""}
        onChange={(e) =>
          setForm((prev) => ({ ...prev, email: e.target.value }))
        }
        onBlur={handleEmailBlur}
        error={!!form.email && !isValidEmail(form.email)}
        helperText={
          form.email && !isValidEmail(form.email) ? "Enter a valid email" : ""
        }
        disabled={isEditMode || isUserExists}
        sx={{ my: 2 }}
      />

      <Box sx={{ mt: 1 }}>
        {showSuggestionPrompt &&
          suggestionSourceField === "email" &&
          userSuggestions.length > 0 && (
            <UserSuggestionPrompt
              user={userSuggestions[0]}
              tenant_name={[form.tenant ?? ""]}
              source={suggestionSourceField}
              onAccept={handleAcceptSuggestion}
              onReject={handleRejectSuggestion}
            />
          )}
      </Box>

      {/* {suggestionSourceField === "email" && <SuggestionPrompt />} */}

      {/* Name Fields */}
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
          disabled={isUserExists}
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
          disabled={isUserExists}
        />
      </Box>

      {/* Phone Fields */}
      <Box display="flex" gap={1} sx={{ my: 2 }}>
        <Select
          value={form.countryCode}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, countryCode: e.target.value }))
          }
          size="small"
          disabled={isUserExists}
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
          disabled={isUserExists}
        />
      </Box>

      {/* Role Selection */}
      {!showRole && (
        <Box display="flex" gap={1} sx={{ my: 2 }}>
          <FormControl component="fieldset" disabled={isUserExists}>
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
