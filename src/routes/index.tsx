import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/lib/auth";
import { Feed } from "@/components/Feed";
import { AppShell } from "@/components/AppShell";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <FeedHome /> : <Landing />;
}

function FeedHome() {
  return (
    <AppShell>
      <Feed />
    </AppShell>
  );
}

function Landing() {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen animate-fade-in-slow flex flex-col">
      <div className="flex flex-1 flex-col items-center justify-center px-6 pt-20 pb-12">
        <div className="w-full max-w-sm text-center animate-fade-up">
          <h1 className="gz-logo text-6xl tracking-tight">GenZPoint</h1>
          <p className="mt-3 text-sm text-muted-foreground">Share a moment. Become the first.</p>

          <div className="mt-10 flex flex-col gap-3">
            <button
              onClick={() => navigate({ to: "/login" })}
              className="h-12 rounded-full bg-primary text-sm font-medium text-primary-foreground shadow-soft hover:opacity-90 transition-opacity"
            >
              Sign in
            </button>
            <button
              onClick={() => navigate({ to: "/signup" })}
              className="h-12 rounded-full border bg-background text-sm font-medium text-foreground hover:bg-muted transition-colors"
            >
              Sign up
            </button>
          </div>
        </div>
      </div>

      <LandingShowcase />

      <footer className="border-t hairline py-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} GenZPoint
      </footer>
    </div>
  );
}

const SHOWCASE = [
  "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=900&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=900&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1551836022-deb4988cc6c0?w=900&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1483728642387-6c3bdd6c93e5?w=900&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1500036835838-c5e35ba4ad44?w=900&q=80&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=900&q=80&auto=format&fit=crop",
];

function LandingShowcase() {
  return (
    <section className="mx-auto w-full max-w-6xl px-4 pb-16 sm:px-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
        {SHOWCASE.map((src, i) => (
          <div
            key={src}
            className="aspect-square overflow-hidden rounded-2xl bg-muted animate-fade-up"
            style={{ animationDelay: `${i * 80}ms` }}
          >
            <img src={src} alt="" className="h-full w-full object-cover hover:scale-105 transition-transform duration-700" loading="lazy" />
          </div>
        ))}
      </div>
    </section>
  );
}
