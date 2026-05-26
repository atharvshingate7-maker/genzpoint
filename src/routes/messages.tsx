import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Send, Search, Phone, Video, MoreHorizontal, Smile, ImageIcon, Heart } from "lucide-react";
import { AppShell } from "@/components/AppShell";

export const Route = createFileRoute("/messages")({
  component: MessagesPage,
});

type Chat = {
  id: string;
  name: string;
  handle: string;
  preview: string;
  time: string;
  unread?: number;
  online?: boolean;
  grad: string;
};

const CHATS: Chat[] = [
  { id: "1", name: "Aurora K.",    handle: "aurora.k",    preview: "those golden hour shots are 🔥",       time: "2m",  unread: 2, online: true,  grad: "from-rose-400 to-purple-500" },
  { id: "2", name: "Leo",          handle: "leo_travels", preview: "boarding in 20, send the pin",         time: "12m", unread: 1, online: true,  grad: "from-sky-400 to-indigo-500" },
  { id: "3", name: "Mira",         handle: "mira.eats",   preview: "ok the ramen place was unreal",        time: "1h",                            grad: "from-amber-400 to-rose-500" },
  { id: "4", name: "The Archive",  handle: "the.archive", preview: "dropped a new film set today",         time: "3h",                            grad: "from-emerald-400 to-teal-500" },
  { id: "5", name: "Noor",         handle: "noor.studio", preview: "love your last post 💌",               time: "1d",                            grad: "from-fuchsia-400 to-pink-500" },
  { id: "6", name: "Kai",          handle: "kai_sound",   preview: "playlist incoming",                     time: "2d",                            grad: "from-indigo-400 to-violet-500" },
];

type Msg = { id: string; from: "me" | "them"; text: string; time: string };
const SEED: Record<string, Msg[]> = {
  "1": [
    { id: "a", from: "them", text: "okay your last carousel was actually unreal", time: "10:42" },
    { id: "b", from: "them", text: "those golden hour shots are 🔥",              time: "10:42" },
    { id: "c", from: "me",   text: "stop you're too kind 🥹",                     time: "10:44" },
    { id: "d", from: "me",   text: "shot it on the 35mm — natural light only",   time: "10:44" },
    { id: "e", from: "them", text: "tutorial when??",                              time: "10:45" },
  ],
  "2": [
    { id: "a", from: "them", text: "boarding in 20, send the pin",                time: "09:12" },
    { id: "b", from: "me",   text: "sent — see you at the rooftop spot",          time: "09:14" },
  ],
};

