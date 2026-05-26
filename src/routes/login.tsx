import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";

export const Route = createFileRoute("/login")({
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (user) navigate({ to: "/" }); }, [user]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Welcome back");
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen flex animate-fade-in-slow bg-background">
      <BrandPanel
        eyebrow="Welcome back"
        title="Pick up where you left off."
        subtitle="Your feed, your people, your moments — all waiting on the other side."
      />

      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm animate-fade-up">
          <Link to="/" className="mb-8 block text-center text-[11px] uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors">
            ← Home
          </Link>

          <h1 className="gz-logo text-5xl text-center tracking-tight">GenZPoint</h1>
          <p className="mt-3 text-center text-sm text-muted-foreground">Sign in to your account.</p>

          <form onSubmit={submit} className="mt-10 space-y-4">
            <Field label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" required placeholder="you@email.com" />
            <Field label="Password" type="password" value={password} onChange={setPassword} autoComplete="current-password" required placeholder="Your password" />
            <button
              type="submit"
              disabled={busy}
              className="mt-2 h-12 w-full rounded-full bg-primary text-sm font-medium text-primary-foreground shadow-soft hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {busy ? "Signing in…" : "Sign in"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            Don't have an account?{" "}
            <Link to="/signup" className="font-medium text-foreground hover:opacity-70">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export function BrandPanel({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <div className="hidden lg:flex lg:w-1/2 xl:w-[55%] relative bg-neutral-950 items-center justify-center overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute -top-32 -left-24 w-[480px] h-[480px] rounded-full bg-gradient-to-br from-neutral-700/40 to-neutral-900/0 blur-3xl" />
        <div className="absolute -bottom-32 -right-24 w-[520px] h-[520px] rounded-full bg-gradient-to-tl from-neutral-600/30 to-neutral-900/0 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(0,0,0,0.6)_100%)]" />
      </div>
      <div className="relative z-10 max-w-md px-10 text-left">
        <p className="text-[11px] uppercase tracking-[0.25em] text-neutral-500">{eyebrow}</p>
        <h2 className="mt-6 gz-logo text-6xl text-white leading-[1.05] tracking-tight">{title}</h2>
        <p className="mt-6 text-base text-neutral-400 font-light leading-relaxed">{subtitle}</p>
        <div className="mt-12 flex items-center gap-3">
          <span className="h-px w-10 bg-neutral-700" />
          <span className="gz-logo text-xl text-white">GenZPoint</span>
        </div>
      </div>
    </div>
  );
}

export function Field(props: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete?: string;
  required?: boolean;
  minLength?: number;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-muted-foreground">{props.label}</span>
      <input
        type={props.type}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        autoComplete={props.autoComplete}
        required={props.required}
        minLength={props.minLength}
        placeholder={props.placeholder}
        className="mt-1.5 h-12 w-full rounded-2xl border bg-background px-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-foreground transition-all"
      />
    </label>
  );
}
