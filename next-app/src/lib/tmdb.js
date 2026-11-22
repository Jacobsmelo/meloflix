const API_BASE_URL = "https://api.themoviedb.org/3";

function getToken() {
  const token = process.env.TMDB_ACCESS_TOKEN;
  if (!token) throw new Error("TMDB_ACCESS_TOKEN is not configured.");
  return token;
}

async function request(path, { query, page = 1 } = {}) {
  const url = new URL(`${API_BASE_URL}${path}`);
  if (query) url.searchParams.set("query", query);
  if (page) url.searchParams.set("page", String(page));

  const response = await fetch(url, {
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    ...(query
      ? { cache: "no-store" }
      : { next: { revalidate: 1800 } }),
  });

  if (!response.ok) {
    throw new Error(`TMDB request failed with status ${response.status}.`);
  }

  const payload = await response.json();
  if (!Array.isArray(payload.results)) {
    throw new Error("TMDB returned an invalid movie response.");
  }
  return payload.results;
}

export function getPopularMovies() {
  return request("/movie/popular");
}

export function getTrendingMovies() {
  return request("/trending/movie/week");
}

export function searchMovies(query, page = 1) {
  return request("/search/movie", { query, page });
}

export async function getMovieById(movieId) {
  const response = await fetch(`${API_BASE_URL}/movie/${movieId}`, {
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    next: { revalidate: 1800 },
  });

  if (!response.ok) {
    throw new Error(`TMDB movie lookup failed with status ${response.status}.`);
  }
  return response.json();
}
