"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { redirectToSpotifyLogin, isLoggedIn } from "@/lib/spotify";

export default function LandingPage() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isLoggedIn()) router.replace("/dashboard");
  }, [router]);

  if (!mounted) return null;

  const features = [
    { icon: "♪", title: "Top Tracks & Artists", desc: "Across 3 time ranges" },
    { icon: "◈", title: "Genre Breakdown", desc: "Visual taste profile" },
    { icon: "◉", title: "Audio DNA", desc: "Your music personality" },
    { icon: "◐", title: "Mood Playlists", desc: "Auto-sorted by feeling" },
    { icon: "◷", title: "Recently Played", desc: "Full listening history" },
    { icon: "⟡", title: "Compatibility", desc: "Compare with a friend" },
  ];

  return (
    <main className="min-h-screen bg-[#080808] flex flex-col">
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] rounded-full bg-[#1DB954]/6 blur-[120px]" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center flex-1 px-6 py-20 text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 bg-[#1DB954]/10 border border-[#1DB954]/20 rounded-full px-4 py-1.5 text-[#1DB954] text-sm font-medium mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1DB954] animate-pulse" />
          Powered by Spotify
        </div>

        {/* Wordmark */}
        <h1 className="font-display text-5xl sm:text-7xl font-bold text-white mb-4 tracking-tight leading-none">
          Stats<span className="text-[#1DB954]">ify</span>
        </h1>
        <p className="text-[#6b6b6b] text-xl max-w-md leading-relaxed mb-12">
          Deep insights into your Spotify listening habits. Know your music.
        </p>

        {/* CTA */}
        <button
          onClick={redirectToSpotifyLogin}
          className="group inline-flex items-center gap-3 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold px-8 py-4 rounded-full text-base transition-all duration-200 hover:scale-105 active:scale-95 shadow-2xl shadow-[#1DB954]/25 mb-16"
        >
          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-black flex-shrink-0">
            <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
          </svg>
          Connect with Spotify
        </button>

        {/* Feature grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-xl w-full">
          {features.map((f) => (
            <div key={f.title} className="card p-4 text-left">
              <span className="text-[#1DB954] text-lg block mb-2">{f.icon}</span>
              <p className="text-white text-sm font-semibold">{f.title}</p>
              <p className="text-[#6b6b6b] text-xs mt-0.5">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
