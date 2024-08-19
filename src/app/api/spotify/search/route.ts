import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { transformTrack } from '@/lib/spotify';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const query = url.searchParams.get('q');
  if (!query) {
    return NextResponse.json({ message: 'Query parameter "q" must be a string' }, { status: 400 });
  }

  try {
    const spotifyUrl = `https://api.spotify.com/v1/search?type=track&q=${encodeURIComponent(query)}`;
    const headers = {
      Authorization: `Bearer ${session.user?.accessToken}`,
    };
    const spotifyResponse = await fetch(spotifyUrl, { headers });
    const data = await spotifyResponse.json();
    if (!spotifyResponse.ok) {
      throw new Error(data.error?.message || 'Failed to fetch data');
    }
    const transformedData = data.tracks.items.map(transformTrack);
    return NextResponse.json(transformedData, { status: 200 });
  } catch (error: any) {
    return NextResponse.json({ message: error.message || 'Error fetching data' }, { status: 500 });
  }
}