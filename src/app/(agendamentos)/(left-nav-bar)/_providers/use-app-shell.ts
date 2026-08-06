import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getCurrentSessionAction,
  logoutAction,
  startImpersonationAction,
  stopImpersonationAction,
  type SessionUser,
} from "@/app/(agendamentos)/(left-nav-bar)/_actions/auth-actions";

export interface PageHeaderOverride {
  title: string;
  subtitle: string;
}

export interface AppShellContextType {
  currentUser: SessionUser | null;
  isBootstrapping: boolean;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  toast: string | null;
  showToast: (msg: string) => void;
  allowPastBooking: boolean;
  setAllowPastBooking: (allow: boolean) => void;
  initialEditUserId: string | null;
  setInitialEditUserId: (id: string | null) => void;
  pageHeader: PageHeaderOverride | null;
  setPageHeader: (header: PageHeaderOverride | null) => void;
  handleStartImpersonation: (targetUserId: string) => Promise<void>;
  handleStopImpersonation: () => Promise<void>;
  handleLogout: () => Promise<void>;
}

export const AppShellContext = createContext<AppShellContextType | undefined>(undefined);

export function useAppShellState(): AppShellContextType {
  const [currentUser, setCurrentUser] = useState<SessionUser | null>(null);
  const [isBootstrapping, setIsBootstrapping] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [allowPastBooking, setAllowPastBooking] = useState(false);
  const [initialEditUserId, setInitialEditUserId] = useState<string | null>(null);
  const [pageHeader, setPageHeader] = useState<PageHeaderOverride | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadSession() {
      try {
        const session = await getCurrentSessionAction();
        if (cancelled) return;

        if (!session) {
          window.location.assign("/login");
          return;
        }

        setCurrentUser(session);
      } finally {
        if (!cancelled) {
          setIsBootstrapping(false);
        }
      }
    }

    loadSession();

    return () => {
      cancelled = true;
    };
  }, []);

  function showToast(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 3500);
  }

  async function handleStartImpersonation(targetUserId: string) {
    const res = await startImpersonationAction(targetUserId);
    if (res.success) {
      window.location.reload();
    } else {
      showToast(res.error || "Erro ao assumir usuário.");
    }
  }

  async function handleStopImpersonation() {
    const res = await stopImpersonationAction();
    if (res.success) {
      window.location.reload();
    } else {
      showToast("Erro ao sair da conta.");
    }
  }

  async function handleLogout() {
    await logoutAction();
  }

  return {
    currentUser,
    isBootstrapping,
    mobileOpen,
    setMobileOpen,
    toast,
    showToast,
    allowPastBooking,
    setAllowPastBooking,
    initialEditUserId,
    setInitialEditUserId,
    pageHeader,
    setPageHeader,
    handleStartImpersonation,
    handleStopImpersonation,
    handleLogout,
  };
}

export function useAppShell() {
  const context = useContext(AppShellContext);
  if (!context) {
    throw new Error("useAppShell must be used within an AppShellProvider");
  }
  return context;
}

export function AppShellProvider({ children }: { children: React.ReactNode }) {
  const value = useAppShellState();
  return React.createElement(AppShellContext.Provider, { value }, children);
}
