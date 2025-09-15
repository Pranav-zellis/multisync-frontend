"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Slide,
  Divider,
  useTheme,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import { useState, useEffect, forwardRef } from "react";
import { UPDATE_SUPER_ADMIN } from "../super_admin_portal/admin_users/ts/schema";
import { useGlobalLoader } from "@/context/loader-context";
import SuperUsersForm from "../super_admin_portal/admin_users/components/SuperUsersForm";

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
  role?: string;
}

interface Props {
  open: boolean;
  onClose: () => void;
  user: UserType | null;
  isEditing: boolean;
  inviterName: string;
  usersRole?: string;
  groups?: string[];
  tenantId?: string;
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

const defaultFormValues = {
  username: "",
  first_name: "",
  last_name: "",
  email: "",
  phone: "",
  role: "",
  countryCode: "+91",
};

// Slide transition (upwards)
const Transition = forwardRef(function Transition(
  props: TransitionProps & { children: React.ReactElement },
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

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
  const theme = useTheme();
  const [form, setForm] = useState<FormType>({ countryCode: "+61" });
  const [error] = useState<string | null>(null);
  const { showLoader, hideLoader } = useGlobalLoader();
  const [isUserExists, setIsUserExists] = useState(false);
  const [formKey, setFormKey] = useState(0);

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
        role: usersRole !== "Super Admin" ? usersRole : undefined,
      });
    } else {
      setForm({ countryCode: "+61" });
    }
  }, [open, isEditing, user, usersRole]);

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
      onClose();
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      setSnackbar({ open: true, message, severity: "error" });
    } finally {
      hideLoader();
    }
  };

  const handleClear = () => {
    setForm(defaultFormValues);
    setIsUserExists(false);
    setFormKey((k) => k + 1);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      keepMounted
      // Make it float like Gmail compose (fixed bottom-right)
      PaperProps={{
        elevation: 24,
        sx: {
          bottom: { xs: 16, sm: 24 },
          right: { xs: 12, sm: 24 },
          m: 0,
          borderRadius: 3,
          overflow: "hidden",
          boxShadow: theme.shadows[24] ?? "0px 8px 30px rgba(0,0,0,0.35)",
          zIndex: 2000,
        },
      }}
      fullWidth
      maxWidth="sm"
    >
      <DialogTitle
        sx={{
          m: 0,
          p: "8px 12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backgroundColor: theme.palette.background.paper,
          gap: 1,
          fontSize: 14,
          fontWeight: 600,
          // Gmail-like grabby header feel
          cursor: "default",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ fontSize: 17 }}>{title}</div>
          <div
            style={{
              fontSize: 12,
              color: theme.palette.text.secondary,
              marginLeft: 6,
            }}
          >
            {/* small subtitle (optional) */}
          </div>
        </div>

        <IconButton
          aria-label="close"
          onClick={onClose}
          size="small"
          sx={{
            color: theme.palette.grey[600],
            padding: "6px",
            borderRadius: 1,
          }}
        >
          <span className="material-symbols-outlined">close</span>
        </IconButton>
      </DialogTitle>

      {/* subtle divider */}
      <Divider sx={{ borderColor: "rgba(0,0,0,0.06)" }} />

      <DialogContent dividers sx={{ p: 2 }}>
        <SuperUsersForm
          key={formKey}
          form={form}
          setForm={(val: unknown) => setForm(val as FormType)}
          isEditMode={isEditing}
          error={error}
          showRole={usersRole === "Super Admin"}
          setIsUserExists={setIsUserExists}
          tenant_name={groups ?? []}
        />
      </DialogContent>

      <Divider sx={{ borderColor: "rgba(0,0,0,0.06)" }} />

      <DialogActions
        sx={{
          p: 1,
          px: 2,
          gap: 1,
          display: "flex",
          alignItems: "right",
          background: theme.palette.background.paper,
        }}
      >
        <div style={{ display: "flex", gap: 8 }}>
          <DialogActions>
            {!isEditing && (
              <Button variant="outlined" onClick={handleClear}>
                Clear
              </Button>
            )}
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={
                !form.username ||
                !form.first_name ||
                !form.email ||
                (!!form.phone && form.phone.length < 6) ||
                (!isEditing && (!form.role || form.role === ""))
              }
            >
              {isEditing ? "Update" : "Create"} {button_title}
            </Button>
          </DialogActions>
        </div>
      </DialogActions>
    </Dialog>
  );
}
