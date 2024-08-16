// track.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../../auth/[...nextauth]/route'; // 이 부분은 실제 경로로 수정 필요

export async function GET(req: Request) {
  try {
    // 1. 세션 가져오기
    const session = await getServerSession(authOptions);

    // 2. 세션이 없는 경우 Unauthorized 에러 반환
    if (!session) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // 3. 쿼리 파라미터 가져오기
    const url = new URL(req.url);
    const query = url.searchParams.get('q');

    // 4. 쿼리 파라미터가 없는 경우 Bad Request 에러 반환
    if (!query) {
      return NextResponse.json({ message: 'Query parameter "q" must be a string' }, { status: 400 });
    }

    let spotifyUrl = '';
    const headers = {
      Authorization: `Bearer ${session.user?.accessToken}`,
    };

    // 5. 적절한 Spotify API 엔드포인트 선택
    switch (query) {
      case 'recent':
        spotifyUrl = 'https://api.spotify.com/v1/me/player/recently-played';
        break;
      // case 'popular':
      //   spotifyUrl = 'https://api.spotify.com/v1/playlists/${playlist_id}/tracks'; // 실제 플레이리스트 ID를 사용해야 함
      //   break;
      case 'saved':
        spotifyUrl = 'https://api.spotify.com/v1/me/playlists';
        break;
      default:
        return NextResponse.json({ message: 'Invalid query parameter "q"' }, { status: 400 });
    }

    // 6. Spotify API 요청 보내기
    const spotifyResponse = await fetch(spotifyUrl, { headers });
    const data = await spotifyResponse.json();

    // 7. 응답이 실패인 경우 오류 처리
    if (!spotifyResponse.ok) {
      throw new Error(data.error?.message || 'Failed to fetch data');
    }

    // 8. 적절한 데이터 추출
    let items = [];
    switch (query) {
      case 'recent':
        items = data.items.map((item: any) => item.track);
        break;
      // case 'popular':
      //   items = data.items.map((item: any) => item.track);
      //   break;
      case 'saved':
        items = data.items.map((item: any) => item.track);
        break;
      default:
        break;
    }

    // 9. 성공적인 응답 반환
    return NextResponse.json(items, { status: 200 });
  } catch (error: any) {
    // 10. 오류 발생 시 처리
    return NextResponse.json({ message: error.message || 'Error fetching data' }, { status: 500 });
  }
}
