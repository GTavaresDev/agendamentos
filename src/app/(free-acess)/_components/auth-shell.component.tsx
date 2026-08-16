import { AgendamentosLogo } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/agendamentos-logo.component";

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
    <main className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-4 py-8 sm:px-6 sm:py-12">
      <div className="w-full max-w-[440px]">
        {/* Logo Centralizado */}
        <div className="flex justify-center">
          <AgendamentosLogo variant="light" size="md" />
        </div>

        {/* Card do Formulário Centralizado */}
        <div className="mt-6 sm:mt-8 rounded-2xl border border-zinc-200/80 bg-white p-5 sm:p-8 shadow-sm">
          <div className="text-center">
            <h1 className="text-xl font-semibold tracking-[-0.03em] text-zinc-950 sm:text-3xl">
              {title}
            </h1>
            <p className="mt-2 text-xs text-zinc-500 sm:text-sm">{subtitle}</p>
          </div>

          <div className="mt-6 sm:mt-8">{children}</div>

          {footer ? (
            <div className="mt-6 sm:mt-8 border-t border-zinc-100 pt-5 text-center text-xs text-zinc-500 sm:text-sm">
              {footer}
            </div>
          ) : null}
        </div>

        <p className="mt-6 sm:mt-8 text-center text-xs text-zinc-400">
          &copy; 2026 Agendamentos. Todos os direitos reservados.
        </p>
      </div>
    </main>
  );
}
