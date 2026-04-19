// ─── Spotify PKCE Auth + API helpers ────────────────────────────────────────

const CLIENT_ID = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID!;

export const REDIRECT_URI =
  typeof window !== "undefined" ? `${window.location.origin}/callback` : "";

const SCOPES = [
  "user-top-read",
  "user-read-recently-played",
  "playlist-modify-public",
  "playlist-modify-private",
  "user-read-private",
  "user-read-email",
].join(" ");

// ── PKCE helpers ──────────────────────────────────────────────────────────────

function generateRandomString(length: number): string {
  const possible =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const values = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(values)
    .map((x) => possible[x % possible.length])
    .join("");
}

async function sha256(plain: string): Promise<ArrayBuffer> {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  return window.crypto.subtle.digest("SHA-256", data);
}

function base64urlEncode(input: ArrayBuffer): string {
  const bytes = new Uint8Array(input);
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

// ── Auth ──────────────────────────────────────────────────────────────────────

export async function redirectToSpotifyLogin() {
  const codeVerifier = generateRandomString(64);
  const hashed = await sha256(codeVerifier);
  const codeChallenge = base64urlEncode(hashed);
  localStorage.setItem("spotify_code_verifier", codeVerifier);
  const params = new URLSearchParams({
    response_type: "code",
    client_id: CLIENT_ID,
    scope: SCOPES,
    redirect_uri: REDIRECT_URI,
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
  });
  window.location.href = `https://accounts.spotify.com/authorize?${params}`;
}

export async function exchangeCodeForToken(code: string): Promise<void> {
  const codeVerifier = localStorage.getItem("spotify_code_verifier");
  if (!codeVerifier) throw new Error("No code verifier found");
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: "authorization_code",
      code,
      redirect_uri: REDIRECT_URI,
      code_verifier: codeVerifier,
    }),
  });
  if (!res.ok) throw new Error("Token exchange failed");
  const data = await res.json();
  localStorage.setItem("spotify_access_token", data.access_token);
  localStorage.setItem("spotify_refresh_token", data.refresh_token);
  localStorage.setItem("spotify_token_expiry", String(Date.now() + data.expires_in * 1000));
  localStorage.removeItem("spotify_code_verifier");
}

export async function refreshAccessToken(): Promise<void> {
  const refreshToken = localStorage.getItem("spotify_refresh_token");
  if (!refreshToken) throw new Error("No refresh token");
  const res = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });
  if (!res.ok) throw new Error("Token refresh failed");
  const data = await res.json();
  localStorage.setItem("spotify_access_token", data.access_token);
  localStorage.setItem("spotify_token_expiry", String(Date.now() + data.expires_in * 1000));
  if (data.refresh_token) localStorage.setItem("spotify_refresh_token", data.refresh_token);
}

export async function getValidToken(): Promise<string> {
  const token = localStorage.getItem("spotify_access_token");
  const expiry = localStorage.getItem("spotify_token_expiry");
  if (!token) throw new Error("Not authenticated");
  if (expiry && Date.now() > Number(expiry) - 60_000) {
    await refreshAccessToken();
    return localStorage.getItem("spotify_access_token")!;
  }
  return token;
}

export function logout() {
  localStorage.removeItem("spotify_access_token");
  localStorage.removeItem("spotify_refresh_token");
  localStorage.removeItem("spotify_token_expiry");
}

export function isLoggedIn(): boolean {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem("spotify_access_token");
}

// ── Core fetch ────────────────────────────────────────────────────────────────

export async function spotifyFetch<T>(endpoint: string): Promise<T> {
  const token = await getValidToken();
  const res = await fetch(`https://api.spotify.com/v1${endpoint}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Spotify API error: ${res.status}`);
  return res.json();
}

// ── Types ─────────────────────────────────────────────────────────────────────

export type TimeRange = "short_term" | "medium_term" | "long_term";

