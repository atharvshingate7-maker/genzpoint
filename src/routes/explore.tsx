import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Flame, Sparkles, Camera, Music2, Plane, Utensils, Palette, Dumbbell, TrendingUp, ArrowRight } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";

const searchSchema = z.object({ q: z.string().optional().default("") });

export const Route = createFileRoute("/explore")({
  validateSearch: (s) => searchSchema.parse(s),
  component: ExplorePage,
});

async function fetchExplore(q: string) {
  let query = supabase
    .from("posts")
    .select("id,media_url,media_type,caption,profiles(username)")
    .order("created_at", { ascending: false })
    .limit(60);
  if (q) query = query.ilike("caption", `%${q}%`);
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

const CATEGORIES = [
  { label: "Trending",   icon: Flame,     from: "from-rose-500",    to: "to-orange-400" },
  { label: "Photography",icon: Camera,    from: "from-fuchsia-500", to: "to-purple-500" },
  { label: "Music",      icon: Music2,    from: "from-indigo-500",  to: "to-sky-400" },
  { label: "Travel",     icon: Plane,     from: "from-emerald-500", to: "to-teal-400" },
  { label: "Food",       icon: Utensils,  from: "from-amber-500",   to: "to-rose-400" },
  { label: "Art",        icon: Palette,   from: "from-violet-500",  to: "to-pink-400" },
  { label: "Fitness",    icon: Dumbbell,  from: "from-lime-500",    to: "to-emerald-400" },
  { label: "For You",    icon: Sparkles,  from: "from-pink-500",    to: "to-yellow-400" },
];

const TAGS = ["#sunset", "#streetwear", "#aesthetic", "#wanderlust", "#coffee", "#vinyl", "#filmphotography", "#golden_hour", "#nightlife", "#cozy"];

const SUGGESTED = [
  { name: "aurora.k",   tag: "Photographer · Tokyo",     grad: "from-rose-400 to-purple-500" },
  { name: "leo_travels",tag: "Wanderer · 42 countries",  grad: "from-sky-400 to-indigo-500" },
  { name: "mira.eats",  tag: "Food storyteller",         grad: "from-amber-400 to-rose-500" },
  { name: "the.archive",tag: "Curated film stills",      grad: "from-emerald-400 to-teal-500" },
];

function ExplorePage() {
  const { q } = Route.useSearch();
  const { data, isLoading } = useQuery({
    queryKey: ["explore", q],
    queryFn: () => fetchExplore(q),
  });

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl">
        {/* Hero */}
        <section className="relative overflow-hidden rounded-3xl border hairline p-8 sm:p-12">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-fuchsia-500/15 via-orange-300/10 to-sky-400/15" />
          <div className="absolute -top-24 -right-24 -z-10 h-72 w-72 rounded-full bg-fuchsia-400/30 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 -z-10 h-72 w-72 rounded-full bg-sky-400/30 blur-3xl" />
          <p className="text-[11px] uppercase tracking-[0.25em] text-muted-foreground">{q ? "Search" : "Discover"}</p>
          <h1 className="mt-3 gz-logo text-4xl sm:text-5xl tracking-tight">
            {q ? <>Results for <span className="italic">"{q}"</span></> : "Find your next obsession."}
          </h1>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground">
            Browse handpicked moments, rising creators and trending tags from across GenZPoint.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {TAGS.slice(0, 6).map((t) => (
              <Link key={t} to="/explore" search={{ q: t.replace("#", "") }} className="rounded-full bg-background/70 backdrop-blur px-3 py-1.5 text-xs font-medium border hairline hover:bg-background transition-colors">
                {t}
              </Link>
            ))}
          </div>
        </section>

        {/* Categories */}
        <section className="mt-10">
          <SectionHeader title="Browse by mood" subtitle="Curated worlds to get lost in" />
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {CATEGORIES.map(({ label, icon: Icon, from, to }) => (
              <Link
                key={label}
                to="/explore"
                search={{ q: label.toLowerCase() }}
                className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${from} ${to} p-5 text-white shadow-soft hover:shadow-pop transition-all hover:-translate-y-0.5`}
              >
                <Icon size={22} strokeWidth={2} className="opacity-90" />
                <div className="mt-8 text-sm font-medium">{label}</div>
                <ArrowRight size={16} className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity" />
              </Link>
            ))}
          </div>
        </section>

        {/* Suggested creators */}
        <section className="mt-10">
          <SectionHeader title="Rising creators" subtitle="People worth following this week" />
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
            {SUGGESTED.map((u) => (
              <div key={u.name} className="rounded-2xl border hairline bg-card p-4 text-center hover:shadow-soft transition-shadow">
                <div className={`mx-auto h-16 w-16 rounded-full bg-gradient-to-br ${u.grad} ring-2 ring-background shadow-soft`} />
                <div className="mt-3 text-sm font-medium">@{u.name}</div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">{u.tag}</div>
                <button className="mt-3 h-8 w-full rounded-full bg-primary text-xs font-medium text-primary-foreground hover:opacity-90 transition-opacity">
                  Follow
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Trending tags rail */}
        <section className="mt-10">
          <SectionHeader title="Trending tags" subtitle="What the feed is talking about" icon={TrendingUp} />
          <div className="mt-5 flex flex-wrap gap-2">
            {TAGS.map((t, i) => (
              <Link
                key={t}
                to="/explore"
                search={{ q: t.replace("#", "") }}
                className={`rounded-full px-4 py-2 text-xs font-medium border hairline transition-all hover:-translate-y-0.5 ${
                  i % 3 === 0 ? "bg-gradient-to-r from-rose-100 to-orange-100 text-rose-900"
                  : i % 3 === 1 ? "bg-gradient-to-r from-sky-100 to-indigo-100 text-indigo-900"
                  : "bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-900"
                }`}
              >
                {t}
              </Link>
            ))}
          </div>
        </section>

        {/* Grid */}
        <section className="mt-12">
          <SectionHeader title={q ? "Matching posts" : "Fresh on GenZPoint"} subtitle={q ? `Showing results for "${q}"` : "The latest from your community"} />

          {isLoading ? (
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="aspect-square animate-pulse rounded-2xl bg-muted" />
              ))}
            </div>
          ) : !data || data.length === 0 ? (
            <EmptyState q={q} />
          ) : (
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
              {data.map((p: any) => (
                <Link
                  key={p.id}
                  to="/profile/$username"
                  params={{ username: p.profiles?.username ?? "" }}
                  className="group relative aspect-square overflow-hidden rounded-2xl bg-muted"
                >
                  {p.media_type === "video" ? (
                    <video src={p.media_url} className="h-full w-full object-cover" />
                  ) : (
                    <img src={p.media_url} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" loading="lazy" />
                  )}
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              ))}
            </div>
          )}
        </section>

        <div className="h-16" />
      </div>
    </AppShell>
  );
}

function SectionHeader({ title, subtitle, icon: Icon }: { title: string; subtitle?: string; icon?: any }) {
  return (
    <div className="flex items-end justify-between">
      <div>
        <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
          {Icon && <Icon size={18} className="text-rose-500" />}
          {title}
        </h2>
        {subtitle && <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>}
      </div>
    </div>
  );
}

function EmptyState({ q }: { q: string }) {
  return (
    <div className="mt-5 relative overflow-hidden rounded-3xl border hairline p-10 text-center">
      <div className="absolute inset-0 -z-10 bg-gradient-to-br from-fuchsia-100/60 via-rose-100/40 to-amber-100/60" />
      <Sparkles className="mx-auto text-rose-500" size={28} />
      <p className="mt-3 text-sm font-medium">{q ? "Nothing matches yet" : "The feed is just warming up"}</p>
      <p className="mx-auto mt-1 max-w-sm text-xs text-muted-foreground">
        Be the first to share a moment — explore tags, follow creators, or upload something beautiful.
      </p>
      <Link to="/upload" className="mt-5 inline-flex h-10 items-center rounded-full bg-primary px-5 text-xs font-medium text-primary-foreground hover:opacity-90 transition-opacity">
        Share a post
      </Link>
    </div>
  );
}
