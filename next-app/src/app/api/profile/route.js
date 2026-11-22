import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getDatabase } from "@/lib/db";
import { hasSameOrigin, readJson } from "@/lib/http";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to view your account." }, { status: 401 });
  }

  try {
    const { db, schema } = await getDatabase();
    const [user] = await db
      .select({ name: schema.users.name, email: schema.users.email })
      .from(schema.users)
      .where(eq(schema.users.id, session.user.id))
      .limit(1);

    if (!user) return NextResponse.json({ error: "Account not found." }, { status: 404 });
    return NextResponse.json(user);
  } catch (error) {
    console.error("Profile lookup failed.", error);
    return NextResponse.json({ error: "Account details could not be loaded." }, { status: 500 });
  }
}

export async function PATCH(request) {
  if (!hasSameOrigin(request)) {
    return NextResponse.json({ error: "Request origin is not allowed." }, { status: 403 });
  }

  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in to update your account." }, { status: 401 });
  }

  const body = await readJson(request);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  if (name.length < 1 || name.length > 80) {
    return NextResponse.json({ error: "Name must be 1–80 characters." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }

  try {
    const { db, schema } = await getDatabase();
    const [user] = await db
      .update(schema.users)
      .set({ name, email, updatedAt: new Date().toISOString() })
      .where(eq(schema.users.id, session.user.id))
      .returning({ name: schema.users.name, email: schema.users.email });

    if (!user) return NextResponse.json({ error: "Account not found." }, { status: 404 });
    return NextResponse.json(user);
  } catch (error) {
    const code = error?.code || error?.cause?.code;
    if (code === "SQLITE_CONSTRAINT_UNIQUE" || code === "23505") {
      return NextResponse.json(
        { error: "An account with that email already exists." },
        { status: 409 },
      );
    }
    console.error("Profile update failed.", error);
    return NextResponse.json({ error: "Account details could not be updated." }, { status: 500 });
  }
}
