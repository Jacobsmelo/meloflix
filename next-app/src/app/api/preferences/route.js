import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDatabase } from "@/lib/db";
import { hasSameOrigin, readJson } from "@/lib/http";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to view your preferences." }, { status: 401 });
  }

  try {
    const { db, schema } = await getDatabase();
    const [preference] = await db
      .select({ theme: schema.preferences.theme })
      .from(schema.preferences)
      .where(eq(schema.preferences.userId, session.user.id))
      .limit(1);

    return NextResponse.json({ theme: preference?.theme || "dark" });
  } catch (error) {
    console.error("Preference lookup failed.", error);
    return NextResponse.json({ error: "Preferences could not be loaded." }, { status: 500 });
  }
}

export async function PATCH(request) {
  if (!hasSameOrigin(request)) {
    return NextResponse.json({ error: "Request origin is not allowed." }, { status: 403 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to save your preferences." }, { status: 401 });
  }

  const body = await readJson(request);
  if (body?.theme !== "dark" && body?.theme !== "light") {
    return NextResponse.json({ error: "Theme must be dark or light." }, { status: 400 });
  }

  try {
    const { db, schema } = await getDatabase();
    await db
      .insert(schema.preferences)
      .values({ userId: session.user.id, theme: body.theme })
      .onConflictDoUpdate({
        target: schema.preferences.userId,
        set: { theme: body.theme },
      });

    return NextResponse.json({ theme: body.theme });
  } catch (error) {
    console.error("Preference update failed.", error);
    return NextResponse.json({ error: "Preferences could not be saved." }, { status: 500 });
  }
}
