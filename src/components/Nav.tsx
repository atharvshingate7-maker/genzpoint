import { Link, useNavigate } from "@tanstack/react-router";
import { Compass, Home, PlusSquare, Search, LogOut, User as UserIcon, MessageCircle } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/lib/auth";

export function Nav() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const h = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, []);

  const initial = (profile?.username ?? user?.email ?? "?")[0]?.toUpperCase();

  return (
    <header className="sticky top-0 z-40 border-b hairline bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link to="/" className="gz-logo text-2xl tracking-tight hover:opacity-80 transition-opacity">
          GenZPoint
        </Link>

        <form
          onSubmit={(e) => { e.preventDefault(); navigate({ to: "/explore", search: { q } }); }}
          className="ml-4 hidden flex-1 max-w-sm sm:block"
        >
          <div className="relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search"
              className="h-10 w-full rounded-full bg-muted pl-11 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 transition-all"
            />
          </div>
        </form>

        <nav className="ml-auto flex items-center gap-1">
          <Link to="/" className="rounded-full p-2.5 hover:bg-muted transition-colors" aria-label="Home">
            <Home size={22} strokeWidth={1.75} />
          </Link>
          <Link to="/explore" className="rounded-full p-2.5 hover:bg-muted transition-colors" aria-label="Explore">
            <Compass size={22} strokeWidth={1.75} />
          </Link>
          {user && (
            <Link to="/upload" className="rounded-full p-2.5 hover:bg-muted transition-colors" aria-label="Upload">
              <PlusSquare size={22} strokeWidth={1.75} />
            </Link>
          )}
          {user && (
            <Link to="/messages" className="rounded-full p-2.5 hover:bg-muted transition-colors" aria-label="Messages">
              <MessageCircle size={22} strokeWidth={1.75} />
            </Link>
          )}

          {user ? (
            <div className="relative ml-1" ref={ref}>
              <button
                onClick={() => setOpen((o) => !o)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-neutral-800 to-neutral-600 text-sm font-medium text-white ring-2 ring-transparent hover:ring-border transition-all"
              >
                {profile?.avatar_url ? (
                  <img src={profile.avatar_url} alt="" className="h-full w-full rounded-full object-cover" />
                ) : initial}
              </button>
              {open && (
                <div className="absolute right-0 mt-2 w-56 origin-top-right rounded-2xl border hairline bg-popover p-1.5 shadow-pop animate-fade-up">
                  <Link
                    to="/profile/$username"
                    params={{ username: profile?.username ?? "" }}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-muted transition-colors"
                  >
                    <UserIcon size={16} /> Profile
                  </Link>
                  <button
                    onClick={async () => { setOpen(false); await signOut(); navigate({ to: "/" }); }}
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm hover:bg-muted transition-colors"
                  >
                    <LogOut size={16} /> Log out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="ml-2 inline-flex h-9 items-center rounded-full bg-primary px-4 text-sm font-medium text-primary-foreground hover:opacity-90 transition-opacity"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
