"use client";
import { useState } from "react";
import AppShell from "@/components/AppShell";
import CreatePlaylistButton from "@/components/CreatePlaylistButton";
import {
  redirectToSpotifyLogin, spotifyFetch, getTopTracks, getTopArtists,
  getGenreBreakdown, calcCompatibility, SpotifyTrack, SpotifyArtist, SpotifyUser
} from "@/lib/spotify";

type FriendData = {
  user: SpotifyUser;
  tracks: SpotifyTrack[];
  artists: SpotifyArtist[];
};

// A shareable link stores the friend's token in URL hash (ephemeral, client-only)
export default function CompatibilityPage() {
  const [step, setStep] = useState<"intro" | "loading" | "result">("intro");
  const [myData, setMyData] = useState<FriendData | null>(null);
  const [friendData, setFriendData] = useState<FriendData | null>(null);
  const [score, setScore] = useState(0);
  const [sharedTracks, setSharedTracks] = useState<SpotifyTrack[]>([]);
  const [sharedArtists, setSharedArtists] = useState<SpotifyArtist[]>([]);
  const [error, setError] = useState("");

  async function loadMyData(): Promise<FriendData> {
    const [user, tracks, artists] = await Promise.all([
      spotifyFetch<SpotifyUser>("/me"),
      getTopTracks("medium_term", 50),
      getTopArtists("medium_term", 50),
    ]);
    return { user, tracks, artists };
  }

  async function handleCompare() {
    setStep("loading");
    setError("");
    try {
      const me = await loadMyData();
      setMyData(me);

      // Store token + redirect to friend login
      // After friend logs in, we compare in-memory
      // For simplicity: both users must use the same browser session
      // We save "my" data to sessionStorage and ask friend to log in
      sessionStorage.setItem("compat_my_tracks", JSON.stringify(me.tracks));
      sessionStorage.setItem("compat_my_artists", JSON.stringify(me.artists));
      sessionStorage.setItem("compat_my_user", JSON.stringify(me.user));
      sessionStorage.setItem("compat_waiting", "1");

      alert(
        `Step 1 done! Now hand this device to your friend.\n\nThey'll be redirected to log in with their Spotify account. Once they do, the comparison will run automatically.`
      );
      await redirectToSpotifyLogin();
    } catch {
      setError("Something went wrong. Please try again.");
      setStep("intro");
    }
  }

  // On mount, check if we're the "friend" returning from OAuth
  useState(() => {
    if (typeof window === "undefined") return;
    const waiting = sessionStorage.getItem("compat_waiting");
    const code = new URLSearchParams(window.location.search).get("code");

    if (waiting === "1" && !code) {
      // We're the friend, already have a token from callback
      const myTracks: SpotifyTrack[] = JSON.parse(sessionStorage.getItem("compat_my_tracks") || "[]");
      const myArtists: SpotifyArtist[] = JSON.parse(sessionStorage.getItem("compat_my_artists") || "[]");
      const myUser: SpotifyUser = JSON.parse(sessionStorage.getItem("compat_my_user") || "null");

      if (myTracks.length && myArtists.length && myUser) {
        sessionStorage.removeItem("compat_waiting");
        sessionStorage.removeItem("compat_my_tracks");
        sessionStorage.removeItem("compat_my_artists");
        sessionStorage.removeItem("compat_my_user");

        setStep("loading");
        loadMyData().then((friend) => {
          setFriendData(friend);
          setMyData({ user: myUser, tracks: myTracks, artists: myArtists });

          const s = calcCompatibility(myTracks, friend.tracks, myArtists, friend.artists);
          setScore(s);

          const myTrackIds = new Set(myTracks.map((t) => t.id));
          const shared = friend.tracks.filter((t) => myTrackIds.has(t.id));
          setSharedTracks(shared);

          const myArtistIds = new Set(myArtists.map((a) => a.id));
          const sharedA = friend.artists.filter((a) => myArtistIds.has(a.id));
          setSharedArtists(sharedA);

          setStep("result");
        }).catch(() => {
          setError("Comparison failed. Please try again.");
          setStep("intro");
        });
      }
    }
  });

  function scoreLabel(s: number) {
    if (s >= 80) return { label: "Soulmates", color: "#1DB954" };
    if (s >= 60) return { label: "Kindred Spirits", color: "#06b6d4" };
    if (s >= 40) return { label: "Good Match", color: "#8b5cf6" };
    if (s >= 20) return { label: "Different Vibes", color: "#f97316" };
    return { label: "Opposite Worlds", color: "#ef4444" };
  }

  const { label: scoreLabel_, color: scoreColor } = scoreLabel(score);

  return (
    <AppShell>
      <div className="px-4 py-6 sm:px-8 sm:py-8 max-w-2xl">
        <div className="mb-6">
          <h1 className="font-display text-3xl font-bold text-white mb-1">Compatibility</h1>
          <p className="text-[#6b6b6b] text-sm">Compare your music taste with a friend</p>
        </div>

        {step === "intro" && (
          <div className="card p-8 text-center animate-fade-up">
            <span className="text-5xl block mb-4">⟡</span>
            <h2 className="font-display text-2xl font-bold text-white mb-2">How compatible are you?</h2>
            <p className="text-[#6b6b6b] text-sm mb-6 max-w-sm mx-auto">
              Compare your Spotify listening habits with a friend. You&apos;ll each need to log in — both on this device.
            </p>
            <div className="text-left bg-white/5 rounded-xl p-4 mb-6 space-y-2 text-sm text-[#6b6b6b]">
              <p>① Click the button below — your data loads first</p>
              <p>② Hand the device to your friend</p>
              <p>③ They log in with their Spotify</p>
              <p>④ See your compatibility score instantly</p>
            </div>
            {error && <p className="text-red-400 text-sm mb-4">{error}</p>}
            <button
              onClick={handleCompare}
              className="inline-flex items-center gap-2 bg-[#1DB954] hover:bg-[#1ed760] text-black font-bold px-6 py-3 rounded-full transition-all hover:scale-105"
            >
              Start Comparison
            </button>
          </div>
        )}

        {step === "loading" && (
          <div className="card p-12 text-center animate-fade-in">
            <svg className="w-8 h-8 animate-spin text-[#1DB954] mx-auto mb-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            <p className="text-[#6b6b6b] text-sm">Analysing your music tastes…</p>
          </div>
        )}

        {step === "result" && myData && friendData && (
          <div className="space-y-4 animate-fade-up">
            {/* Score hero */}
            <div className="card p-8 text-center">
              <div className="flex items-center justify-center gap-4 sm:gap-6 mb-4 flex-wrap">
                <div className="text-center">
                  {myData.user.images?.[0]?.url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={myData.user.images[0].url} alt="" className="w-14 h-14 rounded-full mx-auto mb-2 border-2 border-[#1DB954]" />
                  )}
                  <p className="text-white text-sm font-medium">{myData.user.display_name}</p>
                </div>
                <div className="text-center">
                  <div
                    className="text-4xl sm:text-5xl font-display font-bold mb-1"
                    style={{ color: scoreColor }}
                  >
                    {score}%
                  </div>
                  <div className="stat-pill" style={{ color: scoreColor, borderColor: `${scoreColor}40`, background: `${scoreColor}15` }}>
                    {scoreLabel_}
                  </div>
                </div>
                <div className="text-center">
                  {friendData.user.images?.[0]?.url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={friendData.user.images[0].url} alt="" className="w-14 h-14 rounded-full mx-auto mb-2 border-2 border-[#1DB954]" />
                  )}
                  <p className="text-white text-sm font-medium">{friendData.user.display_name}</p>
                </div>
              </div>
            </div>

            {/* Shared tracks */}
            {sharedTracks.length > 0 && (
              <div className="card p-5">
                <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                  <h3 className="text-white font-semibold text-sm">
                    {sharedTracks.length} tracks you both love
                  </h3>
                  <CreatePlaylistButton
                    tracks={sharedTracks}
                    name={`${myData.user.display_name} × ${friendData.user.display_name}`}
                    description="Tracks we both love — made with Statsify"
                  />
                </div>
                <div className="space-y-1">
                  {sharedTracks.slice(0, 10).map((track, i) => (
                    <a key={track.id} href={track.external_urls.spotify} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-3 px-2 py-2 rounded-xl hover:bg-white/5 transition-colors group">
                      <span className="text-[#6b6b6b] text-xs w-5 text-center">{i + 1}</span>
                      {track.album.images[2]?.url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={track.album.images[2].url} alt="" className="w-9 h-9 rounded-lg object-cover" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-white text-sm truncate group-hover:text-[#1DB954] transition-colors">{track.name}</p>
                        <p className="text-[#6b6b6b] text-xs truncate">{track.artists.map(a => a.name).join(", ")}</p>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Shared artists */}
            {sharedArtists.length > 0 && (
              <div className="card p-5">
                <h3 className="text-white font-semibold text-sm mb-3">{sharedArtists.length} artists you both love</h3>
                <div className="flex flex-wrap gap-2">
                  {sharedArtists.map((a) => (
                    <a key={a.id} href={a.external_urls.spotify} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 rounded-full px-3 py-1.5 transition-colors">
                      {a.images[2]?.url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={a.images[2].url} alt="" className="w-5 h-5 rounded-full object-cover" />
                      )}
                      <span className="text-white text-xs">{a.name}</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            <button
              onClick={() => { setStep("intro"); setMyData(null); setFriendData(null); }}
              className="text-[#6b6b6b] hover:text-white text-sm transition-colors"
            >
              ← Try again with someone else
            </button>
          </div>
        )}
      </div>
    </AppShell>
  );
}
