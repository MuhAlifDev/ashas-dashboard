"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/", label: "Home" },
  { href: "/clients", label: "Clients" },
  { href: "/projects", label: "Projects" },
  { href: "/tasks", label: "Tasks" },
  { href: "/finance", label: "Finance" },
  { href: "/workspace", label: "Board" },
];

export default function MobileNav() {
  const pathname = usePathname();

  if (pathname.startsWith("/login") || pathname.startsWith("/auth"))
    return null;

  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-navy-dark text-off-white border-t border-slate-gray/20 flex">
      {items.map((it) => {
        const active =
          it.href === "/" ? pathname === "/" : pathname.startsWith(it.href);
        return (
          <Link
            key={it.href}
            href={it.href}
            className={`flex-1 flex flex-col items-center gap-1 py-3 text-[11px] font-bold ${
              active ? "text-cyan-accent" : "text-slate-gray"
            }`}
          >
            {active && (
              <span className="h-0.5 w-6 bg-cyan-accent rounded-full -mt-2 mb-1" />
            )}
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}
