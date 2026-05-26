import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useEffect, type FormEvent } from "react";
import { toast } from "sonner";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";

export const Route = createFileRoute("/signup")({
  component: SignupPage,
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(24)
    .regex(/^[a-zA-Z0-9_]+$/, "Only letters, numbers, underscore"),
  password: z.string().min(8, "Password must be at least 8 characters").max(72),
});

function SignupPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [form, setForm] = useState({ email: "", username: "", password: "" });
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (user) navigate({ to: "/" }); }, [user]);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    setBusy(true);
    const { error } = await supabase.auth.signUp({
      email: parsed.data.email,
      password: parsed.data.password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { username: parsed.data.username },
      },
    });
    setBusy(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Welcome to GenZPoint");
    navigate({ to: "/" });
  };

  const set = (k: keyof typeof form) => (v: string) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#0a0a0a] text-white animate-fade-in-slow">
      {/* LEFT — visual collage */}
      <div className="hidden lg:flex relative items-center justify-center overflow-hidden border-r border-white/5">
        {/* logo */}
        <div className="absolute top-10 left-12 z-20">
          <span className="gz-logo text-3xl bg-gradient-to-r from-fuchsia-400 via-pink-400 to-amber-300 bg-clip-text text-transparent">GenZPoint</span>
        </div>

        {/* headline */}
        <div className="absolute top-1/4 left-12 right-12 z-10">
          <h2 className="text-5xl xl:text-6xl font-display leading-[1.05] tracking-tight">
            See everyday moments from your{" "}
            <span className="bg-gradient-to-r from-amber-300 via-pink-400 to-fuchsia-500 bg-clip-text text-transparent italic">
              close friends
            </span>.
          </h2>
        </div>

        {/* collage */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[460px] h-[420px]">
          <div className="absolute left-2 bottom-10 w-44 h-60 rounded-[28px] rotate-[-8deg] bg-gradient-to-br from-fuchsia-500 via-pink-500 to-orange-400 shadow-2xl shadow-fuchsia-900/40 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(255,255,255,0.25),transparent_60%)]" />
            <div className="absolute bottom-4 left-3 right-3 h-2 rounded-full bg-white/70" />
          </div>
          <div className="absolute left-1/2 -translate-x-1/2 bottom-0 w-52 h-72 rounded-[28px] bg-gradient-to-br from-violet-600 via-indigo-500 to-emerald-400 shadow-2xl shadow-indigo-900/40 overflow-hidden z-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_40%,rgba(255,255,255,0.3),transparent_60%)]" />
            <div className="absolute top-3 left-3 px-2 py-1 rounded-full bg-white/90 text-[10px] text-black font-medium">✦ moments</div>
            <div className="absolute bottom-4 left-3 right-3 h-2 rounded-full bg-white/80" />
          </div>
          <div className="absolute right-2 bottom-14 w-44 h-60 rounded-[28px] rotate-[7deg] bg-gradient-to-br from-amber-300 via-rose-400 to-purple-500 shadow-2xl shadow-rose-900/40 overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_40%_60%,rgba(255,255,255,0.25),transparent_60%)]" />
            <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-emerald-400 border-2 border-white flex items-center justify-center text-[10px]">★</div>
            <div className="absolute bottom-4 left-3 right-3 h-2 rounded-full bg-white/70" />
          </div>
          {/* floating sticker */}
          <div className="absolute left-6 top-6 z-20 px-3 py-1.5 rounded-full bg-white text-black text-xs font-medium shadow-lg rotate-[-6deg]">
            👀 🔥 ✨
          </div>
          <div className="absolute right-10 top-20 z-20 w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 shadow-lg flex items-center justify-center text-white">♥</div>
        </div>

        {/* ambient glow */}
        <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] rounded-full bg-fuchsia-600/20 blur-3xl" />
        <div className="absolute -top-32 -right-32 w-[400px] h-[400px] rounded-full bg-indigo-600/20 blur-3xl" />
      </div>

      {/* RIGHT — form */}
      <div className="flex items-center justify-center px-6 py-12 bg-[#0a0a0a]">
        <div className="w-full max-w-sm animate-fade-up">
          <Link to="/" className="mb-8 block text-center text-[11px] uppercase tracking-[0.2em] text-white/50 hover:text-white transition-colors lg:hidden">
            ← Home
          </Link>

          <h1 className="gz-logo text-5xl text-center tracking-tight bg-gradient-to-r from-amber-300 via-pink-400 to-fuchsia-500 bg-clip-text text-transparent">
            GenZPoint
          </h1>
          <p className="mt-3 text-center text-sm text-white/60">Create your account</p>

          <form onSubmit={submit} className="mt-10 space-y-3">
            <DarkField label="Email" type="email" value={form.email} onChange={set("email")} autoComplete="email" required placeholder="Email" />
            <DarkField label="Username" type="text" value={form.username} onChange={set("username")} autoComplete="username" required minLength={3} placeholder="Username" />
            <DarkField label="Password" type="password" value={form.password} onChange={set("password")} autoComplete="new-password" required minLength={8} placeholder="Password" />

            <button
              type="submit"
              disabled={busy}
              className="mt-3 h-12 w-full rounded-full bg-gradient-to-r from-fuchsia-500 via-pink-500 to-amber-400 text-sm font-semibold text-white shadow-lg shadow-pink-900/30 hover:opacity-95 transition-opacity disabled:opacity-50"
            >
              {busy ? "Creating account…" : "Sign up"}
            </button>
          </form>

          <div className="my-8 flex items-center gap-3 text-[11px] uppercase tracking-[0.2em] text-white/40">
            <span className="h-px flex-1 bg-white/10" />
            or
            <span className="h-px flex-1 bg-white/10" />
          </div>

          <p className="text-center text-sm text-white/60">
            Have an account?{" "}
            <Link to="/login" className="font-semibold text-pink-400 hover:text-pink-300">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function DarkField(props: {
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
      <span className="sr-only">{props.label}</span>
      <input
        type={props.type}
        value={props.value}
        onChange={(e) => props.onChange(e.target.value)}
        autoComplete={props.autoComplete}
        required={props.required}
        minLength={props.minLength}
        placeholder={props.placeholder}
        className="h-14 w-full rounded-2xl border border-white/10 bg-white/[0.04] px-5 text-sm text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-pink-500/40 focus:border-pink-400/50 transition-all"
      />
    </label>
  );
}
