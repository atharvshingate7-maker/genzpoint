import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Heart, MessageCircle, Send } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

type PostRow = {
  id: string;
  user_id: string;
  caption: string | null;
  media_url: string;
  media_type: string;
  created_at: string;
  profiles: { username: string; avatar_url: string | null } | null;
  likes: { user_id: string }[];
  comments: { id: string }[];
};

async function fetchFeed(): Promise<PostRow[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("id,user_id,caption,media_url,media_type,created_at,profiles(username,avatar_url),likes(user_id),comments(id)")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data as any) ?? [];
}

export function Feed() {
  const { data, isLoading } = useQuery({ queryKey: ["feed"], queryFn: fetchFeed });

  if (isLoading) {
    return (
      <div className="mx-auto max-w-xl space-y-8">
        {[0, 1].map((i) => (
          <div key={i} className="overflow-hidden rounded-3xl border hairline">
            <div className="flex items-center gap-3 p-4">
              <div className="h-9 w-9 animate-pulse rounded-full bg-muted" />
              <div className="h-3 w-24 animate-pulse rounded bg-muted" />
            </div>
            <div className="aspect-[4/5] animate-pulse bg-muted" />
          </div>
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return <FeedEmpty />;
  }

  return (
    <div className="mx-auto max-w-xl space-y-8">
      {data.map((p) => <PostCard key={p.id} post={p} />)}
    </div>
  );
}

function FeedEmpty() {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-20 text-center animate-fade-up">
      <div className="flex h-24 w-24 items-center justify-center rounded-full border-2 hairline">
        <div className="h-12 w-12 rounded-full border-2 border-foreground/20" />
      </div>
      <h2 className="mt-8 gz-logo text-3xl">Share a moment.</h2>
      <p className="mt-2 text-sm text-muted-foreground">Become the first.</p>
      <Link
        to="/upload"
        className="mt-8 inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity shadow-soft"
      >
        Create your first post
      </Link>
    </div>
  );
}

function PostCard({ post }: { post: PostRow }) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const liked = !!user && post.likes.some((l) => l.user_id === user.id);
  const [optimisticLiked, setOptimisticLiked] = useState<boolean | null>(null);
  const [optimisticDelta, setOptimisticDelta] = useState(0);
  const isLiked = optimisticLiked ?? liked;
  const likeCount = post.likes.length + optimisticDelta;

  const toggleLike = async () => {
    if (!user) { toast.error("Sign in to like posts"); return; }
    const next = !isLiked;
    setOptimisticLiked(next);
    setOptimisticDelta((d) => d + (next ? 1 : -1));
    if (next) {
      const { error } = await supabase.from("likes").insert({ user_id: user.id, post_id: post.id });
      if (error && !error.message.includes("duplicate")) {
        setOptimisticLiked(!next);
        setOptimisticDelta((d) => d - (next ? 1 : -1));
        toast.error(error.message);
      }
    } else {
      const { error } = await supabase.from("likes").delete().eq("user_id", user.id).eq("post_id", post.id);
      if (error) {
        setOptimisticLiked(!next);
        setOptimisticDelta((d) => d - (next ? 1 : -1));
      }
    }
    qc.invalidateQueries({ queryKey: ["feed"] });
  };

  const username = post.profiles?.username ?? "unknown";
  const initial = username[0]?.toUpperCase();

  return (
    <article className="overflow-hidden rounded-3xl border hairline bg-card shadow-soft">
      <header className="flex items-center gap-3 px-4 py-3.5">
        <Link to="/profile/$username" params={{ username }} className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-neutral-800 to-neutral-500 text-xs font-medium text-white">
          {post.profiles?.avatar_url ? <img src={post.profiles.avatar_url} className="h-full w-full object-cover" alt="" /> : initial}
        </Link>
        <Link to="/profile/$username" params={{ username }} className="text-sm font-semibold hover:opacity-70 transition-opacity">
          {username}
        </Link>
        <span className="ml-auto text-xs text-muted-foreground">
          {timeAgo(post.created_at)}
        </span>
      </header>

      <div className="bg-muted">
        {post.media_type === "video" ? (
          <video src={post.media_url} controls className="w-full max-h-[80vh] object-contain" />
        ) : (
          <img src={post.media_url} alt={post.caption ?? ""} className="w-full max-h-[80vh] object-cover" loading="lazy" />
        )}
      </div>

      <div className="px-4 pt-3 pb-4">
        <div className="flex items-center gap-3">
          <button onClick={toggleLike} aria-label="Like" className="p-1 -ml-1">
            <Heart
              size={26}
              strokeWidth={1.75}
              className={isLiked ? "fill-red-500 text-red-500 like-pop" : "text-foreground hover:text-muted-foreground transition-colors"}
            />
          </button>
          <button aria-label="Comment" className="p-1"><MessageCircle size={26} strokeWidth={1.75} /></button>
          <button aria-label="Share" className="p-1"><Send size={24} strokeWidth={1.75} /></button>
        </div>
        {likeCount > 0 && (
          <p className="mt-2 text-sm font-semibold">{likeCount.toLocaleString()} {likeCount === 1 ? "like" : "likes"}</p>
        )}
        {post.caption && (
          <p className="mt-1.5 text-sm leading-relaxed">
            <Link to="/profile/$username" params={{ username }} className="font-semibold hover:opacity-70">{username}</Link>{" "}
            <span className="text-foreground/90">{post.caption}</span>
          </p>
        )}
        {post.comments.length > 0 && (
          <button className="mt-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            View all {post.comments.length} comments
          </button>
        )}
      </div>
    </article>
  );
}

function timeAgo(iso: string) {
  const s = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 60) return `${s}s`;
  if (s < 3600) return `${Math.floor(s / 60)}m`;
  if (s < 86400) return `${Math.floor(s / 3600)}h`;
  if (s < 604800) return `${Math.floor(s / 86400)}d`;
  return `${Math.floor(s / 604800)}w`;
}
