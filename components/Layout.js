import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import logoImg from "../images/_BmLyLLF_400x400.png";

const nav = [
  { href: "/", label: "Home" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/waitlist", label: "Waitlist" },
  { href: "/pay", label: "Pricing" },
];

export default function Layout({ children, title }) {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col bg-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6">
          <Link
            href="/"
            className="flex items-center gap-3 text-lg font-semibold tracking-tight text-white transition hover:opacity-90"
          >
            <span className="relative h-9 w-9 shrink-0 overflow-hidden rounded-lg shadow-glow ring-1 ring-white/15">
              <Image
                src={logoImg}
                alt="Hirvana"
                width={36}
                height={36}
                className="object-cover"
                priority
              />
            </span>
            <span className="sr-only">Hirvana</span>
          </Link>
          <nav
            className="flex max-w-[min(100%,18rem)] flex-1 justify-end gap-0.5 overflow-x-auto sm:max-w-none sm:flex-none sm:justify-center sm:gap-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            aria-label="Main"
          >
            {nav.map(({ href, label }) => {
              const active = router.pathname === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`shrink-0 rounded-lg px-2.5 py-2 text-sm font-medium transition sm:px-3 ${
                    active
                      ? "bg-slate-800/90 text-blue-300"
                      : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 py-8 sm:px-6 sm:py-12">
        {title && (
          <h1 className="mb-8 text-3xl font-bold tracking-tight text-white sm:text-4xl">
            {title}
          </h1>
        )}
        {children}
      </main>

      <footer className="border-t border-slate-800/80 py-8 text-center text-sm text-slate-500">
        <p>© {new Date().getFullYear()} Hirvana — AI + mentorship to get hired faster.</p>
        <p className="mt-2 flex flex-wrap items-center justify-center gap-1.5 text-xs text-slate-600">
          <span>Built with</span>
          <svg
            className="h-3.5 w-3.5 text-rose-500"
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden
          >
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
          <span>by Unnati</span>
        </p>
      </footer>
    </div>
  );
}