function MessagesPage() {
  const [activeId, setActiveId] = useState<string>("1");
  const [draft, setDraft] = useState("");
  const [threads, setThreads] = useState<Record<string, Msg[]>>(SEED);
  const active = CHATS.find((c) => c.id === activeId)!;
  const msgs = threads[activeId] ?? [];

  const send = () => {
    const t = draft.trim();
    if (!t) return;
    setThreads((s) => ({
      ...s,
      [activeId]: [...(s[activeId] ?? []), { id: crypto.randomUUID(), from: "me", text: t, time: "now" }],
    }));
    setDraft("");
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-5xl">
        <div className="relative overflow-hidden rounded-3xl border hairline bg-card shadow-soft">
          <div className="absolute inset-x-0 top-0 -z-10 h-40 bg-gradient-to-br from-fuchsia-400/20 via-rose-300/15 to-sky-400/20" />

          <div className="grid grid-cols-1 md:grid-cols-[320px_1fr] min-h-[640px]">
            {/* Sidebar */}
            <aside className="border-r hairline">
              <div className="p-5">
                <h1 className="gz-logo text-3xl tracking-tight">Messages</h1>
                <p className="mt-1 text-xs text-muted-foreground">Stay close to your people.</p>
                <div className="relative mt-4">
                  <Search className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={15} />
                  <input
                    placeholder="Search conversations"
                    className="h-10 w-full rounded-full bg-muted pl-10 pr-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20"
                  />
                </div>
              </div>

              <ul className="px-2 pb-3">
                {CHATS.map((c) => {
                  const isActive = c.id === activeId;
                  return (
                    <li key={c.id}>
                      <button
                        onClick={() => setActiveId(c.id)}
                        className={`flex w-full items-center gap-3 rounded-2xl p-2.5 text-left transition-colors ${
                          isActive ? "bg-muted" : "hover:bg-muted/60"
                        }`}
                      >
                        <div className="relative">
                          <div className={`h-11 w-11 rounded-full bg-gradient-to-br ${c.grad} ring-2 ring-background`} />
                          {c.online && <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-emerald-500 ring-2 ring-background" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <span className="truncate text-sm font-medium">{c.name}</span>
                            <span className="ml-2 shrink-0 text-[10px] text-muted-foreground">{c.time}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="truncate text-xs text-muted-foreground">{c.preview}</span>
                            {c.unread && (
                              <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-fuchsia-500 px-1.5 text-[10px] font-semibold text-white">
                                {c.unread}
                              </span>
                            )}
                          </div>
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </aside>

            {/* Thread */}
            <section className="flex flex-col">
              <header className="flex items-center justify-between border-b hairline p-4">
                <div className="flex items-center gap-3">
                  <div className={`h-10 w-10 rounded-full bg-gradient-to-br ${active.grad} ring-2 ring-background`} />
                  <div>
                    <div className="text-sm font-semibold">{active.name}</div>
                    <div className="text-[11px] text-muted-foreground">
                      {active.online ? <span className="text-emerald-600">● Active now</span> : `@${active.handle}`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 text-muted-foreground">
                  <button className="rounded-full p-2 hover:bg-muted transition-colors"><Phone size={18} /></button>
                  <button className="rounded-full p-2 hover:bg-muted transition-colors"><Video size={18} /></button>
                  <button className="rounded-full p-2 hover:bg-muted transition-colors"><MoreHorizontal size={18} /></button>
                </div>
              </header>

              <div className="flex-1 space-y-3 overflow-y-auto p-5">
                <div className="text-center text-[10px] uppercase tracking-widest text-muted-foreground">Today</div>
                {msgs.map((m) => (
                  <div key={m.id} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"} animate-fade-up`}>
                    <div
                      className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-sm ${
                        m.from === "me"
                          ? "bg-gradient-to-br from-fuchsia-500 to-rose-500 text-white rounded-br-sm"
                          : "bg-muted text-foreground rounded-bl-sm"
                      }`}
                    >
                      {m.text}
                      <div className={`mt-1 text-[10px] ${m.from === "me" ? "text-white/70" : "text-muted-foreground"}`}>{m.time}</div>
                    </div>
                  </div>
                ))}
              </div>

              <footer className="border-t hairline p-3">
                <form
                  onSubmit={(e) => { e.preventDefault(); send(); }}
                  className="flex items-center gap-2 rounded-full border hairline bg-background pl-4 pr-1 py-1"
                >
                  <button type="button" className="text-muted-foreground hover:text-foreground transition-colors"><Smile size={18} /></button>
                  <button type="button" className="text-muted-foreground hover:text-foreground transition-colors"><ImageIcon size={18} /></button>
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder={`Message ${active.name}…`}
                    className="h-10 flex-1 bg-transparent text-sm placeholder:text-muted-foreground focus:outline-none"
                  />
                  {draft.trim() ? (
                    <button type="submit" className="flex h-9 items-center gap-1.5 rounded-full bg-gradient-to-br from-fuchsia-500 to-rose-500 px-4 text-xs font-medium text-white hover:opacity-90 transition-opacity">
                      Send <Send size={14} />
                    </button>
                  ) : (
                    <button type="button" className="rounded-full p-2 text-rose-500 hover:bg-muted transition-colors"><Heart size={18} /></button>
                  )}
                </form>
              </footer>
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
