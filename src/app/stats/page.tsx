"use client";

import React, { useEffect, useState } from "react";

interface UserStats {
  userId: string;
  userName: string;
  RED: number;
  YELLOW: number;
  GREEN: number;
  total: number;
}

const COLOR_MAP: Record<string, { bg: string; border: string; label: string }> = {
  RED: {
    bg: "bg-[#e33636]",
    border: "border-[#e33636]",
    label: "Красные дни",
  },
  YELLOW: {
    bg: "bg-[#e1a919]",
    border: "border-[#e1a919]",
    label: "Желтые дни",
  },
  GREEN: {
    bg: "bg-[#1e6340]",
    border: "border-[#1e6340]",
    label: "Зеленые дни",
  },
};

export default function StatsPage() {
  const [stats, setStats] = useState<UserStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-gray-600">Загрузка статистики...</div>
      </div>
    );
  }

  if (stats.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-gray-600 mb-4">Нет данных для отображения</div>
        </div>
      </div>
    );
  }

  // Вычисляем общую статистику для обоих пользователей
  const totalStats = stats.reduce(
    (acc, userStat) => ({
      RED: acc.RED + userStat.RED,
      YELLOW: acc.YELLOW + userStat.YELLOW,
      GREEN: acc.GREEN + userStat.GREEN,
      total: acc.total + userStat.total,
    }),
    { RED: 0, YELLOW: 0, GREEN: 0, total: 0 }
  );

  const renderStatsCard = (
    title: string,
    statData: { RED: number; YELLOW: number; GREEN: number; total: number }
  ) => {
    const maxValue = Math.max(
      statData.RED,
      statData.YELLOW,
      statData.GREEN,
      1
    );

    return (
      <div className="w-full max-w-md mx-auto p-6 rounded-2xl shadow-lg bg-white border border-[#3C1820]">
        <h2 className="text-xl font-bold mb-4 text-center text-gray-800">
          {title}
        </h2>
        <div className="mb-4 text-center text-sm text-gray-600">
          Всего дней: <span className="font-bold">{statData.total}</span>
        </div>

        {/* Статистика по цветам */}
        <div className="space-y-4">
          {(["RED", "YELLOW", "GREEN"] as const).map((color) => {
            const count = statData[color];
            const percentage =
              statData.total > 0
                ? Math.round((count / statData.total) * 100)
                : 0;
            const barWidth = maxValue > 0 ? (count / maxValue) * 100 : 0;

            return (
              <div key={color} className="space-y-2">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-4 h-4 rounded ${COLOR_MAP[color].bg} ${COLOR_MAP[color].border} border`}
                    />
                    <span className="text-sm font-medium text-gray-700">
                      {COLOR_MAP[color].label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-gray-800">
                      {count}
                    </span>
                    <span className="text-xs text-gray-500">
                      ({percentage}%)
                    </span>
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                  <div
                    className={`h-full ${COLOR_MAP[color].bg} transition-all duration-500 rounded-full flex items-center justify-end pr-2`}
                    style={{ width: `${barWidth}%` }}
                  >
                    {count > 0 && (
                      <span className="text-xs font-bold text-white">
                        {count}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Круговая диаграмма или дополнительная информация */}
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="grid grid-cols-3 gap-2 text-center">
            {(["RED", "YELLOW", "GREEN"] as const).map((color) => {
              const count = statData[color];
              const percentage =
                statData.total > 0
                  ? Math.round((count / statData.total) * 100)
                  : 0;

              return (
                <div key={color} className="space-y-1">
                  <div
                    className={`w-8 h-8 rounded-lg mx-auto ${COLOR_MAP[color].bg} ${COLOR_MAP[color].border} border-2`}
                  />
                  <div className="text-xs font-bold text-gray-800">
                    {count}
                  </div>
                  <div className="text-xs text-gray-500">{percentage}%</div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-white font-sans py-32 px-4">
      <main className="w-full max-w-3xl">
        <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
          Статистика
        </h1>
        <div className="space-y-6">
          {/* Общая статистика */}
          {stats.length > 1 && renderStatsCard("Общая статистика", totalStats)}
          
          {/* Статистика по пользователям */}
          {stats.map((userStat) => renderStatsCard(userStat.userName, userStat))}
        </div>
      </main>
    </div>
  );
}

