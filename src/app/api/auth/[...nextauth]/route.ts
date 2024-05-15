import NextAuth, { NextAuthOptions } from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";

const scope =
  "user-read-recently-played user-read-playback-state user-top-read user-modify-playback-state user-read-currently-playing user-follow-read playlist-read-private user-read-email user-read-private user-library-read playlist-read-collaborative";

export const authOptions: NextAuthOptions = {
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID || "",
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET || "",
      authorization: {
        params: { scope },
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  callbacks: {
    async jwt({ token, account }) {
      if (account) {
        token.id = account.id;
        token.expires_at = account.expires_at ? account.expires_at : null;
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token; // 토큰 갱신에 필요
      }

      // expires_at이 숫자인지 확인하고 만료 시간 검사
      if (token.expires_at && typeof token.expires_at === 'number') {
        const currentTime = Math.floor(Date.now() / 1000);
        if (token.expires_at < currentTime) {
          try {
            const refreshedToken = await refreshAccessToken(token.refreshToken as string);
            token.accessToken = refreshedToken.accessToken;
            token.expires_at = Math.floor(Date.now() / 1000) + refreshedToken.expiresIn;
          } catch (error) {
            console.error("Failed to refresh access token:", error);
            token.expires_at = 0;
          }
        }
      }
      
      return token;
    },
    async session({ session, token }) {
      session.user = token;
      return session;
    },
  },
  pages: {
    signIn: "/",
    signOut: "/",
  },
};

interface RefreshedToken {
  accessToken: string;
  expiresIn: number;
}

async function refreshAccessToken(refreshToken: string): Promise<RefreshedToken> {
  try {
    const url = 'https://accounts.spotify.com/api/token';
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: process.env.SPOTIFY_CLIENT_ID || "",
      client_secret: process.env.SPOTIFY_CLIENT_SECRET || "",
    });

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw new Error(refreshedTokens.error || 'Failed to refresh access token');
    }

    return {
      accessToken: refreshedTokens.access_token,
      expiresIn: refreshedTokens.expires_in,
    };
  } catch (error) {
    console.error('Error refreshing access token', error);
    throw error;
  }
}

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };