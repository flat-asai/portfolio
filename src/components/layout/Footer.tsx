import Link from "next/link";
import { Github } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full border-t py-6 md:py-0 px-8">
      <div className="flex flex-col items-center justify-between gap-4 py-4 md:flex-row">
        <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
          &copy; {new Date().getFullYear()} Yasuna A. Portfolio Site, All rights reserved.
        </p>

        <Link
          href="https://github.com/flat-asai"
          className="flex items-center gap-2"
          target="_blank"
          aria-label="GitHubへのリンク"
        >
          <Github className="w-8 h-8" />
        </Link>
      </div>
    </footer>
  );
}
