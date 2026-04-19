"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import TimeRangeSelector from "@/components/TimeRangeSelector";
import { getTopArtists, getGenreBreakdown, SpotifyArtist, TimeRange, TIME_RANGE_LABELS } from "@/lib/spotify";

const GENRE_COLORS = [
  "#1DB954","#1ed760","#17a349","#0f8a3a","#21c15e",
  "#2de26a","#169641","#0d7a34","#25d464","#1ec857",
  "#13aa46","#0c9040",
];

export default function GenresPage() {
  const [range, setRange] = useState<TimeRange>("short_term");
  const [artists, setArtists] = useState<SpotifyArtist[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getTopArtists(range, 50).then(setArtists).finally(() => setLoading(false));
  }, [range]);

  const genres = getGenreBreakdown(artists);
  const top = genres[0]?.percentage || 1;

  return (
    <AppShell>
      <div className="px-4 py-6 sm:px-8 sm:py-8 max-w-3xl">
        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold text-white mb-1">Genre Breakdown</h1>
          <p className="text-[#6b6b6b] text-sm">{TIME_RANGE_LABELS[range].sub}</p>
        </div>
        <TimeRangeSelector value={range} onChange={setRange} />

        <div className="mt-8">
          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 10 }).map((_, i) => (
                <div key={i} className="skeleton h-12 rounded-xl" />
              ))}
            </div>
          ) : genres.length === 0 ? (
            <p className="text-[#6b6b6b] text-sm">No genre data found.</p>
          ) : (
            <>
              {/* Top genre hero */}
              <div className="card p-6 mb-6 text-center">
                <p className="text-[#6b6b6b] text-xs mb-2">Your #1 genre</p>
                <h2 className="font-display text-3xl sm:text-4xl font-bold text-[#1DB954] capitalize mb-1">{genres[0]?.genre}</h2>
                <p className="text-[#6b6b6b] text-sm">{genres[0]?.percentage}% of your top artists</p>
              </div>

              {/* Bar chart */}
              <div className="card p-5">
                <h3 className="text-white font-semibold text-sm mb-4">All genres</h3>
                <div className="space-y-3">
                  {genres.map((g, i) => (
                    <div key={g.genre} className="animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white text-sm capitalize font-medium">{g.genre}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[#6b6b6b] text-xs">{g.count} artists</span>
                          <span className="text-white text-xs font-semibold">{g.percentage}%</span>
                        </div>
                      </div>
                      <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-700"
                          style={{
                            width: `${(g.percentage / top) * 100}%`,
                            background: GENRE_COLORS[i % GENRE_COLORS.length],
                            opacity: 1 - i * 0.05,
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Artists per genre */}
              <div className="card p-5 mt-4">
                <h3 className="text-white font-semibold text-sm mb-4">Artists by genre</h3>
                <div className="space-y-4">
                  {genres.slice(0, 6).map((g) => {
                    const genreArtists = artists.filter((a) => a.genres.includes(g.genre));
                    return (
                      <div key={g.genre}>
                        <p className="text-[#6b6b6b] text-xs capitalize mb-2">{g.genre}</p>
                        <div className="flex flex-wrap gap-2">
                          {genreArtists.slice(0, 6).map((a) => (
                            <a key={a.id} href={a.external_urls.spotify} target="_blank" rel="noopener noreferrer"
                              className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 rounded-full px-2.5 py-1 transition-colors">
                              {a.images[2]?.url && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={a.images[2].url} alt="" className="w-5 h-5 rounded-full object-cover" />
                              )}
                              <span className="text-white text-xs">{a.name}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