export const TIME_RANGE_LABELS: Record<TimeRange, { label: string; sub: string }> = {
  short_term: { label: "Last 4 weeks", sub: "Your recent obsessions" },
  medium_term: { label: "Last 6 months", sub: "Your seasonal favorites" },
  long_term: { label: "All time", sub: "Your all-time classics" },
};

export interface SpotifyImage {
  url: string;
  width: number;
  height: number;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  uri: string;
  genres: string[];
  popularity: number;
  followers: { total: number };
  images: SpotifyImage[];
  external_urls: { spotify: string };
}

export interface SpotifyTrack {
  id: string;
  name: string;
  uri: string;
  duration_ms: number;
  popularity: number;
  artists: { id: string; name: string }[];
  album: { name: string; images: SpotifyImage[] };
  external_urls: { spotify: string };
}

export interface AudioFeatures {
  id: string;
  energy: number;
  danceability: number;
  valence: number;
  acousticness: number;
  instrumentalness: number;
  tempo: number;
  loudness: number;
  speechiness: number;
}

export interface RecentlyPlayedItem {
  track: SpotifyTrack;
  played_at: string;
}

export interface SpotifyUser {
  id: string;
  display_name: string;
  email: string;
  images: SpotifyImage[];
  external_urls: { spotify: string };
  followers: { total: number };
}

// ── API functions ─────────────────────────────────────────────────────────────

export async function getCurrentUser(): Promise<SpotifyUser> {
  return spotifyFetch<SpotifyUser>("/me");
}

export async function getTopTracks(timeRange: TimeRange, limit = 50): Promise<SpotifyTrack[]> {
  const data = await spotifyFetch<{ items: SpotifyTrack[] }>(
    `/me/top/tracks?time_range=${timeRange}&limit=${limit}`
  );
  return data.items;
}

export async function getTopArtists(timeRange: TimeRange, limit = 50): Promise<SpotifyArtist[]> {
  const data = await spotifyFetch<{ items: SpotifyArtist[] }>(
    `/me/top/artists?time_range=${timeRange}&limit=${limit}`
  );
  return data.items;
}

export async function getAudioFeatures(trackIds: string[]): Promise<AudioFeatures[]> {
  const ids = trackIds.slice(0, 100).join(",");
  const data = await spotifyFetch<{ audio_features: AudioFeatures[] }>(
    `/audio-features?ids=${ids}`
  );
  return data.audio_features.filter(Boolean);
}

export async function getRecentlyPlayed(limit = 50): Promise<RecentlyPlayedItem[]> {
  const data = await spotifyFetch<{ items: RecentlyPlayedItem[] }>(
    `/me/player/recently-played?limit=${limit}`
  );
  return data.items;
}

export async function getRelatedArtists(artistId: string): Promise<SpotifyArtist[]> {
  const data = await spotifyFetch<{ artists: SpotifyArtist[] }>(
    `/artists/${artistId}/related-artists`
  );
  return data.artists.slice(0, 8);
}

export async function getArtistTopTracks(artistId: string): Promise<SpotifyTrack[]> {
  const data = await spotifyFetch<{ tracks: SpotifyTrack[] }>(
    `/artists/${artistId}/top-tracks?market=US`
  );
  return data.tracks;
}

export async function createPlaylist(
  userId: string,
  name: string,
  description: string,
  isPublic = false
): Promise<{ id: string; external_urls: { spotify: string } }> {
  const token = await getValidToken();
  const res = await fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ name, description, public: isPublic }),
  });
  if (!res.ok) throw new Error("Failed to create playlist");
  return res.json();
}

export async function addTracksToPlaylist(playlistId: string, uris: string[]): Promise<void> {
  const token = await getValidToken();
  // Spotify allows max 100 tracks per request
  for (let i = 0; i < uris.length; i += 100) {
    const chunk = uris.slice(i, i + 100);
    const res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ uris: chunk }),
    });
    if (!res.ok) throw new Error("Failed to add tracks");
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

