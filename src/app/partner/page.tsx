"use client";

import React, { useEffect, useState } from "react";
import { PartnerCalendar } from "../PartnerCalendar";

interface User {
  id: string;
  name: string;
}

const LOCAL_KEY = "userId";

export default function PartnerPage() {
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [partner, setPartner] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedId =
      typeof window !== "undefined" ? localStorage.getItem(LOCAL_KEY) : null;
    setCurrentUserId(storedId);
  }, []);

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => {
        setUsers(data);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    if (currentUserId && users.length > 0) {
      // Находим партнера (второго пользователя, не текущего)
      const partnerUser = users.find((u) => u.id !== currentUserId);
      setPartner(partnerUser || null);
    }
  }, [currentUserId, users]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-gray-600">Загрузка...</div>
      </div>
    );
  }

  if (!currentUserId) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-gray-600 mb-4">
            Пожалуйста, выберите пользователя на главной странице
          </div>
        </div>
      </div>
    );
  }

  if (!partner) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="text-center">
          <div className="text-gray-600 mb-4">
            Партнер не найден. В системе должно быть два пользователя.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-white font-sans">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center py-32 px-4 bg-white sm:items-center">
        <div className="w-full max-w-md mx-auto mb-4 text-center">
          <span className="px-3 py-1 bg-pink-100 rounded-lg border border-pink-200 text-pink-800 text-sm font-semibold">
            Календарь партнера: {partner.name}
          </span>
        </div>
        <PartnerCalendar partnerId={partner.id} />
      </main>
    </div>
  );
}
