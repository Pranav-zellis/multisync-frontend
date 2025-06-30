"use client";

import {
  Box,
  Button,
  Container,
  TextField,
  Typography,
  Paper,
  Link,
  Snackbar,
  Alert,
} from "@mui/material";
import { useForm } from "react-hook-form";
import Image from "next/image";
import { useState } from "react";

type LoginFormInputs = {
  tenantId: string;
  email: string;
  password: string;
};

export default function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormInputs>({
    defaultValues: {
      tenantId: "121212",
      email: "hemang@zellis.com.au",
      password: "admin@123",
    },
  });

  const [loading, setLoading] = useState(false);
  const [successOpen, setSuccessOpen] = useState(false);
  const [errorOpen, setErrorOpen] = useState(false);

  const onSubmit = async (data: LoginFormInputs) => {
    setLoading(true);
    setSuccessOpen(false); // close success if open
    setErrorOpen(false); // close error if open

    // Simulate async login delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    if (
      data.tenantId !== "121212" ||
      data.email !== "hemang@zellis.com.au" ||
      data.password !== "admin@123"
    ) {
      setErrorOpen(true); // show error only
      setLoading(false);
      return;
    }

    setSuccessOpen(true); // show success only
    setLoading(false);
  };

  return (
    <>
      {/* Loader overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-black border-solid">
            {" "}
          </div>
        </div>
      )}

      {/* Success Snackbar */}
      <Snackbar
        open={errorOpen}
        autoHideDuration={3000}
        onClose={() => setErrorOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={() => setErrorOpen(false)}
          severity="error"
          variant="filled"
          sx={{ width: "100%" }}
        >
          Invalid credentials!
        </Alert>
      </Snackbar>

      {/* Login Form */}
      <Container
        component="main"
        maxWidth="xs"
        sx={{ minHeight: "100vh", display: "flex", alignItems: "center" }}
      >
        <Paper elevation={3} sx={{ width: "100%", p: 4, borderRadius: 3 }}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <Box sx={{ mb: 2 }}>
              <Image
                src="/images/logo-dark-new.png"
                alt="Company Logo"
                width={170}
                height={170}
              />
            </Box>

            <Box
              component="form"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              sx={{ mt: 1 }}
            >
              <TextField
                fullWidth
                margin="normal"
                label="Tenant ID"
                {...register("tenantId", { required: "Tenant ID is required" })}
                error={!!errors.tenantId}
                helperText={errors.tenantId?.message}
              />

              <TextField
                fullWidth
                margin="normal"
                label="Email"
                type="email"
                {...register("email", { required: "Email is required" })}
                error={!!errors.email}
                helperText={errors.email?.message}
              />

              <TextField
                fullWidth
                margin="normal"
                label="Password"
                type="password"
                {...register("password", { required: "Password is required" })}
                error={!!errors.password}
                helperText={errors.password?.message}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                disabled={loading}
                sx={{
                  mt: 3,
                  bgcolor: "black",
                  color: "white",
                  fontWeight: "bold",
                  borderRadius: 2,
                  py: 1.5,
                  "&:hover": {
                    bgcolor: "#222",
                  },
                }}
              >
                {loading ? "Logging in..." : "Log in"}
              </Button>

              <Box sx={{ mt: 2, textAlign: "center" }}>
                <Link
                  href="#"
                  underline="hover"
                  variant="body2"
                  display="block"
                  sx={{ mt: 0.5 }}
                >
                  Reset password
                </Link>
              </Box>
            </Box>
          </Box>
        </Paper>
      </Container>
    </>
  );
}
