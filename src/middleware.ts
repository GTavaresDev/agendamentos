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

const PORTAL_ROOT = "/cliente";
const PORTAL_PUBLIC_PATHS = [
  `${PORTAL_ROOT}/login`,
  `${PORTAL_ROOT}/cadastro`,
  `${PORTAL_ROOT}/recuperar-senha`,
];

/**
 * O portal do cliente tem sessão própria. Nem a sessão da equipe libera as
 * rotas do cliente, nem a do cliente libera o sistema interno — cada branch
 * valida o seu cookie. A autorização real continua nas Server Actions/páginas.
 */
async function portalMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isPublic = PORTAL_PUBLIC_PATHS.includes(pathname);
  const token = request.cookies.get(clientSessionCookieName())?.value;
  const session = token ? await decodeClientSessionToken(token) : null;

  if (session && isPublic) {
    return NextResponse.redirect(new URL(PORTAL_ROOT, request.nextUrl));
  }

  if (!session && !isPublic) {
    return NextResponse.redirect(new URL(`${PORTAL_ROOT}/login`, request.nextUrl));
  }

  return NextResponse.next();
}

export default async function middleware(request: NextRequest, event: NextFetchEvent) {
  const { pathname } = request.nextUrl;

  if (pathname === PORTAL_ROOT || pathname.startsWith(`${PORTAL_ROOT}/`)) {
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
