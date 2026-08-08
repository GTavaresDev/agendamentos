import NextAuth from "next-auth";
import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { authConfig } from "@/auth.config";
import {
  clientSessionCookieName,
  decodeClientSessionToken,
} from "@/lib/client-session-token";

// `auth` é sobrecarregado (wrapper de handler / middleware); aqui é o middleware.
const staffMiddleware = NextAuth(authConfig).auth as unknown as (
  request: NextRequest,
  event: NextFetchEvent,
) => Promise<Response | undefined>;

/** Telas públicas de acesso do cliente: login, cadastro e recuperação. */
const PORTAL_AUTH_ROOT = "/cliente";
/** Área logada do cliente. Tudo aqui exige sessão de cliente. */
const PORTAL_HOME = "/cliente/painel";

function isUnder(pathname: string, root: string): boolean {
  return pathname === root || pathname.startsWith(`${root}/`);
}

/**
 * O portal do cliente tem sessão própria. Nem a sessão da equipe libera as
 * rotas do cliente, nem a do cliente libera o sistema interno — cada branch
 * valida o seu cookie. A autorização real continua nas Server Actions/páginas.
 *
 * A separação de rotas é só de navegação: `/cliente` são as telas de acesso e
 * `/cliente/painel` é o que só quem está logado vê.
 */
async function portalMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = isUnder(pathname, PORTAL_HOME);
  const token = request.cookies.get(clientSessionCookieName())?.value;
  const session = token ? await decodeClientSessionToken(token) : null;

  // Já logado não fica preso nas telas de acesso.
  if (session && !isProtected) {
    return NextResponse.redirect(new URL(PORTAL_HOME, request.nextUrl));
  }

  if (!session && isProtected) {
    return NextResponse.redirect(new URL(PORTAL_AUTH_ROOT, request.nextUrl));
  }

  return NextResponse.next();
}

export default async function middleware(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl;

  // /cliente/painel mora dentro de /cliente, então um teste cobre os dois.
  if (isUnder(pathname, PORTAL_AUTH_ROOT)) {
    return portalMiddleware(request);
  }

  return staffMiddleware(request, event);
}

export const config = {
  matcher: [
    "/",
    "/login",
    "/cliente/:path*",
    "/dashboard/:path*",
    "/agenda/:path*",
    "/clientes/:path*",
    "/usuarios/:path*",
    "/produtos/:path*",
    "/servicos/:path*",
    "/vendas/:path*",
    "/relatorios/:path*",
    "/configuracoes/:path*",
  ],
};
