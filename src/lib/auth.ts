import { NextAuthOptions, Session } from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
import { JWT } from "next-auth/jwt";
import { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      accessToken: string;
      refreshToken: string;
      username: string;
      isPremium: boolean;
    } & DefaultSession["user"];
    error?: string;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    accessToken?: string;
    refreshToken?: string;
    expires_at?: number;
    error?: string;
    username?: string;
    isPremium?: boolean;
  }
}

// 스코프를 조정하여 일반 계정에서도 사용 가능한 최소한의 권한만 요청
const scope = [
  "user-read-recently-played",
  "user-read-playback-state",
  "user-top-read",
  "user-modify-playback-state",
  "user-read-currently-playing",
  "user-follow-read",
  "playlist-read-private",
  "user-read-email",
  "user-read-private",
  "user-library-read",
  "playlist-read-collaborative",
  "streaming",
  "user-library-modify",
  "playlist-modify-public",
  "playlist-modify-private"
].join(" ");

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
      client_id: process.env.SPOTIFY_CLIENT_ID!,
      client_secret: process.env.SPOTIFY_CLIENT_SECRET!,
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
    if (error instanceof Error) {
      console.error(error.message);
    }
    throw error;
  }
}

async function checkPremiumStatus(accessToken: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    if (!response.ok) {
      console.warn(`HTTP error when checking premium status: ${response.status}`);
      return false; // 오류 발생 시 기본적으로 false 반환
    }
    const data = await response.json();
    return data.product === 'premium';
  } catch (error) {
    console.error('Error checking premium status:', error);
    return false; // 오류 발생 시 false 반환
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    SpotifyProvider({
      clientId: process.env.SPOTIFY_CLIENT_ID!,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET!,
      authorization: {
        params: { 
          scope,
          redirect_uri: process.env.SPOTIFY_REDIRECT_URI 
        }
      }
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  debug: true,
  callbacks: {
    async jwt({ token, account }): Promise<JWT> {
      if (account) {
        console.log('New account login, setting up token');
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expires_at = account.expires_at;
        token.isPremium = await checkPremiumStatus(account.access_token!);
        console.log(`User premium status: ${token.isPremium}`);
      }

      const shouldRefreshTime = Math.round((token.expires_at as number) - 5 * 60);
      const currentTime = Math.round(Date.now() / 1000);

      if (currentTime > shouldRefreshTime) {
        console.log('Token expired, refreshing...');
        try {
          const refreshedToken = await refreshAccessToken(token.refreshToken as string);
          token.accessToken = refreshedToken.accessToken;
          token.expires_at = Math.floor(Date.now() / 1000) + refreshedToken.expiresIn;
          console.log('Token refreshed successfully');
        } catch (error) {
          console.error("Failed to refresh access token:", error);
          token.error = "RefreshAccessTokenError";
        }
      }
      
      return token;
    },
    async session({ session, token }): Promise<Session> {
      if (session.user) {
        session.user.accessToken = token.accessToken as string;
        session.user.refreshToken = token.refreshToken as string;
        session.user.username = token.username as string;
        session.user.isPremium = token.isPremium as boolean;
        console.log(`Session created for user: ${session.user.username}, Premium: ${session.user.isPremium}`);
      }
      session.error = token.error;
      return session;
    }
  },
  pages: {
    signIn: "/login",
  },
  events: {
    async signIn(message) { console.log('Successful sign in', message) },
    async signOut(message) { console.log('Successful sign out', message) },
  }
};

export default authOptions;