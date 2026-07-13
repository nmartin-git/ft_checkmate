'use client';

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";

interface ProfileRankBadgeProps {
  rank: number;
}

export default function ProfileRankBadge({ rank }: ProfileRankBadgeProps) {
  const locale = useLocale();
  const t = useTranslations("profile");

  return (
    <Link
      href={`/${locale}/leaderboard`}
      className="inline-flex items-center gap-2 px-4 py-2 bg-slate-900/80 border border-slate-700/50 hover:border-blue-500/50 rounded-xl transition-all duration-200 group cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
      title={t("view_ranking")}
    >
      <span className="text-sm font-medium text-slate-400 group-hover:text-slate-300 transition-colors">
        {t("ranking")}
      </span>
      <span className="text-lg font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent font-mono tracking-wider group-hover:scale-105 transition-transform">
        #{rank}
      </span>
      
      <svg
        className="w-4 h-4 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-0.5 transition-all"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M9 5l7 7-7 7"
        />
      </svg>
    </Link>
  );
}