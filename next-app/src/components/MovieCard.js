"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveCircleIcon from "@mui/icons-material/RemoveCircle";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

const imageBase = "https://image.tmdb.org/t/p/w500";

export default function MovieCard({ movie, entry, onRemove }) {
  const router = useRouter();
  const { status } = useSession();
  const [poster, setPoster] = useState(
    movie.poster_path ? `${imageBase}${movie.poster_path}` : "/no-poster.png",
  );
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const year = movie.release_date?.slice(0, 4) || "Release date unknown";

  async function saveTo(collection) {
    if (status !== "authenticated") {
      router.push(`/login?callbackUrl=${encodeURIComponent("/")}`);
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/collections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ collection, movieId: movie.id }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Movie could not be saved.");
      setMessage(collection === "watchlist" ? "Added to watchlist." : "Added to continue watching.");
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    setBusy(true);
    setMessage("");
    try {
      const params = new URLSearchParams({
        collection: entry.collection,
        movieId: String(movie.id),
      });
      const response = await fetch(`/api/collections?${params}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Movie could not be removed.");
      onRemove?.(movie.id);
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card className="movie-card" variant="outlined">
      <Link href={`https://www.themoviedb.org/movie/${movie.id}`} target="_blank" rel="noreferrer">
        <Box className="poster-frame">
          <Image
            src={poster}
            alt={`${movie.title} poster`}
            fill
            sizes="(max-width: 600px) 45vw, (max-width: 1000px) 25vw, 18vw"
            onError={() => setPoster("/no-poster.png")}
            style={{ objectFit: "cover" }}
          />
        </Box>
      </Link>
      <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
        <Stack direction="row" justifyContent="space-between" gap={1} alignItems="start">
          <Typography component="h3" variant="subtitle1" fontWeight={750} className="movie-title">
            {movie.title}
          </Typography>
          <Chip
            size="small"
            label={`★ ${Number(movie.vote_average || 0).toFixed(1)}`}
            aria-label={`Rating ${Number(movie.vote_average || 0).toFixed(1)} out of 10`}
            sx={{ flexShrink: 0 }}
          />
        </Stack>
        <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
          {year}
        </Typography>
        {entry?.updatedAt && (
          <Typography color="text.secondary" variant="caption" display="block" sx={{ mt: 0.5 }}>
            In progress · updated {new Date(entry.updatedAt).toLocaleDateString()}
          </Typography>
        )}
        {entry ? (
          <Button
            fullWidth
            size="small"
            color="error"
            startIcon={<RemoveCircleIcon />}
            onClick={remove}
            disabled={busy}
            sx={{ mt: 1 }}
          >
            Remove
          </Button>
        ) : (
          <Stack spacing={0.5} sx={{ mt: 1 }}>
            <Button
              fullWidth
              size="small"
              startIcon={<AddIcon />}
              onClick={() => saveTo("watchlist")}
              disabled={busy}
            >
              Watchlist
            </Button>
            <Button
              fullWidth
              size="small"
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => saveTo("continue")}
              disabled={busy}
            >
              In progress
            </Button>
          </Stack>
        )}
        {message && (
          <Alert severity={message.includes("Added") ? "success" : "error"} sx={{ mt: 1 }}>
            {message}
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}
