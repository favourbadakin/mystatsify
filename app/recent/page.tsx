"use client";
import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import CreatePlaylistButton from "@/components/CreatePlaylistButton";
import { getRecentlyPlayed, formatDuration, RecentlyPlayedItem } from "@/lib/spotify";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function groupByDay(items: RecentlyPlayedItem[]) {
  const groups: { date: string; items: RecentlyPlayedItem[] }[] = [];
  items.forEach((item) => {
    const d = new Date(item.played_at).toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" });
    const last = groups[groups.length - 1];
    if (last && last.date === d) last.items.push(item);
    else groups.push({ date: d, items: [item] });
  });
  return groups;
}

export default function RecentPage() {
  const [items, setItems] = useState<RecentlyPlayedItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getRecentlyPlayed(50).then(setItems).finally(() => setLoading(false));
  }, []);

  const groups = groupByDay(items);
  const uniqueTracks = [...new Map(items.map((i) => [i.track.id, i.track])).values()];

  return (
    <AppShell>
      <div className="px-4 py-6 sm:px-8 sm:py-8 max-w-2xl">
        <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
          <div>
            <h1 className="font-display text-3xl font-bold text-white mb-1">Recently Played</h1>
            <p className="text-[#6b6b6b] text-sm">Your last 50 plays</p>
          </div>
          {!loading && uniqueTracks.length > 0 && (
            <CreatePlaylistButton
              tracks={uniqueTracks}
              name="Recent Plays"
              description="My recently played tracks via Statsify"
            />
          )}
        </div>

        {loading ? (
          <div className="space-y-1">
            {Array.from({ length: 15 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3 px-2 py-2.5 rounded-xl">
                <span className="skeleton w-10 h-10 rounded-lg" />
                <div className="flex-1">
                  <span className="skeleton block h-4 w-40 mb-1.5" />
                  <span className="skeleton block h-3 w-24" />
                </div>
                <span className="skeleton w-12 h-3" />
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {groups.map((group) => (
              <div key={group.date}>
                <h3 className="text-[#6b6b6b] text-xs font-semibold uppercase tracking-widest mb-2 px-2">{group.date}</h3>
                <div className="space-y-0.5">
                  {group.items.map((item, i) => (
                    <a
                      key={`${item.track.id}-${item.played_at}`}
                      href={item.track.external_urls.spotify}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 transition-colors group animate-fade-up"
                      style={{ animationDelay: `${i * 15}ms` }}
                    >
                      {item.track.album.images[2]?.url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.track.album.images[2].url} alt="" className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-white/5 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm font-medium truncate group-hover:text-[#1DB954] transition-colors">{item.track.name}</p>
                        <p className="text-[#6b6b6b] text-xs truncate">{item.track.artists.map(a => a.name).join(", ")}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <p className="text-[#6b6b6b] text-xs">{timeAgo(item.played_at)}</p>
                        <p className="text-[#6b6b6b] text-xs">{formatDuration(item.track.duration_ms)}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
