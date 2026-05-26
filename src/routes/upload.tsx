import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef, type FormEvent } from "react";
import { toast } from "sonner";
import { Upload as UploadIcon, X } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";

export const Route = createFileRoute("/upload")({
  component: UploadPage,
});

function UploadPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState("");
  const [busy, setBusy] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => { if (!loading && !user) navigate({ to: "/login" }); }, [user, loading]);

  const pick = (f: File | null) => {
    if (!f) return;
    if (f.size > 50 * 1024 * 1024) { toast.error("Max 50MB"); return; }
    setFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!user || !file) { toast.error("Pick a file first"); return; }
    setBusy(true);
    const ext = file.name.split(".").pop() ?? "bin";
    const path = `${user.id}/${crypto.randomUUID()}.${ext}`;
    const { error: upErr } = await supabase.storage.from("media").upload(path, file, { upsert: false, contentType: file.type });
    if (upErr) { setBusy(false); toast.error(upErr.message); return; }
    const { data: pub } = supabase.storage.from("media").getPublicUrl(path);
    const mediaType = file.type.startsWith("video") ? "video" : "image";
    const { error: insErr } = await supabase.from("posts").insert({
      user_id: user.id,
      caption: caption.trim() || null,
      media_url: pub.publicUrl,
      media_type: mediaType,
    });
    setBusy(false);
    if (insErr) { toast.error(insErr.message); return; }
    toast.success("Shared!");
    navigate({ to: "/" });
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-xl">
        <h1 className="gz-logo text-3xl">New post</h1>
        <p className="mt-1 text-sm text-muted-foreground">Photo or video, 50MB max.</p>

        <form onSubmit={submit} className="mt-8 space-y-5">
          {!preview ? (
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="flex aspect-square w-full flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed hairline bg-muted/40 text-muted-foreground hover:bg-muted transition-colors"
            >
              <UploadIcon size={36} strokeWidth={1.5} />
              <span className="text-sm">Click to choose a photo or video</span>
            </button>
          ) : (
            <div className="relative overflow-hidden rounded-3xl bg-muted">
              {file?.type.startsWith("video") ? (
                <video src={preview} className="w-full max-h-[60vh] object-contain" controls />
              ) : (
                <img src={preview} alt="" className="w-full max-h-[60vh] object-contain" />
              )}
              <button
                type="button"
                onClick={() => { setFile(null); setPreview(null); }}
                className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full bg-background/90 backdrop-blur shadow-soft hover:bg-background"
              >
                <X size={18} />
              </button>
            </div>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => pick(e.target.files?.[0] ?? null)}
          />

          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption…"
            rows={3}
            maxLength={2200}
            className="w-full resize-none rounded-2xl border bg-background p-4 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/20 focus:border-foreground transition-all"
          />

          <button
            type="submit"
            disabled={busy || !file}
            className="h-12 w-full rounded-full bg-primary text-sm font-medium text-primary-foreground shadow-soft hover:opacity-90 transition-opacity disabled:opacity-50"
          >
            {busy ? "Sharing…" : "Share"}
          </button>
        </form>
      </div>
    </AppShell>
  );
}
