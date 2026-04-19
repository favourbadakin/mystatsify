"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import TimeRangeSelector from "@/components/TimeRangeSelector";
import CreatePlaylistButton from "@/components/CreatePlaylistButton";
import { getTopTracks, formatDuration, SpotifyTrack, TimeRange, TIME_RANGE_LABELS } from "@/lib/spotify";

export default function TracksPage() {
  const [range, setRange] = useState<TimeRange>("short_term");
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getTopTracks(range, 50)
      .then(setTracks)
      .finally(() => setLoading(false));
  }, [range]);

  return (
    <AppShell>
      <div className="px-4 py-6 sm:px-8 sm:py-8 max-w-3xl">
        <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
          <div>
            <h1 className="font-display text-3xl font-bold text-white mb-1">Top Tracks</h1>
            <p className="text-[#6b6b6b] text-sm">{TIME_RANGE_LABELS[range].sub}</p>
          </div>
          {!loading && tracks.length > 0 && (
            <CreatePlaylistButton
              tracks={tracks}
              name={`Top Tracks · ${TIME_RANGE_LABELS[range].label}`}
              description={`My ${tracks.length} most-played tracks — ${TIME_RANGE_LABELS[range].label.toLowerCase()} via Statsify`}
            />
          )}
        </div>

        <TimeRangeSelector value={range} onChange={setRange} />

        <div className="mt-6 space-y-1">
          {loading
            ? Array.from({ length: 15 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 px-3 py-2.5 rounded-xl">
                  <span className="skeleton w-5 h-4" />
                  <span className="skeleton w-12 h-12 rounded-lg" />
                  <div className="flex-1">
                    <span className="skeleton block h-4 w-48 mb-1.5" />
                    <span className="skeleton block h-3 w-28" />
                  </div>
                  <span className="skeleton w-8 h-3" />
                </div>
              ))
            : tracks.map((track, i) => (
                <a
                  key={track.id}
                  href={track.external_urls.spotify}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-4 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors group animate-fade-up"
                  style={{ animationDelay: `${i * 20}ms` }}
                >
                  <span className="text-[#6b6b6b] text-xs w-5 text-center flex-shrink-0">{i + 1}</span>
                  {track.album.images[2]?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={track.album.images[2].url} alt="" className="w-12 h-12 rounded-lg object-cover flex-shrink-0 shadow-md" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-white/5 flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-medium truncate group-hover:text-[#1DB954] transition-colors">{track.name}</p>
                    <p className="text-[#6b6b6b] text-xs truncate">{track.artists.map(a => a.name).join(", ")}</p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <div className="w-16 h-1 bg-white/5 rounded-full overflow-hidden hidden sm:block">
                      <div className="h-full green-bar" style={{ width: `${track.popularity}%` }} />
                    </div>
                    <span className="text-[#6b6b6b] text-xs w-9 text-right hidden sm:block">{formatDuration(track.duration_ms)}</span>
                  </div>
                </a>
              ))}
        </div>
      </div>
    </AppShell>
  );
}
