"use client";

import {
  Box,
  TextField,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  MenuItem,
  Select,
  Alert,
  Snackbar,
} from "@mui/material";
import {
  DataGrid,
  GridColDef,
  GridPaginationModel,
  GridActionsCellItem,
} from "@mui/x-data-grid";
import { useEffect, useState } from "react";
import { useGlobalLoader } from "@/context/loader-context";

interface SuperUser {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
}

export default function SuperUserTable() {
  const [users, setUsers] = useState<SuperUser[]>([]);
  const [total, setTotal] = useState(0);
  const [paginationModel, setPaginationModel] = useState<GridPaginationModel>({
    page: 0,
    pageSize: 10,
  });
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedUser, setSelectedUser] = useState<SuperUser | null>(null);
  const [newUser, setNewUser] = useState<
    Partial<SuperUser> & { phone?: string; countryCode?: string }
  >({ countryCode: "+91" });
  const [error, setError] = useState<string | null>(null);
  const [inviterName, setInviterName] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<SuperUser | null>(null);
  const { showLoader, hideLoader } = useGlobalLoader();
  const [searchFocused, setSearchFocused] = useState(false);

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  const supportedCountryCodes = ["+91", "+1", "+44", "+61", "+971"];

  // Validators
  const isValidUsername = (username: string) =>
    username.length <= 50 && /^[a-zA-Z0-9_]+$/.test(username);

  const isValidName = (name: string) =>
    name.length <= 50 && /^[a-zA-Z\s]+$/.test(name);

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isPhoneValid = (phone: string) => /^[0-9]{6,14}$/.test(phone);

  // Get current user (inviter)
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`, {
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((user) => {
        if (user?.username) setInviterName(user.username);
      });
  }, []);

  // Fetch Super Admin Users
  const fetchUsers = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/graphql`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          query: `
        query GetSuperAdmins($input: PaginatedUsersInput!) {
          getSuperAdmins(input: $input) {
            users {
              id
              username
              first_name
              last_name
              email
              phone_number
            }
            totalCount
          }
        }
      `,
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
      if (json?.data?.getSuperAdmins) {
        setUsers(json.data.getSuperAdmins.users);
        setTotal(json.data.getSuperAdmins.totalCount);
      }
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  useEffect(() => {
    let isMounted = true;

    fetchUsers();

    return () => {
      isMounted = false;
    };
  }, [paginationModel, search]);

  // Create User Mutation
  const createUserMutation = async (input: any) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        query: `
          mutation CreateUser($input: CreateUserInput!) {
            createUser(input: $input) {
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
      const message =
        json.errors?.[0]?.message || "Failed to create user. Try again.";
      throw new Error(message);
    }

    return json.data.createUser;
  };

  // Update User Mutation
  const updateUserMutation = async (input: any) => {
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
      const message =
        json.errors?.[0]?.message || "Failed to update user. Try again.";
      throw new Error(message);
    }

    return json.data.updateUser;
  };

  // Add or Update User
  const handleAddOrUpdateUser = async () => {
    setError(null);
    const fullPhone =
      newUser.phone && newUser.countryCode
        ? `${newUser.countryCode}${newUser.phone}`
        : "";

    const input = {
      username: newUser.username,
      email: newUser.email,
      userPoolId: "ap-southeast-2_jYpTYYTfk",
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      inviter_name: inviterName,
      phone_number: fullPhone,
      users_role: "Super Admin",
      groups: ["*"],
    };

    try {
      if (isEditing && selectedUser) {
        await updateUserMutation(input);
        setSnackbar({
          open: true,
          message: "User updated successfully!",
          severity: "success",
        });
      } else {
        await createUserMutation(input);
        setSnackbar({
          open: true,
          message: "User created successfully!",
          severity: "success",
        });
      }

      await fetchUsers();
      setDialogOpen(false);
      setNewUser({ countryCode: "+91" });
      setSelectedUser(null);
      setIsEditing(false);
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message, severity: "error" });
    }
  };

  const handleEdit = (id: number) => {
    const user = users.find((u) => u.id === id);
    if (user) {
      let countryCode = "+91";
      let phone = user.phone_number;
      for (const code of supportedCountryCodes) {
        if (phone.startsWith(code)) {
          countryCode = code;
          phone = phone.slice(code.length);
          break;
        }
      }

      setSelectedUser(user);
      setIsEditing(true);
      setNewUser({
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        email: user.email,
        phone,
        countryCode,
      });
      setDialogOpen(true);
    }
  };

  const handleDelete = (id: number) => {
    const user = users.find((u) => u.id === id);
    if (user) {
      setUserToDelete(user);
      setDeleteDialogOpen(true);
    }
  };

  const deleteUserMutation = async (username: string) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/graphql`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({
        query: `
          mutation DeleteUser($input: DeleteUserInput!) {
            deleteUser(input: $input)
          }
        `,
        variables: {
          input: {
            username,
            userPoolId: "ap-southeast-2_jYpTYYTfk",
          },
        },
      }),
    });

    const json = await res.json();
    if (!res.ok || json.errors) {
      throw new Error(json.errors?.[0]?.message || "Failed to delete user");
    }

    return true;
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;

    try {
      await deleteUserMutation(userToDelete.username);
      setSnackbar({
        open: true,
        message: "User deleted successfully",
        severity: "success",
      });
      setDeleteDialogOpen(false);
      setUserToDelete(null);
      await fetchUsers();
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message, severity: "error" });
    }
  };

  const columns: GridColDef[] = [
    { field: "username", headerName: "Username", flex: 1 },
    { field: "first_name", headerName: "First Name", flex: 1 },
    { field: "last_name", headerName: "Last Name", flex: 1 },
    { field: "email", headerName: "Email", flex: 1.5 },
    { field: "phone_number", headerName: "Phone", flex: 1 },
    {
      field: "actions",
      type: "actions",
      headerName: "Actions",
      getActions: (params) => [
        <GridActionsCellItem
          icon={<span className="material-symbols-outlined">edit</span>}
          label="Edit"
          onClick={() => handleEdit(params.id as number)}
        />,
        <GridActionsCellItem
          icon={<span className="material-symbols-outlined">delete</span>}
          label="Delete"
          onClick={() => handleDelete(params.id as number)}
        />,
      ],
    },
  ];

  return (
    <Box>
      {/* Header */}
      <Box
        mb={2}
        display="flex"
        flexDirection="column"
        gap={1}
      >
        <Typography variant="h6">Super Admin Users</Typography>

        <Box
          display="flex"
          flexWrap="wrap"
          alignItems="center"
          justifyContent="flex-end" // 👈 Aligns content to right
          gap={1}
          sx={{
            width: "100%",
          }}
        >
          <TextField
            placeholder="Search..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              minWidth: "100px",
              width: {
                xs: "150px",
                sm: "200px",
              },
            }}
          />

          <Button
            variant="contained"
            onClick={() => {
              setDialogOpen(true);
              setNewUser({ countryCode: "+91" });
              setSelectedUser(null);
              setIsEditing(false);
            }}
            sx={{
              whiteSpace: "nowrap",
              fontSize: {
                xs: "0.75rem",
                sm: "0.875rem",
              },
              px: {
                xs: 1.5,
                sm: 2.5,
              },
              py: {
                xs: 0.75,
                sm: 1,
              },
            }}
          >
            + Create Super Admin
          </Button>
        </Box>
      </Box>

      {/* Data Table */}
      <Box sx={{ overflowX: 'auto' }}>
        <Box minWidth={600}>
          <DataGrid
            rows={users}
            columns={columns}
            rowCount={total}
            paginationMode="server"
            paginationModel={paginationModel}
            onPaginationModelChange={setPaginationModel}
            pageSizeOptions={[10, 20, 50]}
            autoHeight
            disableRowSelectionOnClick
            getRowId={(row) => row.id}
            sx={{
              bgcolor: "#fff",
              borderRadius: 2,
              boxShadow: 2,
              border: "1px solid #e0e0e0",
              fontSize: 14,
              "& .MuiDataGrid-columnHeaders": {
                bgcolor: "#f9fafb",
                fontWeight: "bold",
              },
              "& .MuiDataGrid-row:hover": {
                bgcolor: "#f5f5f5",
              },
              "& .MuiDataGrid-footerContainer": {
                bgcolor: "#f9fafb",
              },
              "& .MuiDataGrid-cell:focus, & .MuiDataGrid-columnHeader:focus": {
                outline: "none",
              },
            }}
          />
        </Box>
      </Box>


      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {isEditing ? "Edit Super Admin" : "Create Super Admin"}
        </DialogTitle>
        <DialogContent dividers>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            required
            label="Username"
            fullWidth
            value={newUser.username || ""}
            onChange={(e) =>
              setNewUser({ ...newUser, username: e.target.value })
            }
            error={!!newUser.username && !isValidUsername(newUser.username)}
            helperText={
              newUser.username && !isValidUsername(newUser.username)
                ? "Username must be 50 characters or fewer and must not contain spaces"
                : ""
            }
            sx={{ my: 2 }}
          />

          <Box display="flex" gap={2}>
            <TextField
              required
              label="First Name"
              fullWidth
              value={newUser.first_name || ""}
              onChange={(e) =>
                setNewUser({ ...newUser, first_name: e.target.value })
              }
              error={!!newUser.first_name && !isValidName(newUser.first_name)}
              helperText={
                newUser.first_name && !isValidName(newUser.first_name)
                  ? "Only letters and max 50 characters allowed"
                  : ""
              }
            />

            <TextField
              label="Last Name"
              fullWidth
              value={newUser.last_name || ""}
              onChange={(e) =>
                setNewUser({ ...newUser, last_name: e.target.value })
              }
              error={!!newUser.last_name && !isValidName(newUser.last_name)}
              helperText={
                newUser.last_name && !isValidName(newUser.last_name)
                  ? "Only letters and max 50 characters allowed"
                  : ""
              }
            />
          </Box>

          <TextField
            required
            label="Email"
            fullWidth
            type="email"
            value={newUser.email || ""}
            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
            error={!!newUser.email && !isValidEmail(newUser.email)}
            helperText={
              newUser.email && !isValidEmail(newUser.email)
                ? "Enter a valid email address"
                : ""
            }
            sx={{ my: 2 }}
          />

          <Box display="flex" gap={1}>
            <Select
              value={newUser.countryCode}
              onChange={(e) =>
                setNewUser({ ...newUser, countryCode: e.target.value })
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
              value={newUser.phone || ""}
              onChange={(e) =>
                setNewUser({ ...newUser, phone: e.target.value })
              }
              error={!!newUser.phone && !isPhoneValid(newUser.phone)}
              helperText={
                newUser.phone && !isPhoneValid(newUser.phone)
                  ? "Enter 6–14 digits only"
                  : ""
              }
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleAddOrUpdateUser}
            variant="contained"
            disabled={
              !newUser.username ||
              !isValidUsername(newUser.username) ||
              !newUser.first_name ||
              !isValidName(newUser.first_name) ||
              (newUser.last_name && !isValidName(newUser.last_name)) ||
              !newUser.email ||
              !isValidEmail(newUser.email) ||
              (!!newUser.phone && !isPhoneValid(newUser.phone))
            }
          >
            {isEditing ? "Update" : "Create"} Super admin
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          Are you sure you want to delete{" "}
          <strong>{userToDelete?.username}</strong>?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={confirmDeleteUser}
            variant="contained"
            color="error"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} onClose={handleSnackbarClose}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
