"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import TimeRangeSelector from "@/components/TimeRangeSelector";
import {
  getTopTracks, getAudioFeatures, getAudioProfile, getMoodFromFeatures,
  SpotifyTrack, AudioFeatures, TimeRange, TIME_RANGE_LABELS
} from "@/lib/spotify";

const DNA_TRAITS = [
  { key: "energy",           label: "Energy",         lo: "Calm",      hi: "Intense",    color: "#f97316" },
  { key: "danceability",     label: "Danceability",   lo: "Rigid",     hi: "Groovy",     color: "#8b5cf6" },
  { key: "valence",          label: "Positivity",     lo: "Melancholic",hi: "Euphoric",  color: "#1DB954" },
  { key: "acousticness",     label: "Acousticness",   lo: "Electronic",hi: "Acoustic",   color: "#06b6d4" },
  { key: "instrumentalness", label: "Instrumentals",  lo: "Vocal",     hi: "Instrumental",color:"#ec4899" },
  { key: "speechiness",      label: "Speechiness",    lo: "Melodic",   hi: "Spoken",     color: "#eab308" },
];

const MOOD_DESCRIPTIONS: Record<string, string> = {
  Euphoric:    "You thrive on high-energy happiness — anthems and feel-good bangers define your vibe.",
  Joyful:      "Your music is upbeat and danceable. You gravitate toward tracks that make you smile.",
  Hype:        "High energy and rhythm — your playlist could soundtrack a stadium.",
  Melancholic: "You lean into emotional depth. Slow, introspective music resonates with you.",
  Intense:     "Dark energy, big sounds. Your taste is powerful and emotionally charged.",
  Mellow:      "Soft and organic. You love acoustic textures and laid-back sounds.",
  Chill:       "Low key and relaxed. Your music is the soundtrack to calm moments.",
  Balanced:    "Your taste spans the full spectrum — you're a true musical omnivore.",
};

export default function DNAPage() {
  const [range, setRange] = useState<TimeRange>("short_term");
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [features, setFeatures] = useState<AudioFeatures[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getTopTracks(range, 50)
      .then(async (t) => {
        setTracks(t);
        if (t.length) {
          const f = await getAudioFeatures(t.map((x) => x.id));
          setFeatures(f);
        }
      })
      .finally(() => setLoading(false));
  }, [range]);

  const profile = getAudioProfile(features);
  const mood = getMoodFromFeatures(features);
  const avgTempo = features.length
    ? Math.round(features.reduce((s, f) => s + f.tempo, 0) / features.length)
    : 0;

  // Outlier tracks (most extreme per dimension)
  function getOutlier(key: keyof AudioFeatures, high: boolean) {
    if (!features.length || !tracks.length) return null;
    const featureMap = new Map(features.map((f) => [f.id, f]));
    const sorted = tracks
      .filter((t) => featureMap.has(t.id))
      .sort((a, b) => {
        const fa = featureMap.get(a.id)![key] as number;
        const fb = featureMap.get(b.id)![key] as number;
        return high ? fb - fa : fa - fb;
      });
    return sorted[0] || null;
  }

  return (
    <AppShell>
      <div className="px-4 py-6 sm:px-8 sm:py-8 max-w-3xl">
        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold text-white mb-1">Audio DNA</h1>
          <p className="text-[#6b6b6b] text-sm">Your music personality, decoded</p>
        </div>
        <TimeRangeSelector value={range} onChange={setRange} />

        {loading ? (
          <div className="mt-8 space-y-4">
            {Array.from({ length: 6 }).map((_, i) => <div key={i} className="skeleton h-16 rounded-xl" />)}
          </div>
        ) : !profile ? (
          <p className="text-[#6b6b6b] mt-8 text-sm">Not enough data for this period.</p>
        ) : (
          <div className="mt-8 space-y-4">
            {/* Mood card */}
            <div className="card p-6 text-center animate-fade-up">
              <p className="text-[#6b6b6b] text-xs mb-2">Your musical mood</p>
              <h2 className="font-display text-4xl sm:text-5xl font-bold text-[#1DB954] mb-3">{mood}</h2>
              <p className="text-[#6b6b6b] text-sm max-w-sm mx-auto">{MOOD_DESCRIPTIONS[mood]}</p>
              <div className="flex items-center justify-center gap-6 mt-4 pt-4 border-t border-white/5">
                <div className="text-center">
                  <p className="text-white font-bold text-xl">{avgTempo}</p>
                  <p className="text-[#6b6b6b] text-xs">Avg BPM</p>
                </div>
                <div className="text-center">
                  <p className="text-white font-bold text-xl">{tracks.length}</p>
                  <p className="text-[#6b6b6b] text-xs">Tracks analysed</p>
                </div>
              </div>
            </div>

            {/* Trait bars */}
            <div className="card p-5 animate-fade-up" style={{ animationDelay: "100ms" }}>
              <h3 className="text-white font-semibold text-sm mb-5">Trait breakdown</h3>
              <div className="space-y-5">
                {DNA_TRAITS.map(({ key, label, lo, hi, color }) => {
                  const val = profile[key as keyof typeof profile] as number;
                  const pct = Math.round(val * 100);
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white text-sm font-medium">{label}</span>
                        <span className="text-white text-sm font-bold">{pct}%</span>
                      </div>
                      <div className="relative h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="absolute left-0 top-0 h-full rounded-full transition-all duration-700"
                          style={{ width: `${pct}%`, background: color }}
                        />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-[#6b6b6b] text-xs">{lo}</span>
                        <span className="text-[#6b6b6b] text-xs">{hi}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Outlier tracks */}
            <div className="card p-5 animate-fade-up" style={{ animationDelay: "200ms" }}>
              <h3 className="text-white font-semibold text-sm mb-4">Defining tracks</h3>
              <div className="space-y-3">
                {[
                  { label: "Most energetic", track: getOutlier("energy", true) },
                  { label: "Most danceable", track: getOutlier("danceability", true) },
                  { label: "Happiest",        track: getOutlier("valence", true) },
                  { label: "Most acoustic",   track: getOutlier("acousticness", true) },
                  { label: "Most melancholic",track: getOutlier("valence", false) },
                ].map(({ label, track }) => track && (
                  <a key={label} href={track.external_urls.spotify} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-3 group">
                    <span className="text-[#6b6b6b] text-xs w-24 sm:w-32 flex-shrink-0">{label}</span>
                    {track.album.images[2]?.url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={track.album.images[2].url} alt="" className="w-8 h-8 rounded object-cover flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-white text-sm truncate group-hover:text-[#1DB954] transition-colors">{track.name}</p>
                      <p className="text-[#6b6b6b] text-xs truncate">{track.artists.map(a => a.name).join(", ")}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Taste shift comparison */}
            <div className="card p-5 animate-fade-up" style={{ animationDelay: "300ms" }}>
              <h3 className="text-white font-semibold text-sm mb-1">Time range</h3>
              <p className="text-[#6b6b6b] text-xs mb-4">Switch the selector above to see how your taste shifts over time</p>
              <div className="flex gap-2 text-xs text-[#6b6b6b]">
                <span className="stat-pill">short_term = recent obsessions</span>
                <span className="stat-pill">long_term = core identity</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppShell>
  );
}
