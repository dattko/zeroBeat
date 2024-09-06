import { NextRequest, NextResponse } from 'next/server';
import { getAlbumDetails } from '@/lib/spotify/api';
import { getSession } from 'next-auth/react';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const session = await getSession();
  const id = params.id;

  if (!session?.user?.accessToken) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    const albumData = await getAlbumDetails(id);
    return NextResponse.json(albumData);
  } catch (error) {
    console.error('Error fetching album details:', error);
    return NextResponse.json({ error: 'Failed to fetch album details' }, { status: 500 });
  }
}