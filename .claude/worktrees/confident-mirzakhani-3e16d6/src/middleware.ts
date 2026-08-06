import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    "/",
    "/login",
    "/dashboard/:path*",
    "/agenda/:path*",
    "/agendamentos/:path*",
    "/clientes/:path*",
    "/usuarios/:path*",
    "/produtos/:path*",
    "/relatorios/:path*",
  ],
};
