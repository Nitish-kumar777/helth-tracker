import NextAuth from "next-auth"
import Credentials from "next-auth/providers/credentials"
import { PrismaAdapter } from "@auth/prisma-adapter"
import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"



let prisma
if (!global.prisma) {
  global.prisma = new PrismaClient()
}
prisma = global.prisma

export const authOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Missing email or password");
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });
        if (!user) throw new Error("No user found");

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isValid) throw new Error("Invalid password");

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      // On first login
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }

      // When session.update() is called
      if (trigger === "update" && session) {
        token.name = session.name;
        token.email = session.email;
        token.image = session.image;
      }

      // Always refresh from DB for latest values
      const dbUser = await prisma.user.findUnique({
        where: { id: token.id },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          image: true,
          emailVerified: true,
          userStats: { select: { currentStreak: true } },
        },
      });

      if (dbUser) {
        token.name = dbUser.name;
        token.email = dbUser.email;
        token.role = dbUser.role;
        token.image = dbUser.image;
        token.emailVerified = dbUser.emailVerified;
        token.currentStreak = dbUser.userStats?.currentStreak ?? 0;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.name = token.name;
        session.user.email = token.email;
        session.user.image = token.image;
        session.user.emailVerified = token.emailVerified;
        session.user.currentStreak = token.currentStreak;
      }
      return session;
    },
  },
  pages: { signIn: "/login" },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };