"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import TimeRangeSelector from "@/components/TimeRangeSelector";
import CreatePlaylistButton from "@/components/CreatePlaylistButton";
import {
  getTopArtists, getArtistTopTracks, getRelatedArtists,
  formatNumber, SpotifyArtist, SpotifyTrack, TimeRange, TIME_RANGE_LABELS
} from "@/lib/spotify";

export default function ArtistsPage() {
  const [range, setRange] = useState<TimeRange>("short_term");
  const [artists, setArtists] = useState<SpotifyArtist[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<SpotifyArtist | null>(null);
  const [artistTracks, setArtistTracks] = useState<SpotifyTrack[]>([]);
  const [related, setRelated] = useState<SpotifyArtist[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setSelected(null);
    getTopArtists(range, 50).then(setArtists).finally(() => setLoading(false));
  }, [range]);

  async function openArtist(artist: SpotifyArtist) {
    setSelected(artist);
    setDetailLoading(true);
    const [tracks, rel] = await Promise.all([
      getArtistTopTracks(artist.id),
      getRelatedArtists(artist.id),
    ]);
    setArtistTracks(tracks);
    setRelated(rel);
    setDetailLoading(false);
  }

  return (
    <AppShell>
      <div className="px-4 py-6 sm:px-8 sm:py-8 max-w-5xl">
        <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
          <div>
            <h1 className="font-display text-3xl font-bold text-white mb-1">Top Artists</h1>
            <p className="text-[#6b6b6b] text-sm">{TIME_RANGE_LABELS[range].sub}</p>
          </div>
        </div>
        <TimeRangeSelector value={range} onChange={setRange} />

        <div className="mt-6 flex flex-col lg:flex-row gap-6">
          {/* Artist list */}
          <div className={`space-y-1 ${selected ? "lg:w-72 lg:flex-shrink-0" : "flex-1"}`}>
            {loading
              ? Array.from({ length: 12 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-3 py-2.5 rounded-xl">
                    <span className="skeleton w-5 h-4" />
                    <span className="skeleton w-12 h-12 rounded-full" />
                    <div className="flex-1">
                      <span className="skeleton block h-4 w-32 mb-1.5" />
                      <span className="skeleton block h-3 w-20" />
                    </div>
                  </div>
                ))
              : artists.map((artist, i) => (
                  <button
                    key={artist.id}
                    onClick={() => openArtist(artist)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors group text-left animate-fade-up ${
                      selected?.id === artist.id ? "bg-[#1DB954]/10 border border-[#1DB954]/20" : "hover:bg-white/5"
                    }`}
                    style={{ animationDelay: `${i * 20}ms` }}
                  >
                    <span className="text-[#6b6b6b] text-xs w-5 text-center flex-shrink-0">{i + 1}</span>
                    {artist.images[2]?.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={artist.images[2].url} alt="" className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-white/10 flex-shrink-0 flex items-center justify-center text-lg">★</div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm font-medium truncate transition-colors ${selected?.id === artist.id ? "text-[#1DB954]" : "text-white group-hover:text-[#1DB954]"}`}>
                        {artist.name}
                      </p>
                      <p className="text-[#6b6b6b] text-xs truncate capitalize">{artist.genres[0] || "—"}</p>
                    </div>
                    <span className="text-[#6b6b6b] text-xs flex-shrink-0">{artist.popularity}</span>
                  </button>
                ))}
          </div>

          {/* Artist detail panel */}
          {selected && (
            <div className="flex-1 min-w-0 animate-fade-in">
              <div className="card p-5 mb-4">
                <div className="flex flex-col sm:flex-row items-start gap-4 mb-4">
                  {selected.images[1]?.url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={selected.images[1].url} alt="" className="w-20 h-20 rounded-xl object-cover flex-shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h2 className="font-display text-xl font-bold text-white mb-1">{selected.name}</h2>
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {selected.genres.slice(0, 3).map((g) => (
                        <span key={g} className="stat-pill capitalize">{g}</span>
                      ))}
                    </div>
                    <p className="text-[#6b6b6b] text-xs">{formatNumber(selected.followers.total)} followers · Popularity {selected.popularity}/100</p>
                  </div>
                  <button onClick={() => setSelected(null)} className="text-[#6b6b6b] hover:text-white text-lg flex-shrink-0">✕</button>
                </div>

                {detailLoading ? (
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => <div key={i} className="skeleton h-10 rounded-lg" />)}
                  </div>
                ) : (
                  <>
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-white text-sm font-semibold">Top Tracks</h3>
                        <CreatePlaylistButton
                          tracks={artistTracks.slice(0, 10)}
                          name={`Best of ${selected.name}`}
                          description={`Top tracks by ${selected.name} via Statsify`}
                        />
                      </div>
                      <div className="space-y-1">
                        {artistTracks.slice(0, 8).map((track, i) => (
                          <a key={track.id} href={track.external_urls.spotify} target="_blank" rel="noopener noreferrer"
                            className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors group">
                            <span className="text-[#6b6b6b] text-xs w-4">{i + 1}</span>
                            {track.album.images[2]?.url && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={track.album.images[2].url} alt="" className="w-8 h-8 rounded object-cover" />
                            )}
                            <p className="text-white text-xs truncate flex-1 group-hover:text-[#1DB954] transition-colors">{track.name}</p>
                            <span className="text-[#6b6b6b] text-xs">{track.popularity}</span>
                          </a>
                        ))}
                      </div>
                    </div>

                    {related.length > 0 && (
                      <div>
                        <h3 className="text-white text-sm font-semibold mb-2">Related Artists</h3>
                        <div className="flex flex-wrap gap-2">
                          {related.map((r) => (
                            <button key={r.id} onClick={() => openArtist(r)}
                              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 rounded-full px-3 py-1.5 transition-colors">
                              {r.images[2]?.url && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={r.images[2].url} alt="" className="w-5 h-5 rounded-full object-cover" />
                              )}
                              <span className="text-white text-xs">{r.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
