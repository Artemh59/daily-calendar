"use client";
import React, { useEffect, useState } from "react";

interface User {
  id: string;
  name: string;
}

const LOCAL_KEY = "userId";

const UsersList: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    // Получаем userId из localStorage
    const storedId = typeof window !== "undefined" ? localStorage.getItem(LOCAL_KEY) : null;
    setUserId(storedId);
    if (!storedId) {
      setModalOpen(true);
    }
  }, []);

  useEffect(() => {
    fetch("/api/users")
      .then((res) => res.json())
      .then((data) => setUsers(data));
  }, []);

  useEffect(() => {
    if (userId && users.length) {
      setCurrentUser(users.find((u) => u.id === userId) || null);
    }
  }, [userId, users]);

  const handleSelect = (id: string) => {
    setUserId(id);
    localStorage.setItem(LOCAL_KEY, id);
    setModalOpen(false);
  };

  return (
    <>
      {currentUser ? (
        <div className="w-full max-w-md mx-auto mb-4 text-center">
          <span className="px-3 py-1 bg-blue-100 rounded-lg border border-blue-200 text-blue-800 text-sm font-semibold">
            Пользователь: {currentUser.name}
          </span>
        </div>
      ) : null}
      {modalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
          <div className="bg-white rounded-lg shadow-xl p-6 min-w-[280px] max-w-xs mx-auto">
            <h2 className="text-md font-bold mb-3 text-center">Выберите пользователя</h2>
            <ul className="space-y-2">
              {users.map((user) => (
                <li key={user.id}>
                  <button
                    className="w-full py-2 px-4 rounded-lg border border-gray-200 bg-gray-100 hover:bg-blue-100 text-gray-800 text-sm"
                    onClick={() => handleSelect(user.id)}
                  >
                    {user.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </>
  );
};

export default UsersList;
