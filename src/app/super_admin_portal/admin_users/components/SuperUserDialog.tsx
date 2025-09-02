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

interface FormType {
  username?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  phone?: string;
  countryCode: string;
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

const supportedCountryCodes = ["+61", "+91", "+1", "+44", "+971"];

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
  const [form, setForm] = useState<FormType>({ countryCode: "+61" });
  const [error] = useState<string | null>(null);
  const { showLoader, hideLoader } = useGlobalLoader();

  useEffect(() => {
    if (isEditing && user) {
      let phone = user.phone_number || "";
      let code = "+61";
      for (const c of supportedCountryCodes) {
        if (phone.startsWith(c)) {
          code = c;
          phone = phone.slice(c.length);
          break;
        }
      }
      setForm({
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone,
        countryCode: code,
      });
    } else {
      setForm({ countryCode: "+61" });
    }
  }, [open, isEditing, user]);

  const createUser = async (input: unknown) => {
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

  const updateUser = async (input: unknown) => {
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
      users_role: usersRole,
      groups,
      tenant_ids: tenantId ? [tenantId] : [], // <-- Pass tenantId here
    };

    try {
      showLoader();
      if (isEditing) await updateUser(input);
      else await createUser(input);

      setSnackbar({
        open: true,
        message: isEditing
          ? "User updated successfully!"
          : "User created successfully!",
        severity: "success",
      });
      onSuccess();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setSnackbar({ open: true, message, severity: "error" });
      hideLoader();
    } finally {
      hideLoader();
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent dividers>
        <SuperUsersForm
          form={form}
          setForm={(val: unknown) => setForm(val as FormType)} // cast val to FormType
          isEditMode={isEditing}
          error={error}
        />
      </DialogContent>
      <DialogActions>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={
            !form.username ||
            !form.first_name ||
            !form.email ||
            (!!form.phone && form.phone.length < 6)
          }
        >
          {isEditing ? "Update" : "Create"} {button_title}
        </Button>
      </DialogActions>
    </Dialog>
  );
}