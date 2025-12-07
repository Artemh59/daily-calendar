"use client";

import React, { useState, useEffect } from "react";

const daysShort = ["Пн", "Вт", "Ср", "Чт", "Пт", "Сб", "Вс"];

const COLOR_MAP: Record<Color, string> = {
  RED: "bg-[#e33636] border-[#e33636]",
  YELLOW: "bg-[#e1a919] border-[#e1a919]",
  GREEN: "bg-[#1e6340] border-[#1e6340]",
};

type Color = "RED" | "YELLOW" | "GREEN";
interface CalendarEntry {
  id: number;
  date: string;
  color: Color;
  note?: string;
  createdAt?: string;
  userId?: string;
}

function getDaysInMonth(year: number, month: number): number[] {
  const numDays = new Date(year, month + 1, 0).getDate();
  return Array.from({ length: numDays }, (_, i) => i + 1);
}

function getFirstDayIndex(year: number, month: number) {
  let d = new Date(year, month, 1).getDay();
  return d === 0 ? 6 : d - 1;
}

interface PinkCalendarProps {
  year?: number;
  month?: number;
}

export const PinkCalendar: React.FC<PinkCalendarProps> = ({ year, month }) => {
  const today = new Date();
  const initialYear = year ?? today.getFullYear();
  const initialMonth = month ?? today.getMonth();

  const [currentYear, setCurrentYear] = useState(initialYear);
  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [entry, setEntry] = useState<CalendarEntry | null>(null);
  const [color, setColor] = useState<Color>("RED");
  const [note, setNote] = useState("");
  const [calendarMap, setCalendarMap] = useState<Record<number, CalendarEntry>>(
    {}
  );
  const [userId, setUserId] = useState<string | null>(null);

  const days = getDaysInMonth(currentYear, currentMonth);
  const firstDayIdx = getFirstDayIndex(currentYear, currentMonth);
  const isThisMonth =
    currentYear === today.getFullYear() && currentMonth === today.getMonth();

  useEffect(() => {
    const storedId =
      typeof window !== "undefined" ? localStorage.getItem("userId") : null;
    setUserId(storedId);
  }, []);

  useEffect(() => {
    // Загрузка entries для текущего месяца (оптимизация)
    if (userId) {
      fetch(
        `/api/calendar?userId=${userId}&date=${currentYear}-${String(
          currentMonth + 1
        ).padStart(2, "0")}-01`
      )
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data)) {
            const byDay: Record<number, CalendarEntry> = {};
            data.forEach((entry: CalendarEntry) => {
              const d = new Date(entry.date).getDate();
              byDay[d] = entry;
            });
            setCalendarMap(byDay);
          }
        });
    }
  }, [currentYear, currentMonth, userId]);

  const openModal = (day: number) => {
    if (!userId) return;
    setSelectedDay(day);
    const entry = calendarMap[day];
    setEntry(entry || null);
    setColor((entry?.color as Color) || "RED");
    setNote(entry?.note || "");
    setModalOpen(true);
  };
  const saveEntry = async () => {
    if (!userId || selectedDay == null) return;
    const date = new Date(currentYear, currentMonth, selectedDay);
    const res = await fetch("/api/calendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, date, color, note }),
    });
    const saved: CalendarEntry = await res.json();
    setCalendarMap((prev) => ({ ...prev, [selectedDay]: saved }));
    setModalOpen(false);
  };

  const handlePrevMonth = () => {
    setCurrentMonth((m) => {
      if (m === 0) {
        setCurrentYear((y) => y - 1);
        return 11;
      }
      return m - 1;
    });
  };
  const handleNextMonth = () => {
    setCurrentMonth((m) => {
      if (m === 11) {
        setCurrentYear((y) => y + 1);
        return 0;
      }
      return m + 1;
    });
  };

  const monthName = new Date(currentYear, currentMonth, 1).toLocaleString(
    "ru-RU",
    {
      month: "long",
    }
  );

  return (
    <div className="w-full max-w-md p-6 rounded-2xl shadow-lg bg-white border border-[#3C1820]">
      <div className="flex items-center justify-between mb-4 gap-2">
        <button
          onClick={handlePrevMonth}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200"
          aria-label="Предыдущий месяц"
        >
          &#8592;
        </button>
        <span
          className="text-xl font-bold text-gray-800 select-none"
          style={{ width: 150, textAlign: "center" }}
        >
          {monthName.charAt(0).toUpperCase() + monthName.slice(1)} {currentYear}
        </span>
        <button
          onClick={handleNextMonth}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200"
          aria-label="Следующий месяц"
        >
          &#8594;
        </button>
      </div>
      <div className="grid grid-cols-7 gap-2 mb-2">
        {daysShort.map((d) => (
          <div key={d} className="text-center font-semibold text-[#646464]">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-2">
        {Array(firstDayIdx)
          .fill("")
          .map((_, i) => (
            <div key={"empty-" + i}></div>
          ))}
        {days.map((day: number) => {
          const isToday = isThisMonth && day === today.getDate();
          const entry = calendarMap[day];
          return (
            <div
              key={day}
              className={
                "w-9 h-9 flex items-center justify-center text-center rounded-lg border transition-colors cursor-pointer " +
                (entry
                  ? COLOR_MAP[entry.color] + " text-white font-bold"
                  : "bg-white text-black border-black hover:bg-gray-100")
              }
              onClick={() => userId && openModal(day)}
              title={entry?.note || undefined}
            >
              {day}
            </div>
          );
        })}
      </div>
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center">
          <div className="bg-[#fff] rounded-xl p-5 w-full max-w-xs border border-[#3C1820] shadow-lg">
            <h2 className="mb-3 text-lg font-bold text-center text-[#E6E6E6]">
              Настроить дату
            </h2>
            <div className="flex justify-between mb-2">
              {(Object.keys(COLOR_MAP) as Color[]).map((col) => (
                <button
                  key={col}
                  onClick={() => setColor(col)}
                  className={`w-9 h-9 rounded-lg border-2 ${COLOR_MAP[col]} ${
                    color === col
                      ? "ring-2 ring-black border-black"
                      : "opacity-60 border-black"
                  }`}
                  aria-label={col}
                />
              ))}
            </div>
            <textarea
              className="w-full border border-black rounded-lg p-2 text-sm mb-3 text-black placeholder-black bg-white focus:border-black"
              rows={2}
              placeholder="Описание..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              maxLength={120}
            />
            <div className="flex gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 py-2 rounded-lg bg-black bg-opacity-10 text-black opacity-50 cursor-not-allowed"
                disabled
              >
                Отмена
              </button>
              <button
                onClick={saveEntry}
                className="flex-1 py-2 rounded-lg bg-pink-500 text-white font-bold"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
