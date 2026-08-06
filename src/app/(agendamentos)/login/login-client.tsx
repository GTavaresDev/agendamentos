"use client";

import { LoginScreen } from "@/app/(agendamentos)/login/_components/login-screen";

export function LoginClient() {
  function handleLoginSuccess() {
    const requestedView = new URLSearchParams(window.location.search).get(
      "view"
    );
    const destination =
      requestedView === "agendamentos" ? "/agenda?novo=1" : "/dashboard";
    window.location.assign(destination);
  }

  return <LoginScreen onLogin={handleLoginSuccess} />;
}
