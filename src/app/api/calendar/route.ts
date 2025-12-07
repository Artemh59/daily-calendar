import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

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
    const entry = await prisma.calendarEntry.upsert({
      where: { userId_date: { userId, date: new Date(date) } },
      update: { color, note },
      create: { userId, date: new Date(date), color, note },
    });
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
