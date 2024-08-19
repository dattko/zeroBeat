import { NextAuthOptions, User, Session } from "next-auth";
import SpotifyProvider from "next-auth/providers/spotify";
import { JWT } from "next-auth/jwt";


const scope =
  "user-read-recently-played user-read-playback-state user-top-read user-modify-playback-state user-read-currently-playing user-follow-read playlist-read-private user-read-email user-read-private user-library-read playlist-read-collaborative";

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
      async jwt({ token, account }): Promise<JWT> {
        if (account) {
          token.id = account.id;
          token.accessToken = account.access_token;
          token.refreshToken = account.refresh_token;
          token.expires_at = account.expires_at;
        }
  
        // 토큰이 만료되기 5분 전에 갱신 시도
        const shouldRefreshTime = Math.round((token.expires_at as number) - 5 * 60);
        const currentTime = Math.round(Date.now() / 1000);
  
        if (currentTime > shouldRefreshTime) {
          try {
            const refreshedToken = await refreshAccessToken(token.refreshToken as string);
            token.accessToken = refreshedToken.accessToken;
            token.expires_at = Math.floor(Date.now() / 1000) + refreshedToken.expiresIn;
          } catch (error) {
            console.error("Failed to refresh access token:", error);
            token.error = "RefreshAccessTokenError";
          }
        }
        
        return token;
      },
      async session({ session, token }): Promise<Session> {
        session.user = {
          ...session.user,
          accessToken: token.accessToken as string,
          refreshToken: token.refreshToken as string,
          username: token.username as string,
        } as User & {
          accessToken: string;
          refreshToken: string;
          username: string;
        };
        session.error = token.error as string | undefined;
        return session;
      }
    },
    pages: {
      signIn: "/",
      signOut: "/",
    },
  };

  export default authOptions;