"use client";

import { useState } from "react";
import Link from "next/link";
import { signIn } from "next-auth/react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

export default function AuthForm({ mode }) {
  const isRegister = mode === "register";
  const [values, setValues] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function update(field) {
    return (event) => setValues((current) => ({ ...current, [field]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setError("");
    setBusy(true);

    try {
      if (isRegister) {
        const response = await fetch("/api/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(values),
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Account could not be created.");
      }

      const result = await signIn("credentials", {
        email: values.email,
        password: values.password,
        redirect: false,
        callbackUrl: "/",
      });
      if (result?.error) throw new Error("Email or password is incorrect.");
      window.location.assign(result?.url || "/");
    } catch (cause) {
      setError(cause.message || "Sign-in could not be completed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Box className="auth-panel">
      <Typography variant="overline" color="secondary.main" fontWeight={800}>
        Welcome to Meloflix
      </Typography>
      <Typography component="h1" variant="h4" fontWeight={850} sx={{ mt: 0.5 }}>
        {isRegister ? "Create your account" : "Sign in"}
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 1, mb: 3 }}>
        {isRegister
          ? "Keep your watchlist and preferences in one place."
          : "Pick up where you left off."}
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Stack component="form" spacing={2} onSubmit={submit}>
        {isRegister && (
          <TextField
            required
            label="Name"
            autoComplete="name"
            value={values.name}
            onChange={update("name")}
            inputProps={{ maxLength: 80 }}
          />
        )}
        <TextField
          required
          label="Email"
          type="email"
          autoComplete="email"
          value={values.email}
          onChange={update("email")}
          inputProps={{ maxLength: 254 }}
        />
        <TextField
          required
          label="Password"
          type="password"
          autoComplete={isRegister ? "new-password" : "current-password"}
          value={values.password}
          onChange={update("password")}
          inputProps={{ minLength: isRegister ? 12 : undefined, maxLength: 128 }}
          helperText={isRegister ? "Use at least 12 characters." : undefined}
        />
        <Button type="submit" variant="contained" size="large" disabled={busy}>
          {busy ? <CircularProgress size={22} color="inherit" /> : isRegister ? "Create account" : "Sign in"}
        </Button>
      </Stack>
      <Typography color="text.secondary" variant="body2" sx={{ mt: 3 }}>
        {isRegister ? "Already have an account? " : "New to Meloflix? "}
        <Link href={isRegister ? "/login" : "/register"} className="text-link">
          {isRegister ? "Sign in" : "Create an account"}
        </Link>
      </Typography>
    </Box>
  );
}
