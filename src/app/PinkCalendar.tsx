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
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [checkbox1, setCheckbox1] = useState(false);
  const [checkbox2, setCheckbox2] = useState(false);
  const [entry, setEntry] = useState<CalendarEntry | null>(null);
  const [color, setColor] = useState<Color>("RED");
  const [note, setNote] = useState("");
  const [cursorPosition, setCursorPosition] = useState(0);
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
    const noteText = entry?.note || "";
    setNote(noteText);
    setCursorPosition(noteText.length);
    setModalOpen(true);
  };
  const handleSaveClick = () => {
    // Открываем модальное окно подтверждения
    setConfirmModalOpen(true);
  };

  const confirmSave = async () => {
    if (!checkbox1 || !checkbox2) return;
    if (!userId || selectedDay == null) return;

    const date = new Date(currentYear, currentMonth, selectedDay);
    await fetch("/api/calendar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, date, color, note }),
    });
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
    setModalOpen(false);
    setConfirmModalOpen(false);
    setCheckbox1(false);
    setCheckbox2(false);
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
            // сколько надо дней с конца предыдущего месяца
            const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
            const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
            const prevDays = getDaysInMonth(prevYear, prevMonth);
            // Реальный номер конечного дня прошлого месяца (например, 28, 29, 30, 31)
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
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center">
          <div className="bg-white rounded-xl p-5 w-full max-w-xs border border-[#3C1820] shadow-lg relative">
            {/* Крестик */}
            <button
              className="absolute top-3 right-3 text-2xl text-[#5a5a5a] hover:text-black focus:outline-none"
              onClick={() => setModalOpen(false)}
              aria-label="Закрыть"
            >
              ×
            </button>
            <h2 className="mb-3 text-lg font-extrabold text-center text-black">
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
            <div className="mb-3">
              <textarea
                className="w-full border border-black rounded-lg p-3 text-sm text-black placeholder-gray-400 bg-white focus:border-black focus:outline-none resize-none overflow-y-auto"
                rows={6}
                placeholder="Описание..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                onSelect={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  setCursorPosition(target.selectionStart);
                }}
                onKeyUp={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  setCursorPosition(target.selectionStart);
                }}
                onClick={(e) => {
                  const target = e.target as HTMLTextAreaElement;
                  setCursorPosition(target.selectionStart);
                }}
                style={{
                  minHeight: "120px",
                  maxHeight: "200px",
                  caretColor: "#000000",
                  WebkitTapHighlightColor: "transparent",
                }}
              />
            </div>
            <div className="flex gap-2">
              {entry && (
                <button
                  onClick={async () => {
                    await fetch("/api/calendar", {
                      method: "DELETE",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ userId, date: entry.date }),
                    });
                    // После удаления обновить данные
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
                    setModalOpen(false);
                  }}
                  className="flex-1 py-2 rounded-lg bg-white border border-red-400 text-red-600 font-bold hover:bg-red-50 transition-colors"
                >
                  Удалить
                </button>
              )}
              <button
                onClick={() => setModalOpen(false)}
                className="flex-1 py-2 rounded-lg bg-gray-500 text-black font-bold hover:bg-gray-600 transition-colors"
              >
                Отмена
              </button>
              <button
                onClick={handleSaveClick}
                className="flex-1 py-2 rounded-lg bg-pink-500 text-white font-extrabold hover:bg-pink-600 transition-colors"
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
      {confirmModalOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-80 flex items-center justify-center">
          <div className="bg-white rounded-xl p-5 w-full max-w-xs border border-[#3C1820] shadow-lg relative">
            {/* Крестик */}
            <button
              className="absolute top-3 right-3 text-2xl text-[#5a5a5a] hover:text-black focus:outline-none"
              onClick={() => {
                setConfirmModalOpen(false);
                setCheckbox1(false);
                setCheckbox2(false);
              }}
              aria-label="Закрыть"
            >
              ×
            </button>
            <h2 className="mb-4 text-lg font-extrabold text-center text-black">
              {userId === "2" ? "Ничего не забыла?)" : "Ничего не забыл?)"}
            </h2>
            <div className="space-y-3 mb-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checkbox1}
                  onChange={(e) => setCheckbox1(e.target.checked)}
                  className="w-5 h-5 rounded border-2 border-gray-300 text-pink-500 focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 cursor-pointer"
                />
                <span className="text-sm text-gray-700">
                  Я уверяю что все сказанное является правдой🙂
                </span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={checkbox2}
                  onChange={(e) => setCheckbox2(e.target.checked)}
                  className="w-5 h-5 rounded border-2 border-gray-300 text-pink-500 focus:ring-2 focus:ring-pink-500 focus:ring-offset-2 cursor-pointer"
                />
                <span className="text-sm text-gray-700">
                  И что я ничего не скрываю🙃
                </span>
              </label>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setConfirmModalOpen(false);
                  setCheckbox1(false);
                  setCheckbox2(false);
                }}
                className="flex-1 py-2 rounded-lg bg-gray-500 text-white font-bold hover:bg-gray-600 transition-colors"
              >
                Ладно, ладно
              </button>
              <button
                onClick={confirmSave}
                disabled={!checkbox1 || !checkbox2}
                className={`flex-1 py-2 rounded-lg font-extrabold transition-colors ${
                  checkbox1 && checkbox2
                    ? "bg-pink-500 text-white hover:bg-pink-600"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Подтвердить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
