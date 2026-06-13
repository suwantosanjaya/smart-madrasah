import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcryptjs from "bcryptjs";
import { db } from "./db/index";
import { users, userRoles, roles, orangtua } from "./db/schema";
import { eq } from "drizzle-orm";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.email, credentials.email))
          .limit(1);

        // Jika tidak ketemu via email, coba cari di tabel orangtua berdasarkan noHp
        let foundUser = user;
        if (!foundUser) {
          const [ortu] = await db
            .select({ userId: orangtua.userId })
            .from(orangtua)
            .where(eq(orangtua.noHp, credentials.email))
            .limit(1);
          
          if (ortu && ortu.userId) {
            const [ortuUser] = await db.select().from(users).where(eq(users.id, ortu.userId)).limit(1);
            foundUser = ortuUser;
          }
        }

        if (!foundUser || !foundUser.isActive) {
          return null;
        }

        const isValid = bcryptjs.compareSync(
          credentials.password,
          foundUser.passwordHash
        );

        if (!isValid) {
          return null;
        }

        // Get user roles
        const userRolesList = await db
          .select({
            roleId: roles.id,
            namaRole: roles.namaRole,
            label: roles.label,
          })
          .from(userRoles)
          .innerJoin(roles, eq(userRoles.roleId, roles.id))
          .where(eq(userRoles.userId, foundUser.id));

        return {
          id: String(foundUser.id),
          name: foundUser.namaLengkap,
          email: foundUser.email,
          image: foundUser.avatarUrl,
          roles: userRolesList,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.roles = user.roles;
        token.activeRole = user.roles?.[0]?.namaRole || "guest";
      }
      if (trigger === "update" && session?.activeRole) {
        token.activeRole = session.activeRole;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id;
        session.user.roles = token.roles;
        session.user.activeRole = token.activeRole;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET || "smart-madrasah-secret-key-2026",
});
