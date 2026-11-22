import { NextResponse } from "next/server";
import { searchMovies } from "@/lib/tmdb";

export async function GET(request) {
  const params = new URL(request.url).searchParams;
  const query = (params.get("query") || "").trim();
  const page = Number(params.get("page") || "1");

  if (query.length > 100) {
    return NextResponse.json({ error: "Search text must be 100 characters or fewer." }, { status: 400 });
  }
  if (!Number.isInteger(page) || page < 1 || page > 500) {
    return NextResponse.json({ error: "Page must be between 1 and 500." }, { status: 400 });
  }
  if (!query) return NextResponse.json({ results: [] });

  try {
    return NextResponse.json({ results: await searchMovies(query, page) });
  } catch (error) {
    console.error("Movie search failed.", error);
    const status = error.message.includes("not configured") ? 503 : 502;
    return NextResponse.json(
      { error: status === 503 ? error.message : "Movie search is temporarily unavailable." },
      { status },
    );
  }
}
