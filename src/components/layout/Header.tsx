"use client";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { AccessibilityControls } from "./AccessibilityControl";

export const Header = () => {
  const pathname = usePathname();

  const navItems = [
    { href: "#about", label: "私について" },
    { href: "#philosophy", label: "制作への考え方" },
    { href: "#projects", label: "実績一覧" },
  ];

  return (
    <header className="sticky top-0 py-4 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="w-full px-8 grid grid-cols-2 md:grid-cols-[auto_1fr_auto] gap-4 items-center">
        <Link href="/" className="flex items-center space-x-2">
          <span className="font-bold text-xl">Yasuna A.</span>
        </Link>
        <nav className="col-span-2 md:col-span-1 flex gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname === item.href ? "text-primary" : "text-muted-foreground",
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="col-start-2 row-start-1 md:col-start-3 md:row-start-1">
          <AccessibilityControls />
        </div>
      </div>
    </header>
  );
};
