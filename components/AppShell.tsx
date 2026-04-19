"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { isLoggedIn, getCurrentUser, SpotifyUser } from "@/lib/spotify";
import Sidebar from "@/components/Sidebar";

export default function AppShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<SpotifyUser | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!isLoggedIn()) { router.replace("/"); return; }
    getCurrentUser()
      .then(setUser)
      .catch(() => router.replace("/"))
      .finally(() => setChecking(false));
  }, [router]);

  if (checking) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="flex items-center gap-3 text-[#6b6b6b]">
          <svg className="w-5 h-5 animate-spin text-[#1DB954]" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm">Loading your profile…</span>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex min-h-screen bg-[#080808]">
      <Sidebar user={{ name: user.display_name, image: user.images?.[0]?.url }} />

      {/*
        Desktop: offset left by sidebar width (ml-60)
        Mobile:  no left offset, but pad top for header (pt-14) and bottom for tab bar (pb-20)
      */}
      <main className="
        w-full min-h-screen overflow-x-hidden
        pt-14 pb-20
        lg:ml-60 lg:pt-0 lg:pb-0
      ">
        {children}
      </main>
    </div>
  );
}
