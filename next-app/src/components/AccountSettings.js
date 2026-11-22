"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useThemeMode } from "@/components/AppProviders";

export default function AccountSettings() {
  const { status } = useSession();
  const { mode, setMode } = useThemeMode();
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (status !== "authenticated") return;
    let active = true;
    fetch("/api/profile")
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Account details could not be loaded.");
        if (active) setProfile(result);
      })
      .catch((cause) => {
        if (active) setError(cause.message);
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [status]);

  async function saveProfile(event) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(profile),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Account details could not be saved.");
      setProfile(result);
      setMessage("Account details saved.");
    } catch (cause) {
      setError(cause.message);
    } finally {
      setBusy(false);
    }
  }

  if (status === "loading" || (status === "authenticated" && loading)) {
    return <Box className="loading-state"><CircularProgress aria-label="Loading account" /></Box>;
  }
  if (status !== "authenticated") {
    return (
      <Container maxWidth="sm" className="page-content">
        <Alert severity="info" action={<Button component={Link} href="/login">Sign in</Button>}>
          Sign in to manage your account and theme preferences.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" className="page-content">
      <Typography component="h1" variant="h3" fontWeight={850}>Account settings</Typography>
      <Typography color="text.secondary" sx={{ mt: 0.5, mb: 3 }}>
        Update your profile and saved display preferences.
      </Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {message && <Alert severity="success" sx={{ mb: 2 }}>{message}</Alert>}
      <Stack spacing={3}>
        <Box component="form" className="settings-panel" onSubmit={saveProfile}>
          <Typography component="h2" variant="h6" fontWeight={800} sx={{ mb: 2 }}>
            Profile
          </Typography>
          <Stack spacing={2}>
            <TextField
              label="Name"
              required
              value={profile.name}
              onChange={(event) => setProfile((current) => ({ ...current, name: event.target.value }))}
              inputProps={{ maxLength: 80 }}
            />
            <TextField
              label="Email"
              required
              type="email"
              value={profile.email}
              onChange={(event) => setProfile((current) => ({ ...current, email: event.target.value }))}
              inputProps={{ maxLength: 254 }}
            />
            <Button type="submit" variant="contained" disabled={busy} sx={{ alignSelf: "start" }}>
              {busy ? "Saving…" : "Save profile"}
            </Button>
          </Stack>
        </Box>
        <Box className="settings-panel">
          <Typography component="h2" variant="h6" fontWeight={800} sx={{ mb: 2 }}>
            Appearance
          </Typography>
          <FormControl sx={{ minWidth: 180 }}>
            <InputLabel id="theme-select-label">Theme</InputLabel>
            <Select
              labelId="theme-select-label"
              value={mode}
              label="Theme"
              onChange={(event) => setMode(event.target.value)}
            >
              <MenuItem value="dark">Dark</MenuItem>
              <MenuItem value="light">Light</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Stack>
    </Container>
  );
}
