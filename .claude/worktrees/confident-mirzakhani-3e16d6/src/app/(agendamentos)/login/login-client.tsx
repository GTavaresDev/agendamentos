"use client";

import { LoginScreen } from "@/app/(agendamentos)/(left-nav-bar)/_components/scheduling-app";

export function LoginClient() {
  function handleLoginSuccess() {
    const requestedView = new URLSearchParams(window.location.search).get(
      "view"
    );
    const destination =
      requestedView === "agendamentos" ? "/agendamentos" : "/dashboard";
    window.location.assign(destination);
  }

  return <LoginScreen onLogin={handleLoginSuccess} />;
}
