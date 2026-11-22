import CredentialsProvider from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";
import { getDatabase } from "@/lib/db";
import { hashPassword, verifyPassword } from "@/lib/passwords";

export const authOptions = {
  secret: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
  providers: [
    CredentialsProvider({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email || "").trim().toLowerCase();
        const password = String(credentials?.password || "");
        if (!email || !password) return null;

        const { db, schema } = await getDatabase();
        const [user] = await db
          .select()
          .from(schema.users)
          .where(eq(schema.users.email, email))
          .limit(1);

        const passwordHash = user?.passwordHash || (await hashDummyPassword());
        if (!(await verifyPassword(password, passwordHash)) || !user) return null;

        return { id: user.id, name: user.name, email: user.email };
      },
    }),
  ],
  session: { strategy: "jwt" },
  pages: { signIn: "/login" },
  callbacks: {
    session({ session, token }) {
      if (session.user && token.sub) session.user.id = token.sub;
      return session;
    },
  },
};

let dummyPasswordHash;
async function hashDummyPassword() {
  if (!dummyPasswordHash) dummyPasswordHash = hashPassword("invalid-password");
  return dummyPasswordHash;
}
