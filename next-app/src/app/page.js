import { connection } from "next/server";
import MovieExplorer from "@/components/MovieExplorer";
import { getPopularMovies, getTrendingMovies } from "@/lib/tmdb";

export default async function HomePage() {
  await connection();
  const [popularResult, trendingResult] = await Promise.allSettled([
    getPopularMovies(),
    getTrendingMovies(),
  ]);
  const popular = popularResult.status === "fulfilled" ? popularResult.value : [];
  const trending = trendingResult.status === "fulfilled" ? trendingResult.value : [];
  const failedResult =
    popularResult.status === "rejected" ? popularResult : trendingResult;
  const initialError =
    failedResult.status === "rejected"
      ? failedResult.reason.message.includes("not configured")
        ? failedResult.reason.message
        : "Movie discovery is temporarily unavailable."
      : "";

  if (failedResult.status === "rejected") {
    console.error("Initial movie discovery failed.", failedResult.reason);
  }

  return (
    <MovieExplorer
      popular={popular}
      trending={trending}
      initialError={initialError}
    />
  );
}
