import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { QrCode, X } from "lucide-react";

export function QrButton({ label = "Presenter / Class QR Code" }: { label?: string }) {
  const [open, setOpen] = useState(false);
  const [url, setUrl] = useState("");
  useEffect(() => setUrl(window.location.origin + "/"), []);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded border border-border px-4 py-3 text-sm text-muted-foreground transition hover:border-primary hover:text-primary"
      >
        <QrCode className="h-4 w-4" /> {label}
      </button>
      {open && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-80 flex flex-col items-center justify-center gap-6 bg-background/95 p-6 backdrop-blur fade-scene"
          onClick={() => setOpen(false)}
        >
          <button aria-label="Close" className="absolute right-4 top-16 text-muted-foreground hover:text-primary">
            <X className="h-8 w-8" />
          </button>
          <h2 className="title-distressed text-center text-3xl sm:text-5xl">Scan to enter the fog</h2>
          <div className="rounded bg-bone p-4 shadow-[var(--glow-crimson)]">
            <QRCodeSVG value={url || "/"} size={320} className="h-[min(70vw,60vh)] w-[min(70vw,60vh)]" />
          </div>
          <p className="font-display text-lg text-muted-foreground break-all text-center">{url}</p>
        </div>
      )}
    </>
  );
}
