import { Session } from 'next-auth';

declare module 'next-auth' {
    interface Session {
        user?: {
            picture?: string | null;
            name?: string | null
            email?: string | null
            accessToken?: string | null
        },  
    }
}