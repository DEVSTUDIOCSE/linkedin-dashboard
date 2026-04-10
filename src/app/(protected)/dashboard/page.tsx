'use client';

import { Suspense, useEffect, useState } from 'react';
import { collection, getDocs, orderBy, query, doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase/firebase';
import { useAuth } from '@/contexts/AuthContext';
import PostCard, { PostCardSkeleton, type Post } from '@/components/dashboard/PostCard';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Linkedin,
  LayoutGrid,
  FileText,
  AlertCircle,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { useSearchParams } from 'next/navigation';

// ─── Inner component (needs Suspense for useSearchParams) ─────────────────────

function DashboardContent() {
  const { user } = useAuth();
  const searchParams = useSearchParams();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [linkedInConnected, setLinkedInConnected] = useState(false);
  const [connectingLinkedIn, setConnectingLinkedIn] = useState(false);

  // Handle LinkedIn OAuth callback query params
  useEffect(() => {
    const connected = searchParams.get('linkedin_connected');
    const linkedInError = searchParams.get('linkedin_error');
    if (connected) {
      toast.success('LinkedIn account connected successfully!');
      setLinkedInConnected(true);
      window.history.replaceState({}, '', '/dashboard');
    } else if (linkedInError) {
      toast.error(decodeURIComponent(linkedInError));
      window.history.replaceState({}, '', '/dashboard');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Fetch posts from Firestore ──────────────────────────────────────────────
  const fetchPosts = async () => {
    if (!db) {
      setError('Firebase is not configured. Check your environment variables.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const data: Post[] = snapshot.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Post, 'id'>),
      }));
      setPosts(data);
    } catch (err) {
      console.error('Failed to fetch posts:', err);
      setError('Could not load posts. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ── Check LinkedIn connection ───────────────────────────────────────────────
  const checkLinkedInConnection = async () => {
    if (!user || !db) return;
    try {
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      const data = userDoc.data();
      setLinkedInConnected(Boolean(data?.linkedInAccessToken));
    } catch {
      // Non-critical — fail silently
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  useEffect(() => {
    if (user) checkLinkedInConnection();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ── LinkedIn OAuth ──────────────────────────────────────────────────────────
  const handleConnectLinkedIn = async () => {
    const clientId = process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID;
    if (!clientId) {
      toast.error('LinkedIn client ID is not configured. Add NEXT_PUBLIC_LINKEDIN_CLIENT_ID to .env.local.');
      return;
    }
    setConnectingLinkedIn(true);
    try {
      const state = crypto.randomUUID();
      sessionStorage.setItem('linkedin_oauth_state', state);

      const appUrl = window.location.origin;
      const redirectUri = `${appUrl}/api/auth/linkedin`;
      const params = new URLSearchParams({
        response_type: 'code',
        client_id: clientId,
        redirect_uri: redirectUri,
        state,
        scope: 'r_liteprofile r_emailaddress w_member_social',
      });
      window.location.href = `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
    } catch (err) {
      console.error(err);
      toast.error('Could not initiate LinkedIn OAuth');
      setConnectingLinkedIn(false);
    }
  };

  // ── Derived stats ───────────────────────────────────────────────────────────
  const publishedCount = posts.filter((p) => p.status === 'published').length;
  const draftCount = posts.filter((p) => p.status === 'draft').length;

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* ── Page header ── */}
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between mb-8">
        <div>
          <h1 className="heading text-3xl flex items-center gap-2.5">
            <LayoutGrid className="h-7 w-7 text-[#0A66C2]" />
            LinkedIn Dashboard
          </h1>
          <p className="muted mt-1.5">
            Manage your carousel posts and publish them to LinkedIn.
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* LinkedIn status + connect */}
          {linkedInConnected ? (
            <Badge
              variant="outline"
              className="gap-1.5 px-3 py-1.5 text-sm border-[#0A66C2]/30 text-[#0A66C2] bg-[#0A66C2]/5"
            >
              <CheckCircle2 className="h-3.5 w-3.5" />
              LinkedIn connected
            </Badge>
          ) : (
            <Button
              onClick={handleConnectLinkedIn}
              disabled={connectingLinkedIn}
              className="gap-2 bg-[#0A66C2] hover:bg-[#004182] text-white border-transparent"
            >
              <Linkedin className="h-4 w-4" />
              {connectingLinkedIn ? 'Connecting…' : 'Connect LinkedIn'}
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={fetchPosts}
            disabled={loading}
            className="gap-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* ── Stats row ── */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: 'Total Posts', value: posts.length, icon: FileText, color: 'text-foreground' },
          { label: 'Published', value: publishedCount, icon: CheckCircle2, color: 'text-emerald-600' },
          { label: 'Drafts', value: draftCount, icon: FileText, color: 'text-amber-600' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className="rounded-xl border border-border/60 bg-card px-5 py-4 flex items-center gap-4"
          >
            <div className={`rounded-lg bg-muted p-2.5 ${color}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-2xl font-bold tabular-nums leading-none">{loading ? '—' : value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      <Separator className="mb-8" />

      {/* ── Error state ── */}
      {error && (
        <div className="flex items-center gap-3 rounded-xl border border-destructive/30 bg-destructive/5 px-5 py-4 mb-6 text-sm text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{error}</span>
          <Button
            variant="ghost"
            size="sm"
            className="ml-auto text-destructive hover:text-destructive hover:bg-destructive/10 h-7"
            onClick={fetchPosts}
          >
            Retry
          </Button>
        </div>
      )}

      {/* ── Posts grid ── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => (
            <PostCardSkeleton key={i} />
          ))}
        </div>
      ) : posts.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-4 py-24 text-center">
          <div className="rounded-full bg-muted p-5">
            <FileText className="h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
          </div>
          <div>
            <p className="font-semibold text-foreground">No posts yet</p>
            <p className="text-sm text-muted-foreground mt-1">
              Posts in the <code className="code">posts</code> Firestore collection will appear here.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {posts.map((post) => (
            <PostCard key={post.id} post={post} linkedInConnected={linkedInConnected} />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Page export wrapped in Suspense for useSearchParams ────────────────────

export default function DashboardPage() {
  return (
    <Suspense>
      <DashboardContent />
    </Suspense>
  );
}
