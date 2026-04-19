"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import AppShell from "@/components/AppShell";
import {
  getCurrentUser, getTopTracks, getTopArtists, getAudioFeatures,
  getAudioProfile, getMoodFromFeatures, formatNumber,
  SpotifyUser, SpotifyTrack, SpotifyArtist, TimeRange
} from "@/lib/spotify";

export default function DashboardPage() {
  const [user, setUser] = useState<SpotifyUser | null>(null);
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [artists, setArtists] = useState<SpotifyArtist[]>([]);
  const [mood, setMood] = useState("…");
  const [profile, setProfile] = useState<ReturnType<typeof getAudioProfile>>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [u, t, a] = await Promise.all([
          getCurrentUser(),
          getTopTracks("short_term", 20),
          getTopArtists("short_term", 20),
        ]);
        setUser(u); setTracks(t); setArtists(a);
        if (t.length) {
          const features = await getAudioFeatures(t.map((x) => x.id));
          setMood(getMoodFromFeatures(features));
          setProfile(getAudioProfile(features));
        }
      } finally { setLoading(false); }
    }
    load();
  }, []);

  const quickStats = [
    { label: "Top track", value: tracks[0]?.name || "—", sub: tracks[0]?.artists[0]?.name || "" },
    { label: "Top artist", value: artists[0]?.name || "—", sub: artists[0]?.genres[0] || "" },
    { label: "Current mood", value: mood, sub: "Based on last 4 weeks" },
    { label: "Followers", value: user ? formatNumber(user.followers?.total ?? 0) : "—", sub: "Spotify followers" },
  ];

  const shortcuts = [
    { href: "/tracks",    icon: "♪", label: "Top Tracks",       color: "from-emerald-500/20 to-transparent" },
    { href: "/artists",   icon: "★", label: "Top Artists",      color: "from-violet-500/20 to-transparent" },
    { href: "/genres",    icon: "◈", label: "Genres",           color: "from-amber-500/20 to-transparent" },
    { href: "/dna",       icon: "◉", label: "Audio DNA",        color: "from-cyan-500/20 to-transparent" },
    { href: "/mood",      icon: "◐", label: "Mood Board",       color: "from-pink-500/20 to-transparent" },
    { href: "/recent",    icon: "◷", label: "Recent",           color: "from-orange-500/20 to-transparent" },
    { href: "/compatibility", icon: "⟡", label: "Compatibility", color: "from-blue-500/20 to-transparent" },
  ];

  return (
    <AppShell>
      <div className="px-4 py-6 sm:px-8 sm:py-8 max-w-5xl">
        {/* Header */}
        <div className="mb-8 animate-fade-up">
          <p className="text-[#6b6b6b] text-sm mb-1">Welcome back</p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-white">
            {user?.display_name?.split(" ")[0] ?? "…"}
          </h1>
        </div>

        {/* Quick stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {quickStats.map((s, i) => (
            <div key={s.label} className="card p-4 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
              <p className="text-[#6b6b6b] text-xs mb-2">{s.label}</p>
              <p className="text-white font-semibold text-sm truncate">{loading ? <span className="skeleton block h-4 w-24" /> : s.value}</p>
              <p className="text-[#6b6b6b] text-xs truncate mt-0.5">{loading ? "" : s.sub}</p>
            </div>
          ))}
        </div>

        {/* Audio profile mini */}
        {profile && (
          <div className="card p-5 mb-8 animate-fade-up" style={{ animationDelay: "200ms" }}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display text-white font-semibold">Your sound profile</h2>
              <Link href="/dna" className="text-[#1DB954] text-xs hover:underline">Full DNA →</Link>
            </div>
            <div className="grid grid-cols-3 gap-4">
              {[
                { key: "energy", label: "Energy" },
                { key: "danceability", label: "Dance" },
                { key: "valence", label: "Positivity" },
              ].map(({ key, label }) => (
                <div key={key}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className="text-[#6b6b6b]">{label}</span>
                    <span className="text-white">{Math.round((profile[key as keyof typeof profile] as number) * 100)}%</span>
                  </div>
                  <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full green-bar transition-all duration-700"
                      style={{ width: `${(profile[key as keyof typeof profile] as number) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Shortcuts grid */}
        <h2 className="font-display text-white font-semibold mb-3 text-sm uppercase tracking-widest text-[#6b6b6b]">
          Explore
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mb-8">
          {shortcuts.map((s, i) => (
            <Link
              key={s.href}
              href={s.href}
              className={`card p-4 hover:border-[#1DB954]/30 transition-all duration-200 hover:scale-[1.02] group animate-fade-up bg-gradient-to-br ${s.color}`}
              style={{ animationDelay: `${300 + i * 50}ms` }}
            >
              <span className="text-2xl block mb-3 group-hover:scale-110 transition-transform duration-200">{s.icon}</span>
              <p className="text-white text-sm font-semibold">{s.label}</p>
            </Link>
          ))}
        </div>

        {/* Top 5 tracks preview */}
        <div className="card p-5 animate-fade-up" style={{ animationDelay: "600ms" }}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-white font-semibold">This month's top tracks</h2>
            <Link href="/tracks" className="text-[#1DB954] text-xs hover:underline">See all →</Link>
          </div>
          <div className="space-y-1">
            {loading
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 py-2 px-2">
                    <span className="skeleton w-4 h-4" />
                    <span className="skeleton w-10 h-10 rounded-lg" />
                    <div className="flex-1">
                      <span className="skeleton block h-3.5 w-36 mb-1.5" />
                      <span className="skeleton block h-3 w-20" />
                    </div>
                  </div>
                ))
              : tracks.slice(0, 5).map((track, idx) => (
                  <a
                    key={track.id}
                    href={track.external_urls.spotify}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 py-2 px-2 rounded-xl hover:bg-white/5 transition-colors group"
                  >
                    <span className="text-[#6b6b6b] text-xs w-4 text-center">{idx + 1}</span>
                    {track.album.images[2]?.url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={track.album.images[2].url} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate group-hover:text-[#1DB954] transition-colors">{track.name}</p>
                      <p className="text-[#6b6b6b] text-xs truncate">{track.artists.map(a => a.name).join(", ")}</p>
                    </div>
                  </a>
                ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
