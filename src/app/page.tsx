"use client";

import { LoginScreen } from "@/app/(agendamentos)/_components/scheduling-app";

export default function HomePage() {
  function handleLogin() {
    const requestedView = new URLSearchParams(window.location.search).get("view");
    const destination = requestedView === "agendamentos" ? "/agendamentos" : "/dashboard";
    window.location.assign(destination);
  }

  return <LoginScreen onLogin={handleLogin} />;
}
