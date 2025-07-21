"use client";

import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Box,
    Select,
    MenuItem,
    Alert,
} from "@mui/material";
import { useState, useEffect } from "react";
import { SuperUser } from "./SuperUserTable";
import {
    UPDATE_SUPER_ADMIN
} from "../ts/schema";
import { useGlobalLoader } from "@/context/loader-context";
import SuperUsersForm, {
    isValidUsername,
    isValidName,
    isValidEmail,
    isPhoneValid,
} from "./SuperUsersForm";


interface Props {
    open: boolean;
    onClose: () => void;
    user: SuperUser | null;
    isEditing: boolean;
    inviterName: string;
    onSuccess: () => void;
    setSnackbar: (val: { open: boolean; message: string; severity: "success" | "error" }) => void;
}

const supportedCountryCodes = ["+91", "+1", "+44", "+61", "+971"];

export default function SuperUserDialog({
    open,
    onClose,
    user,
    isEditing,
    inviterName,
    onSuccess,
    setSnackbar,
}: Props) {
    const [form, setForm] = useState<any>({ countryCode: "+91" });
    const [error, setError] = useState<string | null>(null);
    const { showLoader, hideLoader } = useGlobalLoader();

    useEffect(() => {
        if (isEditing && user) {
            let phone = user.phone_number || "";
            let code = "+91";
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
            setForm({ countryCode: "+91" });
        }
    }, [open, isEditing, user]);

    const isValidUsername = (username: string) =>
        username.length <= 50 && /^[a-zA-Z0-9_]+$/.test(username);
    const isValidName = (name: string) =>
        name.length <= 50 && /^[a-zA-Z\s]+$/.test(name);
    const isValidEmail = (email: string) =>
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isPhoneValid = (phone: string) => /^[0-9]{6,14}$/.test(phone);

    const createUser = async (input: any) => {
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

    const updateUser = async (input: any) => {
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
        const fullPhone = form.phone && form.countryCode ? `${form.countryCode}${form.phone}` : "";

        const input = {
            username: form.username,
            email: form.email,
            userPoolId: "ap-southeast-2_jYpTYYTfk",
            first_name: form.first_name,
            last_name: form.last_name,
            inviter_name: inviterName,
            phone_number: fullPhone,
            users_role: "Super Admin",
            groups: ["*"],
        };

        try {
            showLoader();
            if (isEditing) await updateUser(input);
            else await createUser(input);

            setSnackbar({
                open: true,
                message: isEditing ? "User updated successfully!" : "User created successfully!",
                severity: "success",
            });
            onSuccess();
        } catch (err: any) {
            setSnackbar({ open: true, message: err.message, severity: "error" });
            hideLoader();
        } finally {
            hideLoader();  // always hide loader after completion or error
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>{isEditing ? "Edit Super Admin" : "Create Super Admin"}</DialogTitle>
            <DialogContent dividers>
                <SuperUsersForm form={form} setForm={setForm} error={error} />
            </DialogContent>
            <DialogActions>
                <Button
                    variant="contained"
                    onClick={handleSubmit}
                    disabled={
                        !form.username ||
                        !isValidUsername(form.username) ||
                        !form.first_name ||
                        !isValidName(form.first_name) ||
                        (form.last_name && !isValidName(form.last_name)) ||
                        !form.email ||
                        !isValidEmail(form.email) ||
                        (!!form.phone && !isPhoneValid(form.phone))
                    }
                >
                    {isEditing ? "Update" : "Create"} Super Admin
                </Button>
            </DialogActions>
        </Dialog>
    );
}
