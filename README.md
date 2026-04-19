# Statsify — Know Your Music

A full-featured Spotify stats app built with Next.js + Tailwind CSS.

## Features

| Page | What it does |
|---|---|
| **Overview** | Dashboard with quick stats and sound profile |
| **Top Tracks** | Your 50 most-played tracks, any time range, save as playlist |
| **Top Artists** | Your top artists with deep-dive: top tracks + related artists |
| **Genres** | Visual breakdown of your genre taste |
| **Audio DNA** | Energy, danceability, valence and 5 more traits decoded |
| **Mood Board** | Tracks sorted into Hype / Chill / Happy / Sad / Focus / Romantic |
| **Recently Played** | Last 50 plays grouped by day, save as playlist |
| **Compatibility** | Compare taste with a friend, get a score + shared playlist |

## Setup

### 1. Spotify App
1. Go to [developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
2. Create an app, add redirect URI: `https://your-vercel-url.vercel.app/callback`
3. Copy your **Client ID**

### 2. Environment
```bash
cp .env.local.example .env.local
# paste your Client ID
```

### 3. Run
```bash
npm install
npm run dev
```

## Deploy to Vercel
1. Push to GitHub
2. Import on [vercel.com](https://vercel.com)
3. Add `NEXT_PUBLIC_SPOTIFY_CLIENT_ID` in Environment Variables
4. Add your Vercel URL + `/callback` as a Redirect URI in Spotify dashboard

## Project structure
```
app/
  page.tsx              ← Landing page
  callback/page.tsx     ← OAuth callback
  dashboard/page.tsx    ← Overview
  tracks/page.tsx       ← Top tracks
  artists/page.tsx      ← Top artists + deep dive
  genres/page.tsx       ← Genre breakdown
  dna/page.tsx          ← Audio DNA
  mood/page.tsx         ← Mood board
  recent/page.tsx       ← Recently played
  compatibility/page.tsx← Friend comparison
components/
  AppShell.tsx          ← Auth guard + sidebar layout
  Sidebar.tsx           ← Navigation
  TimeRangeSelector.tsx ← Reusable time picker
  CreatePlaylistButton.tsx ← Reusable save button
lib/
  spotify.ts            ← All API + auth logic
```
