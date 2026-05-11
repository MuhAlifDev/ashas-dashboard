"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    href: "/",
    label: "Dashboard",
    icon: <path d="M3 12 12 3l9 9M5 10v10h4v-6h6v6h4V10" />,
  },
  {
    href: "/clients",
    label: "Klien",
    icon: (
      <>
        <circle cx="9" cy="8" r="4" />
        <path d="M3 21v-1a6 6 0 0 1 12 0v1M17 11a3 3 0 1 0 0-6M21 21v-1a5 5 0 0 0-4-4.9" />
      </>
    ),
  },
  {
    href: "/projects",
    label: "Project",
    icon: (
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    ),
  },
  {
    href: "/tasks",
    label: "Tugas",
    icon: (
      <>
        <rect x="4" y="4" width="16" height="16" rx="2" />
        <path d="m9 12 2 2 4-4" />
      </>
    ),
  },
  {
    href: "/finance",
    label: "Keuangan",
    icon: (
      <>
        <rect x="3" y="6" width="18" height="13" rx="2" />
        <path d="M3 10h18M7 15h3" />
      </>
    ),
  },
  {
    href: "/workspace",
    label: "Workspace",
    icon: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="M3 9h18M9 21V9" />
      </>
    ),
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  if (pathname.startsWith("/login") || pathname.startsWith("/auth"))
    return null;

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-navy-dark text-off-white border-r border-slate-gray/20 z-40">
      <div className="px-8 pt-10 pb-8">
        <div className="h-1 w-10 bg-cyan-accent rounded-full mb-4" />
        <div className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-gray">
          Navigation
        </div>
      </div>

      <nav className="flex-1 px-4 pb-6 space-y-1">
        {navItems.map((item) => {
          const active =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`group flex items-center gap-4 rounded-md px-4 py-3 text-sm font-bold transition-colors relative ${
                active
                  ? "bg-ashas-blue/15 text-cyan-accent"
                  : "text-slate-gray hover:bg-ashas-blue/10 hover:text-off-white"
              }`}
            >
              {active && (
                <span
                  aria-hidden
                  className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-cyan-accent"
                />
              )}
              <svg
                className="h-5 w-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {item.icon}
              </svg>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-8 py-6 border-t border-slate-gray/15">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-gray">
          Version
        </div>
        <div className="text-xs font-bold text-off-white mt-1">v0.2 · Ashas</div>
      </div>
    </aside>
  );
}
