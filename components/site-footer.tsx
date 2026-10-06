import Link from "next/link";
import { DISCLAIMER_SHORT, HONESTY, SIBLING_TOOLS } from "@/lib/site";

const links = [
  { href: "/", label: "Roast a pitch" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/legal/disclaimer", label: "Disclaimer" },
  { href: "/llms.txt", label: "llms.txt" },
  { href: "/openapi.json", label: "API (OpenAPI)" },
] as const;

export function SiteFooter() {
  return (
    <footer className="mt-16 border-t border-line">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-8 text-sm text-muted">
        <p className="max-w-3xl leading-relaxed">{DISCLAIMER_SHORT}</p>
        <p className="max-w-3xl leading-relaxed">{HONESTY}</p>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-foreground">
              {link.label}
            </Link>
          ))}
          <a href="https://github.com/sean0007/pitch-roast" target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
            Source on GitHub
          </a>
        </div>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <span className="text-muted/80">More free tools:</span>
          {SIBLING_TOOLS.map((tool) => (
            <a key={tool.href} href={tool.href} target="_blank" rel="noopener noreferrer" className="hover:text-foreground">
              {tool.label}
            </a>
          ))}
        </div>
        <p className="font-mono text-xs tracking-wide text-muted/80">
          No payments. No affiliate links. No login. The judges are fictional and so is their attitude.
        </p>
      </div>
    </footer>
  );
}
