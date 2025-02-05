// types/next-auth.d.ts
import NextAuth from "next-auth";

declare module "next-auth" {
  interface User {
    email?: string;
    name?: string;
  }

  interface Session {
    user: User;
  }

  interface JWT {
    email?: string;
    name?: string;
  }
}
