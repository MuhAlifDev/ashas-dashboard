"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

const AUTH_PATHS = ["/login", "/auth"];

export default function DashboardShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuth = AUTH_PATHS.some((p) => pathname.startsWith(p));
  const isWorkspace = pathname.startsWith("/workspace");

  if (isAuth) {
    return <>{children}</>;
  }

  if (isWorkspace) {
    return (
      <div className="md:pl-64 flex flex-col h-screen overflow-hidden">
        <Header />
        <main className="flex-1 overflow-hidden">
          {children}
        </main>
      </div>
    );
  }

  return (
    <div className="md:pl-64 pb-24 md:pb-0 min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-16 py-16 lg:py-20">
          {children}
        </div>
      </main>
    </div>
  );
}
