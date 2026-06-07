"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

type NavbarProps = {
  email: string;
};

export function Navbar({ email }: NavbarProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);

    await fetch("/api/auth/logout", {
      method: "POST",
    });

    router.push("/login");
    router.refresh();
  }

  return (
    <header className="border-b border-gray-200 bg-white">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <a className="text-sm font-semibold text-gray-950" href="/">
          Face Recognition
        </a>

        <div className="flex items-center gap-4">
          <span className="hidden text-sm text-gray-600 sm:inline">{email}</span>
          <button
            className="rounded-md border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isLoggingOut}
            onClick={handleLogout}
            type="button"
          >
            {isLoggingOut ? "Logging out..." : "Logout"}
          </button>
        </div>
      </nav>
    </header>
  );
}
