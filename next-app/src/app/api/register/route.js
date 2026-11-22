import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getDatabase } from "@/lib/db";
import { hasSameOrigin, readJson } from "@/lib/http";
import { hashPassword } from "@/lib/passwords";

export async function POST(request) {
  if (!hasSameOrigin(request)) {
    return NextResponse.json({ error: "Request origin is not allowed." }, { status: 403 });
  }

  const body = await readJson(request);
  const name = typeof body?.name === "string" ? body.name.trim() : "";
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body?.password === "string" ? body.password : "";

  if (name.length < 1 || name.length > 80) {
    return NextResponse.json({ error: "Name must be 1–80 characters." }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  if (password.length < 12 || password.length > 128) {
    return NextResponse.json({ error: "Password must be 12–128 characters." }, { status: 400 });
  }

  try {
    const { db, schema } = await getDatabase();
    const createdAt = new Date().toISOString();
    await db.insert(schema.users).values({
      id: randomUUID(),
      name,
      email,
      passwordHash: await hashPassword(password),
      createdAt,
      updatedAt: createdAt,
    });

    return NextResponse.json({ message: "Account created." }, { status: 201 });
  } catch (error) {
    const code = error?.code || error?.cause?.code;
    if (code === "SQLITE_CONSTRAINT_UNIQUE" || code === "23505") {
      return NextResponse.json(
        { error: "An account with that email already exists." },
        { status: 409 },
      );
    }
    console.error("Account registration failed.", error);
    return NextResponse.json(
      { error: "Account registration could not be completed." },
      { status: 500 },
    );
  }
}
