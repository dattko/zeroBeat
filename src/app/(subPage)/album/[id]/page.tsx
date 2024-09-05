'use client';
import React from 'react';
import { useAlbumDetail } from '@/hooks/useAlbumDetail';
import AlbumDetail from '@component/album/AlbumDetail';

interface AlbumPageProps {
  params: { id: string };
}

const AlbumPage: React.FC<AlbumPageProps> = ({ params }) => {
  const { album, isLoading, error } = useAlbumDetail(params.id);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!album) return <div>Album not found</div>;

  return <AlbumDetail album={album} />;
};

export default AlbumPage;