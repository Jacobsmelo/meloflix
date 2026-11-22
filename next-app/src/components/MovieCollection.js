"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
  Typography,
} from "@mui/material";
import MovieCard from "@/components/MovieCard";
import { sortCollectionEntries } from "@/lib/collection-sort";

const watchlistSorts = [
  { value: "recently-added", label: "Recently added" },
  { value: "oldest-added", label: "Oldest added" },
  { value: "release-newest", label: "Release date: newest" },
  { value: "release-oldest", label: "Release date: oldest" },
  { value: "popularity", label: "Popularity" },
];

export default function MovieCollection({ collection }) {
  const [entries, setEntries] = useState([]);
  const [sort, setSort] = useState("recently-added");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const label = collection === "watchlist" ? "Your watchlist" : "Continue watching";

  useEffect(() => {
    const controller = new AbortController();
    fetch(`/api/collections?collection=${collection}`, { signal: controller.signal })
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Your movies could not be loaded.");
        setEntries(result.results);
      })
      .catch((cause) => {
        if (cause.name !== "AbortError") setError(cause.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [collection]);

  const sortedEntries = sortCollectionEntries(entries, sort);

  return (
    <Container maxWidth="xl" className="page-content">
      <Stack
        direction={{ xs: "column", sm: "row" }}
        alignItems={{ xs: "stretch", sm: "center" }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 3 }}
      >
        <Box>
          <Typography component="h1" variant="h3" fontWeight={850}>{label}</Typography>
          <Typography color="text.secondary" sx={{ mt: 0.5 }}>
            {collection === "watchlist"
              ? "Save movies for later and sort them your way."
              : "Movies you’ve marked as in progress."}
          </Typography>
        </Box>
        {collection === "watchlist" && (
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel id="watchlist-sort-label">Sort by</InputLabel>
            <Select
              labelId="watchlist-sort-label"
              value={sort}
              label="Sort by"
              onChange={(event) => setSort(event.target.value)}
            >
              {watchlistSorts.map((option) => (
                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Stack>
      {error && (
        <Alert
          severity={error.startsWith("Sign in") ? "info" : "error"}
          action={error.startsWith("Sign in") && <Button component={Link} href="/login">Sign in</Button>}
          sx={{ mb: 2 }}
        >
          {error}
        </Alert>
      )}
      {loading ? (
        <Box className="loading-state"><CircularProgress aria-label="Loading saved movies" /></Box>
      ) : !error && sortedEntries.length === 0 ? (
        <Box className="empty-state">
          <Typography variant="h6">Nothing here yet</Typography>
          <Typography color="text.secondary" sx={{ mt: 1 }}>
            Add movies from the discover page to see them here.
          </Typography>
          <Button component={Link} href="/" variant="contained" sx={{ mt: 2 }}>Discover movies</Button>
        </Box>
      ) : (
        <Box className="movie-grid">
          {sortedEntries.map((entry) => (
            <MovieCard
              key={entry.movie.id}
              movie={entry.movie}
              entry={{ ...entry, collection }}
              onRemove={(id) => setEntries((current) => current.filter((item) => item.movie.id !== id))}
            />
          ))}
        </Box>
      )}
    </Container>
  );
}
