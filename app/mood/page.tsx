"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import TimeRangeSelector from "@/components/TimeRangeSelector";
import CreatePlaylistButton from "@/components/CreatePlaylistButton";
import {
  getTopTracks, getAudioFeatures, classifyMoods,
  SpotifyTrack, TimeRange, TIME_RANGE_LABELS
} from "@/lib/spotify";

const MOOD_META: Record<string, { icon: string; color: string; bg: string; desc: string }> = {
  Hype:     { icon: "⚡", color: "#f97316", bg: "rgba(249,115,22,0.1)",  desc: "High energy bangers to get you moving" },
  Chill:    { icon: "🌊", color: "#06b6d4", bg: "rgba(6,182,212,0.1)",   desc: "Laid-back tracks for easy moments" },
  Happy:    { icon: "☀",  color: "#1DB954", bg: "rgba(29,185,84,0.1)",   desc: "Feel-good songs that lift your mood" },
  Sad:      { icon: "🌙", color: "#8b5cf6", bg: "rgba(139,92,246,0.1)",  desc: "Deep, emotional tracks for introspection" },
  Focus:    { icon: "◎",  color: "#e2e8f0", bg: "rgba(226,232,240,0.05)",desc: "Instrumental and low-distraction music" },
  Romantic: { icon: "♡",  color: "#ec4899", bg: "rgba(236,72,153,0.1)",  desc: "Smooth, warm music for intimate moments" },
};

export default function MoodPage() {
  const [range, setRange] = useState<TimeRange>("short_term");
  const [moods, setMoods] = useState<Record<string, SpotifyTrack[]>>({});
  const [active, setActive] = useState("Hype");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getTopTracks(range, 50)
      .then(async (tracks) => {
        const features = await getAudioFeatures(tracks.map((t) => t.id));
        setMoods(classifyMoods(tracks, features));
      })
      .finally(() => setLoading(false));
  }, [range]);

  const activeTracks = moods[active] || [];
  const meta = MOOD_META[active];

  return (
    <AppShell>
      <div className="px-4 py-6 sm:px-8 sm:py-8 max-w-3xl">
        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold text-white mb-1">Mood Board</h1>
          <p className="text-[#6b6b6b] text-sm">Your tracks sorted by feeling</p>
        </div>
        <TimeRangeSelector value={range} onChange={setRange} />

        {loading ? (
          <div className="mt-8 grid grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-24 rounded-xl" />)}
          </div>
        ) : (
          <div className="mt-6">
            {/* Mood selector */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-6">
              {Object.entries(MOOD_META).map(([mood, m]) => {
                const count = (moods[mood] || []).length;
                return (
                  <button
                    key={mood}
                    onClick={() => setActive(mood)}
                    className={`card p-4 text-left transition-all duration-200 hover:scale-[1.02] ${active === mood ? "border-opacity-60" : ""}`}
                    style={{ borderColor: active === mood ? m.color : undefined, background: active === mood ? m.bg : undefined }}
                  >
                    <span className="text-xl block mb-1">{m.icon}</span>
                    <p className="text-white text-sm font-semibold">{mood}</p>
                    <p className="text-xs mt-0.5" style={{ color: m.color }}>{count} tracks</p>
                  </button>
                );
              })}
            </div>

            {/* Active mood track list */}
            <div className="card p-5">
              <div className="flex items-start justify-between gap-3 mb-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xl">{meta.icon}</span>
                    <h2 className="font-display text-xl font-bold text-white">{active}</h2>
                  </div>
                  <p className="text-[#6b6b6b] text-sm">{meta.desc}</p>
                </div>
                {activeTracks.length > 0 && (
                  <CreatePlaylistButton
                    tracks={activeTracks}
                    name={`${active} Vibes`}
                    description={`My ${active.toLowerCase()} playlist — created with Statsify`}
                  />
                )}
              </div>

              {activeTracks.length === 0 ? (
                <p className="text-[#6b6b6b] text-sm py-4 text-center">No tracks matched this mood for this period.</p>
              ) : (
                <div className="space-y-1">
                  {activeTracks.map((track, i) => (
                    <a
                      key={track.id}
                      href={track.external_urls.spotify}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 transition-colors group animate-fade-up"
                      style={{ animationDelay: `${i * 20}ms` }}
                    >
                      <span className="text-[#6b6b6b] text-xs w-5 text-center flex-shrink-0">{i + 1}</span>
                      {track.album.images[2]?.url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={track.album.images[2].url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm truncate group-hover:text-[#1DB954] transition-colors">{track.name}</p>
                        <p className="text-[#6b6b6b] text-xs truncate">{track.artists.map(a => a.name).join(", ")}</p>
                      </div>
                      <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: meta.color }} />
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
