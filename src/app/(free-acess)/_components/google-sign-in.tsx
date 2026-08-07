import { Button } from "@/app/(agendamentos)/(left-nav-bar)/_components/ui/button";
import { signInWithGoogleAction } from "../_actions/portal-auth-actions";

function GoogleMark() {
  return (
    <svg viewBox="0 0 18 18" aria-hidden="true" className="size-4 shrink-0">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.97 10.72a5.41 5.41 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.59C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}

/**
 * Entrar/cadastrar com Google. É o mesmo caminho para as duas coisas: quem já
 * tem conta é reconhecido pelo e-mail, quem não tem passa a ter.
 */
export function GoogleSignIn({ label = "Continuar com Google" }: { label?: string }) {
  return (
    <div className="mt-6">
      <div className="flex items-center gap-3" aria-hidden="true">
        <span className="h-px flex-1 bg-zinc-200" />
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-400">
          ou
        </span>
        <span className="h-px flex-1 bg-zinc-200" />
      </div>

      <form action={signInWithGoogleAction} className="mt-6">
        <Button
          type="submit"
          variant="outline"
          size="lg"
          className="w-full gap-2 font-medium"
        >
          <GoogleMark />
          {label}
        </Button>
      </form>
    </div>
  );
}
