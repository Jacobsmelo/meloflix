"use client";

import {
  AppBar,
  Box,
  Button,
  Container,
  IconButton,
  Stack,
  Toolbar,
  Tooltip,
  Typography,
} from "@mui/material";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useThemeMode } from "@/components/AppProviders";

const navItems = [
  { label: "Discover", href: "/" },
  { label: "Watchlist", href: "/watchlist" },
  { label: "Continue watching", href: "/continue-watching" },
];

export default function Header() {
  const { data: session, status } = useSession();
  const { mode, setMode } = useThemeMode();

  return (
    <AppBar
      position="relative"
      color="transparent"
      elevation={0}
      sx={{
        zIndex: 1,
        borderBottom: "1px solid",
        borderColor: "divider",
        backdropFilter: "blur(14px)",
      }}
    >
      <Container maxWidth="xl">
        <Toolbar disableGutters sx={{ minHeight: 76, gap: 2, flexWrap: "wrap" }}>
          <Typography
            component={Link}
            href="/"
            variant="h5"
            fontWeight={900}
            letterSpacing="-0.06em"
            sx={{ color: "text.primary", mr: { xs: "auto", md: 2 } }}
          >
            Melo<span className="brand-accent">flix</span>
          </Typography>
          <Stack
            direction="row"
            spacing={{ xs: 0.25, sm: 1 }}
            sx={{ order: { xs: 3, md: 0 }, width: { xs: "100%", md: "auto" }, overflowX: "auto" }}
          >
            {navItems.map((item) => (
              <Button
                component={Link}
                href={item.href}
                key={item.href}
                color="inherit"
                size="small"
                sx={{ whiteSpace: "nowrap" }}
              >
                {item.label}
              </Button>
            ))}
          </Stack>
          <Box sx={{ flex: 1, display: { xs: "none", md: "block" } }} />
          <Tooltip title={`Switch to ${mode === "dark" ? "light" : "dark"} theme`}>
            <IconButton
              color="inherit"
              aria-label={`Switch to ${mode === "dark" ? "light" : "dark"} theme`}
              onClick={() => setMode(mode === "dark" ? "light" : "dark")}
            >
              {mode === "dark" ? <LightModeOutlinedIcon /> : <DarkModeOutlinedIcon />}
            </IconButton>
          </Tooltip>
          {status === "authenticated" ? (
            <Stack direction="row" spacing={1} alignItems="center">
              <Button component={Link} href="/settings" color="inherit">
                Account
              </Button>
              <Button
                variant="outlined"
                color="inherit"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Sign out
              </Button>
            </Stack>
          ) : status === "loading" ? null : (
            <Stack direction="row" spacing={1}>
              <Button component={Link} href="/login" color="inherit">
                Sign in
              </Button>
              <Button component={Link} href="/register" variant="contained">
                Join Meloflix
              </Button>
            </Stack>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
}
