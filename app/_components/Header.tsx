"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createClient } from "../_lib/supabase/client";
import GlobalSearch from "./GlobalSearch";

type UserMeta = {
  name: string;
  avatarUrl: string | null;
};

export default function Header() {
  const [user, setUser] = useState<UserMeta | null>(null);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUser({
          name:
            (user.user_metadata?.name as string | undefined) ??
            (user.user_metadata?.user_name as string | undefined) ??
            "User",
          avatarUrl:
            (user.user_metadata?.avatar_url as string | undefined) ?? null,
        });
      }
    });
  }, []);

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <header className="sticky top-0 z-30 bg-navy-dark border-b border-slate-gray/20">
      <div className="relative mx-auto flex h-20 max-w-7xl items-center justify-between px-6 sm:px-10 lg:px-16">

        {/* Search — left */}
        <GlobalSearch />

        {/* Logo — center */}
        <div className="absolute left-1/2 -translate-x-1/2">
          <Image
            src="/logo.png"
            alt="Ashas"
            width={160}
            height={80}
            priority
            className="h-[72px] w-auto object-contain"
            style={{ maxWidth: 200 }}
          />
        </div>

        {/* User profile — right */}
        {user && (
          <div className="flex items-center gap-4">
            <div className="hidden md:flex flex-col text-right">
              <span className="text-sm font-bold text-off-white leading-tight">
                {user.name}
              </span>
              <button
                onClick={handleSignOut}
                className="text-[11px] font-bold uppercase tracking-wider text-slate-gray hover:text-rose-400 transition-colors text-right"
              >
                Keluar
              </button>
            </div>
            <div className="rounded-full border-2 border-orange-500 p-0.5">
              {user.avatarUrl ? (
                <Image
                  src={user.avatarUrl}
                  alt={user.name}
                  width={40}
                  height={40}
                  className="h-10 w-10 rounded-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="h-10 w-10 rounded-full bg-ashas-blue flex items-center justify-center text-white font-bold text-base">
                  {user.name.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
