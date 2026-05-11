"use client";

import Image from "next/image";
import { useState } from "react";
import { createClient } from "../_lib/supabase/client";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loginWithGitHub() {
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-navy-dark flex items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-12">
          <Image
            src="/logo.png"
            alt="Ashas"
            width={56}
            height={56}
            className="mx-auto mb-5 object-contain"
            priority
          />
          <h1 className="text-2xl font-extrabold tracking-tight text-off-white">
            Ashas Dashboard
          </h1>
          <p className="text-sm text-slate-gray mt-2">
            Agency workspace — login untuk masuk
          </p>
        </div>

        <div className="rounded-lg border border-slate-gray/20 bg-white/5 p-8">
          <div className="mb-4 h-1 w-10 bg-cyan-accent rounded-full" />
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-gray mb-6">
            Masuk ke workspace
          </h2>

          <button
            onClick={loginWithGitHub}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 rounded-lg border border-slate-gray/30 bg-off-white text-navy-dark hover:bg-white px-5 py-3.5 text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.44 9.8 8.2 11.38.6.11.82-.26.82-.58v-2.17c-3.34.73-4.04-1.42-4.04-1.42-.54-1.37-1.32-1.74-1.32-1.74-1.08-.74.08-.73.08-.73 1.2.09 1.83 1.23 1.83 1.23 1.06 1.81 2.78 1.29 3.46.98.11-.77.41-1.29.74-1.59-2.66-.3-5.46-1.33-5.46-5.93 0-1.31.47-2.38 1.23-3.22-.12-.3-.53-1.52.12-3.17 0 0 1-.32 3.3 1.23a11.5 11.5 0 0 1 3-.4c1.02.01 2.04.14 3 .4 2.28-1.55 3.29-1.23 3.29-1.23.65 1.65.24 2.87.12 3.17.77.84 1.23 1.91 1.23 3.22 0 4.61-2.81 5.63-5.48 5.92.43.37.81 1.1.81 2.22v3.29c0 .32.22.7.83.58C20.57 21.79 24 17.3 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            {loading ? "Menghubungkan…" : "Login dengan GitHub"}
          </button>

          {error && (
            <p className="mt-4 text-xs text-rose-400 text-center">{error}</p>
          )}
        </div>

        <p className="text-center text-xs text-slate-gray/60 mt-6">
          Dashboard ini hanya untuk Anda. Data aman di Supabase.
        </p>
      </div>
    </div>
  );
}
