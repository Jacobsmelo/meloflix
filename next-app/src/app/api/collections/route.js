import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  getCollectionTable,
  listCollectionEntries,
  removeCollectionEntry,
} from "@/lib/collections";
import { getDatabase } from "@/lib/db";
import { hasSameOrigin, readJson, validMovieId } from "@/lib/http";
import { getMovieById } from "@/lib/tmdb";

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to view your movies." }, { status: 401 });
  }

  const collection = new URL(request.url).searchParams.get("collection");
  try {
    const { db, schema } = await getDatabase();
    if (!getCollectionTable(schema, collection)) {
      return NextResponse.json({ error: "Unknown collection." }, { status: 400 });
    }

    const entries = await listCollectionEntries(db, schema, session.user.id, collection);
    const movies = await Promise.all(
      entries.map(async (entry) => ({
        ...entry,
        movie: await getMovieById(entry.movieId),
      })),
    );

    return NextResponse.json({ results: movies });
  } catch (error) {
    console.error("Collection lookup failed.", error);
    const status = error.message.includes("not configured") ? 503 : 502;
    return NextResponse.json(
      { error: status === 503 ? error.message : "Your movies could not be loaded." },
      { status },
    );
  }
}

export async function POST(request) {
  if (!hasSameOrigin(request)) {
    return NextResponse.json({ error: "Request origin is not allowed." }, { status: 403 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to save movies." }, { status: 401 });
  }

  const body = await readJson(request);
  if (
    (body?.collection !== "watchlist" && body?.collection !== "continue") ||
    !validMovieId(body?.movieId)
  ) {
    return NextResponse.json({ error: "Choose a valid movie and collection." }, { status: 400 });
  }

  try {
    const { db, schema } = await getDatabase();
    const target = getCollectionTable(schema, body.collection);
    const now = new Date().toISOString();
    const values =
      body.collection === "watchlist"
        ? { userId: session.user.id, movieId: body.movieId, addedAt: now }
        : {
            userId: session.user.id,
            movieId: body.movieId,
            addedAt: now,
            updatedAt: now,
          };

    if (body.collection === "continue") {
      await db
        .insert(target)
        .values(values)
        .onConflictDoUpdate({
          target: [target.userId, target.movieId],
          set: { updatedAt: now },
        });
    } else {
      await db.insert(target).values(values).onConflictDoNothing();
    }

    return NextResponse.json({ saved: true }, { status: 201 });
  } catch (error) {
    console.error("Movie save failed.", error);
    return NextResponse.json({ error: "Movie could not be saved." }, { status: 500 });
  }
}

export async function DELETE(request) {
  if (!hasSameOrigin(request)) {
    return NextResponse.json({ error: "Request origin is not allowed." }, { status: 403 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to update your movies." }, { status: 401 });
  }

  const params = new URL(request.url).searchParams;
  const collection = params.get("collection");
  const movieId = Number(params.get("movieId"));

  try {
    const { db, schema } = await getDatabase();
    if (!getCollectionTable(schema, collection) || !validMovieId(movieId)) {
      return NextResponse.json({ error: "Choose a valid movie and collection." }, { status: 400 });
    }

    await removeCollectionEntry(db, schema, session.user.id, collection, movieId);
    return NextResponse.json({ removed: true });
  } catch (error) {
    console.error("Movie removal failed.", error);
    return NextResponse.json({ error: "Movie could not be removed." }, { status: 500 });
  }
}
