"use client";

import React, { useEffect, useRef, useState } from "react";
import {
    DataGrid,
    GridColDef,
    GridPaginationModel,
    GridActionsCellItem,
    GridToolbar,
} from "@mui/x-data-grid";
import { Box } from "@mui/material";

import GlobalSnackbar from "@/components/GlobalSnackbar";
import SuperUserDialog from "./SuperUserDialog";
import SuperUserDeleteDialog from "./SuperUserDeleteDialog";
import SuperUserToolbar from "./SuperUserToolbar";
import {
  DELETE_SUPER_ADMIN,
  GET_SUPER_ADMIN
} from "../ts/schema";

export interface SuperUser {
    id: string;
    username: string;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
}

export default function SuperUserGrid() {
    const [users, setUsers] = useState<SuperUser[]>([]);
    const [total, setTotal] = useState(0);
    const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
        page: 0,
        pageSize: 10,
    });
    const [search, setSearch] = useState("");

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success" as "success" | "error" | "info" | "warning",
    });

    const [dialogOpen, setDialogOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [selectedUser, setSelectedUser] = useState<SuperUser | null>(null);
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const isMounted = useRef(true);

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [paginationModel, search]);

    const fetchUsers = async () => {
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/graphql`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    query: GET_SUPER_ADMIN,
                    variables: {
                        input: {
                            page: paginationModel.page + 1,
                            pageSize: paginationModel.pageSize,
                            search: search || null,
                        },
                    },
                }),
            });

            const json = await res.json();
            if (!res.ok || json.errors) throw new Error("Failed to fetch users");

            if (isMounted.current) {
                setUsers(json.data.getSuperAdmins.users);
                setTotal(json.data.getSuperAdmins.totalCount);
            }
        } catch (error: any) {
            console.error("Fetch users error:", error);
            showSnackbar(error.message || "Failed to load users", "error");
        }
    };

    const showSnackbar = (message: string, severity: typeof snackbar.severity) => {
        setSnackbar({ open: true, message, severity });
    };

    const handleEdit = (user: SuperUser) => {
        setSelectedUser(user);
        setIsEditing(true);
        setDialogOpen(true);
    };

    const handleDelete = (user: SuperUser) => {
        setSelectedUser(user);
        setDeleteDialogOpen(true);
    };

    const handleConfirmDelete = async () => {
        try {
            if (!selectedUser?.username) {
                throw new Error("Selected user is invalid or missing username.");
            }

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/graphql`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    query: DELETE_SUPER_ADMIN,
                    variables: {
                        input: {
                            username: selectedUser.username,
                            userPoolId: "ap-southeast-2_jYpTYYTfk",
                        },
                    },
                }),
            });

            const json = await res.json();

            if (!res.ok || json.errors) {
                throw new Error(json.errors?.[0]?.message || "Failed to delete user");
            }

            showSnackbar("User deleted successfully!", "success");
            setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id));
        } catch (err: any) {
            showSnackbar(err.message, "error");
        } finally {
            setSelectedUser(null);
            setDeleteDialogOpen(false);
        }
    };


    const columns: GridColDef[] = [
        { field: "id", headerName: "ID", width: 90 },
        { field: "username", headerName: "Username", flex: 1 },
        { field: "first_name", headerName: "First Name", flex: 1 },
        { field: "last_name", headerName: "Last Name", flex: 1 },
        { field: "email", headerName: "Email", flex: 1 },
        { field: "phone_number", headerName: "Phone", flex: 1 },
        {
            field: "actions",
            type: "actions",
            headerName: "Actions",
            getActions: (params) => [
                <GridActionsCellItem label="Edit" onClick={() => handleEdit(params.row)} showInMenu />,
                <GridActionsCellItem label="Delete" onClick={() => handleDelete(params.row)} showInMenu />,
            ],
        },
    ];

    return (
        <Box>
            <GlobalSnackbar
                open={snackbar.open}
                message={snackbar.message}
                severity={snackbar.severity}
                onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
            />

            <SuperUserToolbar
                search={search}
                setSearch={setSearch}
                onCreateClick={() => {
                    setDialogOpen(true);
                    setSelectedUser(null);
                    setIsEditing(false);
                }}
            />
            {/* Optional search bar or toolbar could go here */}

            <Box sx={{ overflowX: "auto" }}>
                <DataGrid
                    rows={users}
                    columns={columns}
                    rowCount={total}
                    pageSizeOptions={[5, 10, 25]}
                    paginationModel={paginationModel}
                    onPaginationModelChange={setPaginationModel}
                    paginationMode="server"
                    autoHeight
                />
            </Box>

            <SuperUserDialog
                open={dialogOpen}
                user={selectedUser}
                inviterName="developer" // or pass as prop if dynamic
                isEditing={isEditing}
                onClose={() => {
                    setDialogOpen(false);
                    setSelectedUser(null);
                }}
                onSuccess={() => {
                    fetchUsers(); // refetch after create/update
                    setDialogOpen(false);
                    setSelectedUser(null);
                }}
                setSnackbar={setSnackbar}
            />

            <SuperUserDeleteDialog
                open={deleteDialogOpen}
                username={selectedUser?.username || ""}
                onClose={() => {
                    setDeleteDialogOpen(false);
                    setSelectedUser(null);
                }}
                onConfirm={handleConfirmDelete}
            />
        </Box>
    );
}
