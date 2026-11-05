"use client";

import { useEffect, useState } from "react";
import Sidebar from "@/components/Sidebar";
import SetupBanner from "@/components/SetupBanner";

export default function AppShell({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      <SetupBanner />
      <div className="flex-1 flex">
        <Sidebar user={user} />
        <main className="flex-1 lg:ml-72 p-4 sm:p-6 lg:p-8 pb-24 lg:pb-12 max-w-7xl mx-auto w-full transition-all">
          {children}
        </main>
      </div>
    </div>
  );
}

