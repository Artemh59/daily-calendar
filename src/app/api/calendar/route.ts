import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  sendTelegramMessage,
  formatCalendarEntryMessage,
} from "@/lib/telegram";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url!);
  const userId = searchParams.get("userId");
  const date = searchParams.get("date");

  if (!userId || !date) {
    return NextResponse.json(
      { error: "Missing userId or date" },
      { status: 400 }
    );
  }
  try {
    const startDate = new Date(date);
    const endDate = new Date(startDate);
    endDate.setMonth(startDate.getMonth() + 1);
    endDate.setDate(0);
    const entries = await prisma.calendarEntry.findMany({
      where: {
        userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
    });
    return NextResponse.json(entries);
  } catch {
    return NextResponse.json({ error: "Ошибка поиска entry" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { userId, date, color, note } = await req.json();
  if (!userId || !date || !color) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }
  try {
    const entryDate = new Date(date);
    const existingEntry = await prisma.calendarEntry.findUnique({
      where: { userId_date: { userId, date: entryDate } },
    });

    const isUpdate = !!existingEntry;

    const entry = await prisma.calendarEntry.upsert({
      where: { userId_date: { userId, date: entryDate } },
      update: { color, note },
      create: { userId, date: entryDate, color, note },
    });

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { name: true },
    });

    if (user) {
      const message = formatCalendarEntryMessage(
        user.name,
        entryDate,
        color,
        note || null,
        isUpdate
      );
      sendTelegramMessage(message, userId).catch((error) => {
        console.error("Failed to send Telegram message:", error);
      });
    }

    return NextResponse.json(entry);
  } catch {
    return NextResponse.json(
      { error: "Ошибка сохранения entry" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const { userId, date } = await req.json();
  if (!userId || !date) {
    return NextResponse.json({ error: "Missing data" }, { status: 400 });
  }
  try {
    await prisma.calendarEntry.delete({
      where: {
        userId_date: { userId, date: new Date(date) },
      },
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Ошибка удаления" }, { status: 500 });
  }
}
