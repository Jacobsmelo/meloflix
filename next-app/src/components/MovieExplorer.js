"use client";

import { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Container,
  InputAdornment,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import Image from "next/image";
import MovieCard from "@/components/MovieCard";

function MovieGrid({ movies, loading, onEmpty }) {
  if (loading) {
    return (
      <Box className="movie-grid" aria-label="Loading movies">
        {Array.from({ length: 10 }, (_, index) => (
          <Box key={index}>
            <Skeleton variant="rounded" height={260} />
            <Skeleton width="75%" />
          </Box>
        ))}
      </Box>
    );
  }
  if (!movies.length) return onEmpty;
  return (
    <Box className="movie-grid">
      {movies.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
    </Box>
  );
}

export default function MovieExplorer({ popular, trending, initialError = "" }) {
  const [query, setQuery] = useState("");
  const [movies, setMovies] = useState(popular);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(initialError);
  const searching = Boolean(query.trim());

  useEffect(() => {
    const value = query.trim();
    if (!value) return;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true);
      setError("");
      try {
        const response = await fetch(`/api/movies?query=${encodeURIComponent(value)}`, {
          signal: controller.signal,
        });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Search is unavailable.");
        setMovies(result.results);
      } catch (cause) {
        if (cause.name !== "AbortError") {
          setError(cause.message);
          setMovies([]);
        }
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }, 350);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  return (
    <Container maxWidth="xl" className="page-content">
      <Box component="header" className="hero">
        <Image
          src="/hero-img.png"
          alt=""
          width={220}
          height={160}
          priority
          className="hero-art"
        />
        <Typography variant="overline" color="secondary.main" fontWeight={800}>
          Your next favorite is waiting
        </Typography>
        <Typography component="h1" variant="h2" fontWeight={900} className="hero-title">
          Find movies <span className="brand-accent">you’ll love</span>
        </Typography>
        <Typography color="text.secondary" sx={{ maxWidth: 560, mt: 1.5 }}>
          Explore what’s popular, find a new favorite, and keep your own watchlist close.
        </Typography>
        <TextField
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search movies"
          inputProps={{ "aria-label": "Search movies" }}
          fullWidth
          sx={{ maxWidth: 620, mt: 4 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      {!searching && trending.length > 0 && (
        <Box component="section" aria-labelledby="trending-title" sx={{ mt: 6 }}>
          <Typography id="trending-title" component="h2" variant="h4" fontWeight={800} sx={{ mb: 2 }}>
            Trending this week
          </Typography>
          <Stack
            direction="row"
            spacing={2}
            className="trending-row"
            role="list"
            aria-label="Trending movies"
            tabIndex={0}
          >
            {trending.slice(0, 12).map((movie, index) => (
              <Box className="trending-item" key={movie.id} role="listitem">
                <Image
                  src={movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : "/no-poster.png"}
                  alt=""
                  fill
                  sizes="170px"
                  className="trending-poster"
                />
                <Typography className="trending-rank">{String(index + 1).padStart(2, "0")}</Typography>
                <Typography className="trending-title" variant="subtitle2" fontWeight={750} noWrap>
                  {movie.title}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      <Box component="section" aria-labelledby="movies-title" sx={{ mt: 6 }}>
        <Stack direction="row" alignItems="baseline" spacing={1} sx={{ mb: 2 }}>
          <Typography id="movies-title" component="h2" variant="h4" fontWeight={800}>
            {searching ? "Search results" : "Popular movies"}
          </Typography>
          {searching && <Typography color="text.secondary">for “{query}”</Typography>}
        </Stack>
        {(searching ? error : initialError) && (
          <Alert severity="error" sx={{ mb: 2 }}>{searching ? error : initialError}</Alert>
        )}
        <MovieGrid
          movies={searching ? movies : popular}
          loading={searching && loading}
          onEmpty={<Typography color="text.secondary">No movies found. Try another title.</Typography>}
        />
      </Box>
    </Container>
  );
}
