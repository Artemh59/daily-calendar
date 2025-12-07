import Image from "next/image";
import { PinkCalendar } from "./PinkCalendar";
import UsersList from "./UsersList";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-white font-sans">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center py-32 px-4 bg-white sm:items-center">
        <UsersList />
        <PinkCalendar />
      </main>
    </div>
  );
}
