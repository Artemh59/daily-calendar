"use client";
import { useRouter, usePathname } from "next/navigation";

const nav = [
  {
    label: "Мой календарь",
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
        <rect x="3" y="5" width="18" height="16" rx="3" fill="currentColor" />
        <rect x="7" y="2" width="2" height="4" rx="1" fill="#fff" />
        <rect x="15" y="2" width="2" height="4" rx="1" fill="#fff" />
      </svg>
    ),
    href: "/",
  },
  {
    label: "Статистика",
    icon: (
      <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
        <rect x="4" y="11" width="3" height="7" rx="1.5" fill="currentColor" />
        <rect
          x="10.5"
          y="7"
          width="3"
          height="11"
          rx="1.5"
          fill="currentColor"
        />
        <rect x="17" y="4" width="3" height="14" rx="1.5" fill="currentColor" />
      </svg>
    ),
    href: "/stats",
  },
  {
    label: "Партнер",
    icon: (
      <svg width="22" height="22" fill="none" viewBox="0 0 24 24">
        <circle cx="8.5" cy="8.5" r="4.5" fill="currentColor" />
        <circle cx="15.5" cy="8.5" r="4.5" fill="currentColor" opacity=".4" />
        <rect x="2" y="16" width="20" height="5" rx="2.5" fill="currentColor" />
      </svg>
    ),
    href: "/partner",
  },
];

export default function MobileNav() {
  const router = useRouter();
  const pathname = usePathname();
  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-gray-200 flex justify-around items-end h-16 shadow-md md:hidden">
      <button
        className={
          `flex flex-col items-center flex-1 h-full justify-center font-semibold text-xs transition text-gray-500 hover:text-pink-500` +
          (pathname === "/" ? " text-pink-500" : "")
        }
        onClick={() => router.push(nav[0].href)}
        aria-label={nav[0].label}
      >
        <span className="mb-1">{nav[0].icon}</span>
        {nav[0].label}
      </button>
      <button
        className={`relative mb-3 flex flex-col items-center justify-center font-semibold text-xs transition rounded-full border-4 bg-white shadow-lg border-pink-200 z-10 ${
          pathname === nav[1].href
            ? "text-pink-500 border-pink-500"
            : "text-gray-400 hover:text-pink-500"
        }`}
        style={{
          width: 120,
          height: 70,
          boxShadow: "0px 2px 18px -2px #e936a7ab",
        }}
        onClick={() => router.push(nav[1].href)}
        aria-label={nav[1].label}
      >
        <span style={{ marginTop: 10 }}>{nav[1].icon}</span>
        <span
          className="font-bold mt-1 text-[13px] text-center leading-tight"
          style={{
            maxWidth: 80,
            whiteSpace: "normal",
            wordBreak: "break-word",
          }}
        >
          {nav[1].label}
        </span>
      </button>
      <button
        className={
          `flex flex-col items-center flex-1 h-full justify-center font-semibold text-xs transition text-gray-500 hover:text-pink-500` +
          (pathname === nav[2].href ? " text-pink-500" : "")
        }
        onClick={() => router.push(nav[2].href)}
        aria-label={nav[2].label}
      >
        <span className="mb-1">{nav[2].icon}</span>
        {nav[2].label}
      </button>
    </nav>
  );
}
