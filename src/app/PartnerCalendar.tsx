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

interface PartnerCalendarProps {
  partnerId: string;
  year?: number;
  month?: number;
}

export const PartnerCalendar: React.FC<PartnerCalendarProps> = ({
  partnerId,
  year,
  month,
}) => {
  const today = new Date();
  const initialYear = year ?? today.getFullYear();
  const initialMonth = month ?? today.getMonth();

  const [currentYear, setCurrentYear] = useState(initialYear);
  const [currentMonth, setCurrentMonth] = useState(initialMonth);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [entry, setEntry] = useState<CalendarEntry | null>(null);
  const [calendarMap, setCalendarMap] = useState<Record<number, CalendarEntry>>(
    {}
  );

  const days = getDaysInMonth(currentYear, currentMonth);
  const firstDayIdx = getFirstDayIndex(currentYear, currentMonth);
  const isThisMonth =
    currentYear === today.getFullYear() && currentMonth === today.getMonth();

  useEffect(() => {
    if (partnerId) {
      fetch(
        `/api/calendar?userId=${partnerId}&date=${currentYear}-${String(
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
  }, [currentYear, currentMonth, partnerId]);

  const openModal = (day: number) => {
    const entry = calendarMap[day];
    if (entry) {
      setSelectedDay(day);
      setEntry(entry);
      setModalOpen(true);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
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
        {/* Неактивные дни предыдущего месяца */}
        {Array(firstDayIdx)
          .fill(0)
          .map((_, i) => {
            const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
            const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
            const prevDays = getDaysInMonth(prevYear, prevMonth);
            const date = prevDays[prevDays.length - firstDayIdx + i];
            return (
              <div
                key={"prev-" + i}
                className="w-9 h-9 flex items-center justify-center text-center rounded-lg border border-gray-200 bg-gray-100 text-gray-400 opacity-60 select-none cursor-default"
                style={{ pointerEvents: "none" }}
              >
                {date}
              </div>
            );
          })}
        {/* Текущий месяц */}
        {days.map((day: number) => {
          const isToday = isThisMonth && day === today.getDate();
          const entry = calendarMap[day];
          return (
            <div
              key={day}
              className={
                "w-9 h-9 flex items-center justify-center text-center rounded-lg border transition-colors " +
                (entry
                  ? COLOR_MAP[entry.color] +
                    " text-white font-bold cursor-pointer hover:opacity-80"
                  : "bg-white text-black border-black cursor-default")
              }
              onClick={() => entry && openModal(day)}
              title={entry?.note || undefined}
            >
              {day}
            </div>
          );
        })}
        {/* Неактивные дни следующего месяца */}
        {(() => {
          const tail = (7 - ((firstDayIdx + days.length) % 7)) % 7;
          if (!tail) return null;
          return Array(tail)
            .fill(0)
            .map((_, i) => (
              <div
                key={"next-" + i}
                className="w-9 h-9 flex items-center justify-center text-center rounded-lg border border-gray-200 bg-gray-100 text-gray-400 opacity-60 select-none cursor-default"
                style={{ pointerEvents: "none" }}
              >
                {i + 1}
              </div>
            ));
        })()}
      </div>
      {modalOpen && entry && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center">
          <div className="bg-[#fff] rounded-xl p-5 w-full max-w-xs border border-[#3C1820] shadow-lg relative">
            {/* Крестик */}
            <button
              className="absolute top-3 right-3 text-2xl text-[#5a5a5a] hover:text-black focus:outline-none"
              onClick={() => setModalOpen(false)}
              aria-label="Закрыть"
            >
              ×
            </button>
            <h2 className="mb-3 text-lg font-extrabold text-center text-black">
              Просмотр записи
            </h2>
            <div className="mb-3">
              <div className="text-sm text-gray-600 mb-2">Цвет:</div>
              <div className="flex justify-start">
                <div
                  className={`w-9 h-9 rounded-lg border-2 ${
                    COLOR_MAP[entry.color]
                  } border-black`}
                  aria-label={entry.color}
                />
              </div>
            </div>
            {entry.note && (
              <div className="mb-3">
                <div className="text-sm text-gray-600 mb-2">Описание:</div>
                <div className="w-full border border-gray-300 rounded-lg p-2 text-sm text-black bg-gray-50 min-h-[60px]">
                  {entry.note}
                </div>
              </div>
            )}
            {!entry.note && (
              <div className="mb-3 text-sm text-gray-400 italic">
                Нет описания
              </div>
            )}
            <div className="flex gap-2">
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 py-2 rounded-lg bg-gray-500 text-white font-bold hover:bg-gray-600 transition-colors"
              >
                Закрыть
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
