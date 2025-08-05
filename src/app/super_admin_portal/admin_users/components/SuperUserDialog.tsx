"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
} from "@mui/material";
import { useState, useEffect } from "react";
import { UPDATE_SUPER_ADMIN } from "../ts/schema";
import { useGlobalLoader } from "@/context/loader-context";
import SuperUsersForm from "./SuperUsersForm";

interface UserType {
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number?: string;
}

export interface FormType {
  username?: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  countryCode: string;
  role?: string; // optional, can be undefined
}

interface Props {
  open: boolean;
  onClose: () => void;
  user: UserType | null;
  isEditing: boolean;
  inviterName: string;
  usersRole: string;
  groups: string[];
  tenantId?: string; // <-- tenantId is optional but required for new users
  title: string;
  button_title: string;
  onSuccess: () => void;
  setSnackbar: (val: {
    open: boolean;
    message: string;
    severity: "success" | "error";
  }) => void;
}

const supportedCountryCodes = ["+91", "+1", "+44", "+61", "+971"];

const defaultFormValues = {
  username: "",
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  role: "",
  countryCode: "+91",
};

export default function SuperUserDialog({
  open,
  onClose,
  user,
  isEditing,
  inviterName,
  usersRole,
  title,
  button_title,
  groups,
  tenantId,
  onSuccess,
  setSnackbar,
}: Props) {
  const [form, setForm] = useState<FormType>({ countryCode: "+91" });

  const [error] = useState<string | null>(null);
  const { showLoader, hideLoader } = useGlobalLoader();
  const [isUserExists, setIsUserExists] = useState(false);

  // To force remount SuperUsersForm on clear, reset this key
  const [formKey, setFormKey] = useState(0);

  useEffect(() => {
    if (isEditing && user) {
      let phone = "";
      let code = "+91"; // default

      if (user.phone_number) {
        for (const prefix of supportedCountryCodes) {
          if (user.phone_number.startsWith(prefix)) {
            code = prefix;
            phone = user.phone_number.slice(prefix.length);
            break;
          }
        }
      }

      setForm({
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone,
        countryCode: code,
        role: usersRole !== "Super Admin" ? usersRole : undefined,
      });
    } else {
      setForm({
        countryCode: "+91",
        role: usersRole !== "Super Admin" ? usersRole : undefined,
      });
    }
  }, [open, isEditing, user, usersRole]);

  const createUser = async (input: Record<string, unknown>) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        query: UPDATE_SUPER_ADMIN,
        variables: { input },
      }),
    });
    const json = await res.json();
    if (!res.ok || json.errors) {
      throw new Error(json.errors?.[0]?.message || "Failed to create user");
    }
  };

  const updateUser = async (input: Record<string, unknown>) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        query: `
          mutation UpdateUser($input: UpdateUserInput!) {
            updateUser(input: $input) {
              username
              email
            }
          }
        `,
        variables: { input },
      }),
    });
    const json = await res.json();
    if (!res.ok || json.errors) {
      throw new Error(json.errors?.[0]?.message || "Failed to update user");
    }
  };

  const handleSubmit = async () => {
    const fullPhone =
      form.phone && form.countryCode ? `${form.countryCode}${form.phone}` : "";

    const input = {
      username: form.username,
      email: form.email,
      first_name: form.first_name,
      last_name: form.last_name,
      inviter_name: inviterName,
      phone_number: fullPhone,
      users_role: usersRole === "Super Admin" ? usersRole : form.role,
      groups,
      tenant_ids: tenantId ? [tenantId] : [],
    };

    try {
      showLoader();
      if (isEditing || isUserExists) {
        await updateUser(input);
      } else {
        await createUser(input);
      }
      setSnackbar({
        open: true,
        message: isEditing
          ? "User updated successfully!"
          : "User created successfully!",
        severity: "success",
      });
      onSuccess();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setSnackbar({ open: true, message, severity: "error" });
    } finally {
      hideLoader();
    }
  };

  const handleClear = () => {
    setForm(defaultFormValues);
    setIsUserExists(false); // reset on clear
    setFormKey((k) => k + 1);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <SuperUsersForm
          key={formKey}
          form={form}
          setForm={setForm}
          isEditMode={isEditing}
          error={error}
          showRole={usersRole === "Super Admin"}
          setIsUserExists={setIsUserExists}
          tenant_name={groups}
        />
      </DialogContent>
      <DialogActions>
        <Button variant="outlined" onClick={handleClear}>
          Clear
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={
            !form.username ||
            !form.first_name ||
            !form.email ||
            (!!form.phone && form.phone.length < 6) ||
            !form.role ||
            form.role === ""
          }
        >
          {isEditing ? "Update" : "Create"} {button_title}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