export function formatDuration(ms: number): string {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function getGenreBreakdown(artists: SpotifyArtist[]): { genre: string; count: number; percentage: number }[] {
  const counts: Record<string, number> = {};
  artists.forEach((a) => a.genres.forEach((g) => { counts[g] = (counts[g] || 0) + 1; }));
  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([genre, count]) => ({ genre, count, percentage: Math.round((count / total) * 100) }));
}

export function getAudioProfile(features: AudioFeatures[]) {
  if (!features.length) return null;
  const avg = (key: keyof AudioFeatures) =>
    features.reduce((sum, f) => sum + (f[key] as number), 0) / features.length;
  return {
    energy: avg("energy"),
    danceability: avg("danceability"),
    valence: avg("valence"),
    acousticness: avg("acousticness"),
    instrumentalness: avg("instrumentalness"),
    speechiness: avg("speechiness"),
    tempo: avg("tempo"),
  };
}

export function getMoodFromFeatures(features: AudioFeatures[]): string {
  const profile = getAudioProfile(features);
  if (!profile) return "Mysterious";
  const { energy, valence, danceability, acousticness } = profile;
  if (valence > 0.7 && energy > 0.7) return "Euphoric";
  if (valence > 0.6 && danceability > 0.7) return "Joyful";
  if (energy > 0.8 && danceability > 0.7) return "Hype";
  if (valence < 0.3 && energy < 0.4) return "Melancholic";
  if (valence < 0.4 && energy > 0.6) return "Intense";
  if (acousticness > 0.6 && energy < 0.5) return "Mellow";
  if (energy < 0.4 && valence > 0.5) return "Chill";
  return "Balanced";
}

export function classifyMoods(tracks: SpotifyTrack[], features: AudioFeatures[]): Record<string, SpotifyTrack[]> {
  const featureMap = new Map(features.map((f) => [f.id, f]));
  const moods: Record<string, SpotifyTrack[]> = {
    Hype: [], Chill: [], Happy: [], Sad: [], Focus: [], Romantic: [],
  };
  tracks.forEach((track) => {
    const f = featureMap.get(track.id);
    if (!f) return;
    if (f.energy > 0.75 && f.danceability > 0.65) moods.Hype.push(track);
    else if (f.energy < 0.4 && f.acousticness > 0.4) moods.Chill.push(track);
    else if (f.valence > 0.7) moods.Happy.push(track);
    else if (f.valence < 0.3 && f.energy < 0.5) moods.Sad.push(track);
    else if (f.instrumentalness > 0.3 || f.speechiness < 0.1) moods.Focus.push(track);
    else if (f.valence > 0.5 && f.energy < 0.6 && f.danceability > 0.5) moods.Romantic.push(track);
    else moods.Chill.push(track);
  });
  return moods;
}

export function calcCompatibility(
  myTracks: SpotifyTrack[],
  theirTracks: SpotifyTrack[],
  myArtists: SpotifyArtist[],
  theirArtists: SpotifyArtist[]
): number {
  const myTrackIds = new Set(myTracks.map((t) => t.id));
  const theirTrackIds = new Set(theirTracks.map((t) => t.id));
  const myArtistIds = new Set(myArtists.map((a) => a.id));
  const theirArtistIds = new Set(theirArtists.map((a) => a.id));

  const sharedTracks = [...myTrackIds].filter((id) => theirTrackIds.has(id)).length;
  const sharedArtists = [...myArtistIds].filter((id) => theirArtistIds.has(id)).length;

  const myGenres = new Set(myArtists.flatMap((a) => a.genres));
  const theirGenres = new Set(theirArtists.flatMap((a) => a.genres));
  const sharedGenres = [...myGenres].filter((g) => theirGenres.has(g)).length;
  const totalGenres = new Set([...myGenres, ...theirGenres]).size;

  const trackScore = Math.min((sharedTracks / 10) * 40, 40);
  const artistScore = Math.min((sharedArtists / 5) * 35, 35);
  const genreScore = totalGenres > 0 ? Math.min((sharedGenres / totalGenres) * 25, 25) : 0;

  return Math.round(trackScore + artistScore + genreScore);
}
