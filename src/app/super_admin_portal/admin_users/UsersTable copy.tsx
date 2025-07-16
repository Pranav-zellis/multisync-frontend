"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  MenuItem,
  Alert,
  Select
} from "@mui/material";

interface SuperUser {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
}

const initialUsers: SuperUser[] = [];

export default function UserTable() {
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState<SuperUser[]>(initialUsers);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newUser, setNewUser] = useState<
    Partial<SuperUser> & { countryCode?: string }
  >({
    countryCode: "+91",
  });
  const [inviterName, setInviterName] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/me`, {
      credentials: "include",
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((user) => {
        if (user?.username) setInviterName(user.username);
      });
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) =>
      `${user.username} ${user.first_name} ${user.last_name} ${user.email} ${user.phone}`
        .toLowerCase()
        .includes(search.toLowerCase())
    );
  }, [search, users]);

  const isEmailValid = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const isPhoneValid = (phone: string) => /^[0-9]{6,14}$/.test(phone);

  const createUserMutation = async (input: any) => {
    const res = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL+"/graphql", {
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

  const handleAddUser = async () => {
    setError(null);

    if (
      newUser.username &&
      newUser.first_name &&
      newUser.last_name &&
      newUser.email &&
      isEmailValid(newUser.email) &&
      newUser.phone &&
      isPhoneValid(newUser.phone) &&
      inviterName
    ) {
      const input = {
        username: newUser.username,
        email: newUser.email,
        userPoolId: "ap-southeast-2_jYpTYYTfk", // Your actual pool
        first_name: newUser.first_name,
        last_name: newUser.last_name,
        inviter_name: inviterName,
      };

      try {
        await createUserMutation(input);

        setUsers((prev) => [
          ...prev,
          {
            id: Date.now(),
            ...newUser,
            phone: `${newUser.countryCode} ${newUser.phone}`,
          } as SuperUser,
        ]);

        setDialogOpen(false);
        setNewUser({ countryCode: "+91" });
      } catch (err: any) {
        setError(err.message);
      }
    }
  };

  return (
    <>
      {/* Search + Button */}
      <div className="flex justify-between items-center mb-4">
        <TextField
          placeholder="Search users..."
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md"
        />
        <Button
          variant="contained"
          className="ml-4"
          sx={{
            backgroundColor: "#FF9800",
            textTransform: "none",
            borderRadius: 2,
            px: 3,
          }}
          onClick={() => {
            setDialogOpen(true);
            setError(null);
          }}
        >
          + Add Super User
        </Button>
      </div>

      {/* Table */}
      <TableContainer
        component={Paper}
        sx={{ maxHeight: "calc(100vh - 250px)", overflow: "auto" }}
      >
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                <strong>Username</strong>
              </TableCell>
              <TableCell>
                <strong>First Name</strong>
              </TableCell>
              <TableCell>
                <strong>Last Name</strong>
              </TableCell>
              <TableCell>
                <strong>Email</strong>
              </TableCell>
              <TableCell>
                <strong>Phone</strong>
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.first_name}</TableCell>
                  <TableCell>{user.last_name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center">
                  No users found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Dialog Form */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle className="text-center text-xl font-semibold mb-1">
          Create New Super Admin
        </DialogTitle>
        <DialogContent dividers>
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          <form className="space-y-6 mt-2">
            <TextField
              label="Username"
              variant="outlined"
              fullWidth
              value={newUser.username || ""}
              onChange={(e) =>
                setNewUser({ ...newUser, username: e.target.value })
              }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <TextField
                label="First Name"
                fullWidth
                value={newUser.first_name || ""}
                onChange={(e) =>
                  setNewUser({ ...newUser, first_name: e.target.value })
                }
              />
              <TextField
                label="Last Name"
                fullWidth
                value={newUser.last_name || ""}
                onChange={(e) =>
                  setNewUser({ ...newUser, last_name: e.target.value })
                }
              />
            </div>

            <TextField
              label="Email"
              fullWidth
              type="email"
              value={newUser.email || ""}
              onChange={(e) =>
                setNewUser({ ...newUser, email: e.target.value })
              }
              error={!!newUser.email && !isEmailValid(newUser.email)}
              helperText={
                newUser.email && !isEmailValid(newUser.email)
                  ? "Enter a valid email"
                  : ""
              }
            />

            <div className="space-y-1 pt-2">
              <Typography variant="body2" className="text-gray-600 pt-2">
                Phone number (optional)
              </Typography>
              <div className="flex gap-2">
                <Select
                  labelId="country-code-label"
                  value={newUser.countryCode || "+91"}
                  onChange={(e) =>
                    setNewUser({ ...newUser, countryCode: e.target.value })
                  }
                  displayEmpty
                  size="small"
                  sx={{
                    "& .MuiSelect-select": {
                      paddingTop: 1,
                      paddingBottom: 1,
                    },
                  }}
                >
                  <MenuItem value="+91">🇮🇳 +91</MenuItem>
                  <MenuItem value="+1">🇺🇸 +1</MenuItem>
                  <MenuItem value="+44">🇬🇧 +44</MenuItem>
                  <MenuItem value="+61">🇦🇺 +61</MenuItem>
                  <MenuItem value="+971">🇦🇪 +971</MenuItem>
                </Select>

                <TextField
                  fullWidth
                  placeholder="9876543210"
                  value={newUser.phone || ""}
                  onChange={(e) =>
                    setNewUser({ ...newUser, phone: e.target.value })
                  }
                  inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                  error={!!newUser.phone && !isPhoneValid(newUser.phone)}
                  helperText={
                    newUser.phone && !isPhoneValid(newUser.phone)
                      ? "Enter a valid phone number (6–14 digits)"
                      : ""
                  }
                />
              </div>
            </div>
          </form>
        </DialogContent>

        <DialogActions className="justify-center pb-4 pt-2">
          <Button
            variant="contained"
            onClick={handleAddUser}
            disabled={
              !newUser.username ||
              !newUser.first_name ||
              !newUser.last_name ||
              !newUser.email ||
              !isEmailValid(newUser.email)
            }
            sx={{
              textTransform: "none",
              borderRadius: "8px",
              px: 3,
              py: 1.5,
              fontWeight: 600,
              bgcolor: "#000",
              color: "#fff",
              "&:hover": {
                bgcolor: "#222",
              },
            }}
          >
            Create Super Admin User
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
