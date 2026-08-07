import { AgendamentosLogo } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/agendamentos-logo";

/** Casca das telas públicas do portal (login, cadastro, recuperação). */
export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <main className="flex min-h-screen flex-col bg-zinc-50 px-4 py-10 sm:px-6">
      <div className="mx-auto w-full max-w-[420px]">
        <AgendamentosLogo variant="light" size="md" />

        <div className="mt-10">
          <h1 className="text-2xl font-semibold tracking-[-0.03em] text-zinc-950 sm:text-3xl">
            {title}
          </h1>
          <p className="mt-2 text-sm text-zinc-500">{subtitle}</p>
        </div>

        <div className="mt-8">{children}</div>

        {footer ? <div className="mt-8 text-center text-sm text-zinc-500">{footer}</div> : null}

        <p className="mt-16 text-center text-xs text-zinc-400">
          &copy; 2026 Agendamentos. Todos os direitos reservados.
        </p>
      </div>
    </main>
  );
}
