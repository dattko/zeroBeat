import NextAuth, { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      accessToken?: string;
      refreshToken?: string;
      username?: string;
    } & DefaultSession["user"]
    error?: string;
  }

  interface User extends DefaultSession["user"] {
    accessToken?: string;
    refreshToken?: string;
    username?: string;
  }

  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    username?: string;
    expires_at?: number;
    error?: string;
  }
}