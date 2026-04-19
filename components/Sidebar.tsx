"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logout } from "@/lib/spotify";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const NAV = [
  { href: "/dashboard",     icon: "⬡", label: "Overview" },
  { href: "/tracks",        icon: "♪", label: "Top Tracks" },
  { href: "/artists",       icon: "★", label: "Top Artists" },
  { href: "/genres",        icon: "◈", label: "Genres" },
  { href: "/dna",           icon: "◉", label: "Audio DNA" },
  { href: "/mood",          icon: "◐", label: "Mood Board" },
  { href: "/recent",        icon: "◷", label: "Recent" },
  { href: "/compatibility", icon: "⟡", label: "Compat." },
];

const BOTTOM_NAV = NAV.slice(0, 5);

function SpotifyIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className}>
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  );
}

export default function Sidebar({ user }: { user: { name: string; image?: string } }) {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => { setDrawerOpen(false); }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = drawerOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [drawerOpen]);

  function handleLogout() {
    logout();
    router.push("/");
  }

  const NavLinks = ({ onClick }: { onClick?: () => void }) => (
    <>
      {NAV.map((item) => {
        const active = pathname === item.href;
        return (
          <Link key={item.href} href={item.href} onClick={onClick}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 group ${
              active ? "bg-[#1DB954]/10 text-[#1DB954]" : "text-[#6b6b6b] hover:text-white hover:bg-white/5"
            }`}>
            <span className={`text-base leading-none transition-transform duration-150 group-hover:scale-110 ${active ? "text-[#1DB954]" : ""}`}>
              {item.icon}
            </span>
            <span className="font-medium">{item.label}</span>
            {active && <span className="ml-auto w-1.5 h-1.5 rounded-full bg-[#1DB954]" />}
          </Link>
        );
      })}
    </>
  );

  return (
    <>
      {/* ─── Desktop sidebar ─────────────────────────────── */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-60 flex-col border-r border-white/5 bg-[#0a0a0a] z-30">
        <div className="px-6 py-6 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1DB954] flex items-center justify-center flex-shrink-0">
              <SpotifyIcon className="w-[18px] h-[18px] fill-black" />
            </div>
            <span className="font-display text-white font-bold text-lg tracking-tight">Statsify</span>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <NavLinks />
        </nav>
        <div className="px-3 py-4 border-t border-white/5">
          <div className="flex items-center gap-3 px-3 py-2">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt={user.name} className="w-8 h-8 rounded-full object-cover border border-white/10 flex-shrink-0" />
            ) : (
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0 text-xs font-bold">
                {user.name[0]}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-white text-sm font-medium truncate">{user.name}</p>
            </div>
            <button onClick={handleLogout} title="Log out"
              className="text-[#6b6b6b] hover:text-white transition-colors text-xs p-1 rounded hover:bg-white/5">
              ⏻
            </button>
          </div>
        </div>
      </aside>

      {/* ─── Mobile top bar ──────────────────────────────── */}
      <header className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-md border-b border-white/5 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#1DB954] flex items-center justify-center">
            <SpotifyIcon className="w-4 h-4 fill-black" />
          </div>
          <span className="font-display text-white font-bold text-base tracking-tight">Statsify</span>
        </div>
        <div className="flex items-center gap-3">
          {user.image ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={user.image} alt={user.name} className="w-7 h-7 rounded-full object-cover border border-white/10" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white">
              {user.name[0]}
            </div>
          )}
          <button onClick={() => setDrawerOpen(true)} aria-label="Open menu"
            className="text-[#6b6b6b] hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </header>

      {/* ─── Drawer backdrop ─────────────────────────────── */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
          onClick={() => setDrawerOpen(false)} />
      )}

      {/* ─── Slide-out drawer ────────────────────────────── */}
      <div className={`lg:hidden fixed top-0 right-0 h-full w-72 z-50 bg-[#0e0e0e] border-l border-white/5 flex flex-col transition-transform duration-300 ease-out ${
        drawerOpen ? "translate-x-0" : "translate-x-full"
      }`}>
        <div className="flex items-center justify-between px-5 py-5 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            {user.image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={user.image} alt={user.name} className="w-9 h-9 rounded-full object-cover border border-white/10" />
            ) : (
              <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-white">
                {user.name[0]}
              </div>
            )}
            <div>
              <p className="text-white text-sm font-semibold truncate max-w-[150px]">{user.name}</p>
              <p className="text-[#1DB954] text-xs">Spotify Connected</p>
            </div>
          </div>
          <button onClick={() => setDrawerOpen(false)}
            className="text-[#6b6b6b] hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <NavLinks onClick={() => setDrawerOpen(false)} />
        </nav>
        <div className="px-4 py-5 border-t border-white/5">
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#6b6b6b] hover:text-red-400 hover:bg-red-400/5 transition-all">
            <span>⏻</span>
            <span>Log out</span>
          </button>
        </div>
      </div>

      {/* ─── Mobile bottom tab bar ───────────────────────── */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0a0a0a]/95 backdrop-blur-md border-t border-white/5 flex items-center justify-around px-1 pt-2 pb-3">
        {BOTTOM_NAV.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}
              className={`flex flex-col items-center gap-1 px-2 py-1 rounded-xl transition-all duration-150 min-w-[52px] ${
                active ? "text-[#1DB954]" : "text-[#6b6b6b]"
              }`}>
              <span className={`text-[22px] leading-none transition-transform ${active ? "scale-110" : ""}`}>
                {item.icon}
              </span>
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </Link>
          );
        })}
        <button onClick={() => setDrawerOpen(true)}
          className="flex flex-col items-center gap-1 px-2 py-1 rounded-xl text-[#6b6b6b] min-w-[52px]">
          <span className="text-[22px] leading-none">≡</span>
          <span className="text-[10px] font-medium leading-none">More</span>
        </button>
      </nav>
    </>
  );
}
