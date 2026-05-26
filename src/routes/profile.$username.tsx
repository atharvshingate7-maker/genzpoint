import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/profile/$username")({
  component: ProfilePage,
});

async function fetchProfile(username: string) {
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("id,username,full_name,bio,avatar_url")
    .eq("username", username)
    .maybeSingle();
  if (error) throw error;
  if (!profile) return null;

  const [{ data: posts }, { count: followerCount }, { count: followingCount }] = await Promise.all([
    supabase.from("posts").select("id,media_url,media_type").eq("user_id", profile.id).order("created_at", { ascending: false }),
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("following_id", profile.id),
    supabase.from("follows").select("*", { count: "exact", head: true }).eq("follower_id", profile.id),
  ]);

  return { profile, posts: posts ?? [], followerCount: followerCount ?? 0, followingCount: followingCount ?? 0 };
}

function ProfilePage() {
  const { username } = Route.useParams();
  const { user: me } = useAuth();
  const { data, isLoading } = useQuery({ queryKey: ["profile", username], queryFn: () => fetchProfile(username) });

  if (isLoading) return <AppShell><div className="h-40 animate-pulse rounded-3xl bg-muted" /></AppShell>;
  if (!data) return <AppShell><div className="py-20 text-center text-muted-foreground">User not found</div></AppShell>;

  const { profile, posts, followerCount, followingCount } = data;
  const initial = profile.username[0]?.toUpperCase();
  const isMe = me?.id === profile.id;

  return (
    <AppShell>
      <div className="mx-auto max-w-4xl">
        <header className="flex flex-col items-center gap-6 py-8 sm:flex-row sm:gap-12 sm:py-12">
          <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-neutral-800 to-neutral-500 text-3xl font-medium text-white shadow-soft sm:h-36 sm:w-36">
            {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="h-full w-full object-cover" /> : initial}
          </div>
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center gap-3 sm:justify-start">
              <h1 className="text-2xl font-light">{profile.username}</h1>
              {isMe && (
                <button className="h-9 rounded-full bg-muted px-4 text-sm font-medium hover:bg-accent transition-colors">
                  Edit profile
                </button>
              )}
            </div>
            <div className="mt-4 flex justify-center gap-8 text-sm sm:justify-start">
              <Stat n={posts.length} label="posts" />
              <Stat n={followerCount} label="followers" />
              <Stat n={followingCount} label="following" />
            </div>
            <div className="mt-4">
              <p className="text-sm font-semibold">{profile.full_name}</p>
              {profile.bio && <p className="mt-1 text-sm text-muted-foreground whitespace-pre-line">{profile.bio}</p>}
            </div>
          </div>
        </header>

        <div className="mt-4 border-t hairline pt-6">
          {posts.length === 0 ? (
            <div className="py-20 text-center">
              <p className="gz-logo text-2xl">Nothing here yet.</p>
              {isMe && (
                <Link to="/upload" className="mt-6 inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity shadow-soft">
                  Share your first moment
                </Link>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-1.5 sm:gap-3">
              {posts.map((p: any) => (
                <div key={p.id} className="aspect-square overflow-hidden rounded-xl bg-muted group">
                  {p.media_type === "video" ? (
                    <video src={p.media_url} className="h-full w-full object-cover" />
                  ) : (
                    <img src={p.media_url} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function Stat({ n, label }: { n: number; label: string }) {
  return <div><span className="font-semibold">{n.toLocaleString()}</span> <span className="text-muted-foreground">{label}</span></div>;
}
