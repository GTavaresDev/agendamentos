import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

export const middleware = NextAuth(authConfig).auth;

export default middleware;

export const config = {
  matcher: [
    "/",
    "/login",
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
