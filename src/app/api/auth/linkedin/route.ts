/**
 * LinkedIn OAuth 2.0 Callback Handler
 *
 * Flow:
 *  1. LinkedIn redirects here with ?code=...&state=...
 *  2. Exchange code for access token
 *  3. Fetch LinkedIn profile to get member URN
 *  4. Store token + URN in Firestore user document
 *  5. Redirect back to /dashboard
 */

import { type NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/server';
import { getAdminAuth } from '@/lib/firebase/admin';
import { getFirestore } from 'firebase-admin/firestore';
import { exchangeLinkedInCode, getLinkedInProfile } from '@/lib/linkedin';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const errorParam = searchParams.get('error');
  const errorDescription = searchParams.get('error_description');

  const dashboardUrl = new URL('/dashboard', request.url).toString();

  // ── LinkedIn returned an error ────────────────────────────────────────────
  if (errorParam) {
    const msg = encodeURIComponent(errorDescription ?? 'LinkedIn authorization was denied.');
    return NextResponse.redirect(`${dashboardUrl}?linkedin_error=${msg}`);
  }

  if (!code || !state) {
    return NextResponse.redirect(`${dashboardUrl}?linkedin_error=${encodeURIComponent('Missing OAuth code or state.')}`);
  }

  // ── Ensure user is logged in ──────────────────────────────────────────────
  const serverUser = await getCurrentUser();
  if (!serverUser) {
    return NextResponse.redirect(new URL('/login', request.url).toString());
  }

  try {
    // ── Exchange code → access token ────────────────────────────────────────
    const tokenData = await exchangeLinkedInCode(code);

    // ── Fetch LinkedIn profile for URN ──────────────────────────────────────
    const profile = await getLinkedInProfile(tokenData.access_token);
    const linkedInUrn = `urn:li:person:${profile.id}`;

    // ── Store in Firestore (admin) ──────────────────────────────────────────
    // Initialize admin app via getAdminAuth side-effect
    getAdminAuth();
    const adminDb = getFirestore();
    await adminDb.collection('users').doc(serverUser.uid).set(
      {
        linkedInAccessToken: tokenData.access_token,
        linkedInUrn: linkedInUrn,
        linkedInExpiresAt: Date.now() + tokenData.expires_in * 1000,
        linkedInConnectedAt: new Date().toISOString(),
      },
      { merge: true },
    );

    return NextResponse.redirect(`${dashboardUrl}?linkedin_connected=1`);
  } catch (err) {
    console.error('[LinkedIn OAuth] Error:', err);
    const msg = encodeURIComponent(err instanceof Error ? err.message : 'LinkedIn connection failed.');
    return NextResponse.redirect(`${dashboardUrl}?linkedin_error=${msg}`);
  }
}
