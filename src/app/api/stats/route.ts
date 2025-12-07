import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url!);
  const userId = searchParams.get("userId");

  try {
    if (userId) {
      // Статистика для конкретного пользователя
      const entries = await prisma.calendarEntry.findMany({
        where: { userId },
      });

      const stats = {
        RED: 0,
        YELLOW: 0,
        GREEN: 0,
        total: entries.length,
      };

      entries.forEach((entry) => {
        stats[entry.color]++;
      });

      return NextResponse.json(stats);
    } else {
      // Статистика для всех пользователей
      const users = await prisma.user.findMany({
        select: { id: true, name: true },
      });

      const allStats = await Promise.all(
        users.map(async (user) => {
          const entries = await prisma.calendarEntry.findMany({
            where: { userId: user.id },
          });

          const stats = {
            RED: 0,
            YELLOW: 0,
            GREEN: 0,
            total: entries.length,
          };

          entries.forEach((entry) => {
            stats[entry.color]++;
          });

          return {
            userId: user.id,
            userName: user.name,
            ...stats,
          };
        })
      );

      return NextResponse.json(allStats);
    }
  } catch (error) {
    return NextResponse.json(
      { error: "Ошибка получения статистики" },
      { status: 500 }
    );
  }
}
