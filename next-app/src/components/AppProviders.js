"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import {
  Alert,
  CssBaseline,
  Snackbar,
  ThemeProvider,
  createTheme,
} from "@mui/material";
import { SessionProvider, useSession } from "next-auth/react";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  Suspense,
  useState,
  useSyncExternalStore,
} from "react";
import AnimatedBackground from "@/components/AnimatedBackground";

const ThemeModeContext = createContext(null);
const themeChangeEvent = "melofix-theme-change";

function subscribeThemeMode(onChange) {
  window.addEventListener("storage", onChange);
  window.addEventListener(themeChangeEvent, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(themeChangeEvent, onChange);
  };
}

function getThemeMode() {
  return window.localStorage.getItem("melofix-theme") === "light" ? "light" : "dark";
}

function getServerThemeMode() {
  return "dark";
}

export function useThemeMode() {
  const context = useContext(ThemeModeContext);
  if (!context) throw new Error("useThemeMode must be used inside AppProviders.");
  return context;
}

function PreferenceSync({ children }) {
  const { status } = useSession();
  const { setMode, setAuthenticated, setError } = useThemeMode();

  useEffect(() => {
    setAuthenticated(status === "authenticated");
  }, [setAuthenticated, status]);

  useEffect(() => {
    if (status !== "authenticated") return;
    let active = true;

    fetch("/api/preferences")
      .then(async (response) => {
        if (!response.ok) throw new Error("Your saved theme could not be loaded.");
        return response.json();
      })
      .then((preferences) => {
        if (active && (preferences.theme === "dark" || preferences.theme === "light")) {
          setMode(preferences.theme, false);
        }
      })
      .catch((error) => {
        console.error("Theme preference sync failed.", error);
        setError(error.message);
      });

    return () => {
      active = false;
    };
  }, [setError, setMode, status]);

  return children;
}

export default function AppProviders({ children }) {
  const mode = useSyncExternalStore(subscribeThemeMode, getThemeMode, getServerThemeMode);
  const [error, setError] = useState("");
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    document.documentElement.dataset.theme = mode;
  }, [mode]);

  const setMode = useCallback(async (nextMode, persist = true) => {
    if (nextMode !== "dark" && nextMode !== "light") return;
    setError("");
    window.localStorage.setItem("melofix-theme", nextMode);
    window.dispatchEvent(new Event(themeChangeEvent));

    if (persist && authenticated) {
      try {
        const response = await fetch("/api/preferences", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ theme: nextMode }),
        });
        const result = await response.json();
        if (!response.ok) {
          setError(result.error || "Theme preference could not be saved.");
        }
      } catch {
        setError("Theme preference could not be saved.");
      }
    }
  }, [authenticated]);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: { main: "#a78bfa" },
          secondary: { main: "#f472b6" },
          background:
            mode === "dark"
              ? { default: "#090a12", paper: "#131522" }
              : { default: "#f7f7fc", paper: "#ffffff" },
        },
        shape: { borderRadius: 16 },
        typography: {
          fontFamily: "Arial, Helvetica, sans-serif",
          button: { textTransform: "none", fontWeight: 700 },
        },
      }),
    [mode],
  );

  return (
    <SessionProvider>
      <AppRouterCacheProvider>
        <ThemeModeContext.Provider value={{ mode, setMode, setAuthenticated, setError }}>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Suspense fallback={<AnimatedBackground mode={mode} />}>
              <PreferenceSync>
                <AnimatedBackground mode={mode} />
                {children}
              </PreferenceSync>
            </Suspense>
            <Snackbar
              open={Boolean(error)}
              autoHideDuration={5000}
              onClose={() => setError("")}
            >
              <Alert severity="error" onClose={() => setError("")}>
                {error}
              </Alert>
            </Snackbar>
          </ThemeProvider>
        </ThemeModeContext.Provider>
      </AppRouterCacheProvider>
    </SessionProvider>
  );
}
