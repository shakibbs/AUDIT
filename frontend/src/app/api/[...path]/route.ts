// Serves /api/*: every request goes to the Django backend (owner, 2026-10-23: no sample data anywhere in the portal).
import { NextResponse, type NextRequest } from 'next/server';
import { forward } from '@/server/backend';

type Ctx = { params: Promise<{ path: string[] }> };

async function handle(request: NextRequest, { params }: Ctx): Promise<Response> {
  const { path } = await params;
  if (!process.env.BACKEND_URL) return NextResponse.json({ detail: 'The CiV server address is not set (BACKEND_URL).' }, { status: 503 });
  return forward(request, path);
}

export const dynamic = 'force-dynamic';
export { handle as GET, handle as POST, handle as PATCH, handle as DELETE };
