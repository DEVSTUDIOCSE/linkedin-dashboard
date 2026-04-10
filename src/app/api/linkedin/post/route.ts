/**
 * LinkedIn UGC Post Route Handler
 *
 * POST /api/linkedin/post
 * Body: { postId: string, title: string, pdfUrl: string }
 *
 * 1. Verify the user's session
 * 2. Load their LinkedIn access token from Firestore
 * 3. Publish the post via LinkedIn UGC Posts API
 */

import { type NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/server';
import { getAdminAuth } from '@/lib/firebase/admin';
import { getFirestore } from 'firebase-admin/firestore';
import { postToLinkedIn } from '@/lib/linkedin';

interface PostRequestBody {
  postId?: string;
  title?: string;
  pdfUrl?: string;
}

export async function POST(request: NextRequest) {
  // ── Auth check ──────────────────────────────────────────────────────────
  const serverUser = await getCurrentUser();
  if (!serverUser) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  // ── Parse body ──────────────────────────────────────────────────────────
  let body: PostRequestBody;
  try {
    body = (await request.json()) as PostRequestBody;
  } catch {
    return NextResponse.json({ success: false, error: 'Invalid JSON body' }, { status: 400 });
  }

  const { title, pdfUrl } = body;
  if (!title) {
    return NextResponse.json({ success: false, error: 'Missing title' }, { status: 400 });
  }

  // ── Load LinkedIn token from Firestore (admin) ──────────────────────────
  getAdminAuth(); // ensures Admin SDK is initialized
  const adminDb = getFirestore();
  const userDoc = await adminDb.collection('users').doc(serverUser.uid).get();
  const userData = userDoc.data();

  const accessToken = userData?.linkedInAccessToken as string | undefined;
  const authorUrn = userData?.linkedInUrn as string | undefined;

  if (!accessToken || !authorUrn) {
    return NextResponse.json(
      { success: false, error: 'LinkedIn account is not connected. Please connect your LinkedIn account first.' },
      { status: 400 },
    );
  }

  // ── Build post text ─────────────────────────────────────────────────────
  const text = pdfUrl
    ? `${title}\n\n${pdfUrl}`
    : title;

  // ── Publish to LinkedIn ─────────────────────────────────────────────────
  try {
    const result = await postToLinkedIn(accessToken, authorUrn, text, pdfUrl);
    return NextResponse.json({ success: true, linkedInPostId: result.id });
  } catch (err) {
    console.error('[LinkedIn Post] Error:', err);
    const message = err instanceof Error ? err.message : 'Failed to post to LinkedIn';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
