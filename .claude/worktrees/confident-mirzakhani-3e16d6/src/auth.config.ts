import type { NextAuthConfig } from "next-auth";
import type { StaffRole } from "@core/domain/users/User";
import { PrismaUserRepository } from "@core/infra/persistence/prisma/repositories/PrismaUserRepository";

export const authConfig = {
  pages: {
    signIn: "/login",
    error: "/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 8 * 60 * 60,
  },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      const isLoggedIn = !!auth?.user;
      const isAuthPage = pathname === "/login";
      const isRoot = pathname === "/";
      const isPublic =
        isAuthPage ||
        isRoot ||
        pathname.startsWith("/site") ||
        pathname.startsWith("/links") ||
        pathname.startsWith("/api/auth");

      if (isPublic) {
        if (isLoggedIn && (isAuthPage || isRoot)) {
          return Response.redirect(new URL("/dashboard", request.nextUrl));
        }
        return true;
      }

      if (!isLoggedIn) {
        return Response.redirect(new URL("/login", request.nextUrl));
      }

      const userObj = auth.user as
        | { role?: StaffRole; permissionLevel?: 1 | 2 | 3; permissions?: Array<{ name: string }> }
        | undefined;
      const isAdmin =
        userObj?.permissionLevel === 1 || userObj?.role === "Administrador";
      const isFuncionario =
        userObj?.permissionLevel === 3 || userObj?.role === "Funcionario";
      const hasReportsPermission =
        isAdmin ||
        userObj?.permissions?.some((p) => p.name === "ver_relatorios");

      if (pathname.startsWith("/usuarios") && isFuncionario) {
        return Response.redirect(new URL("/dashboard", request.nextUrl));
      }

      if (pathname.startsWith("/relatorios") && !hasReportsPermission) {
        return Response.redirect(new URL("/dashboard", request.nextUrl));
      }

      if (pathname.startsWith("/configuracoes") && !isAdmin) {
        return Response.redirect(new URL("/dashboard", request.nextUrl));
      }

      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as { role?: StaffRole }).role;
        token.permissionLevel = (user as { permissionLevel?: 1 | 2 | 3 })
          .permissionLevel;
        token.initials = (user as { initials?: string }).initials;
        token.permissions = (user as { permissions?: Array<{ name: string }> })
          .permissions || [];
        token.impersonating = false;
        token.impersonatorId = undefined;
        token.impersonatorName = undefined;
        token.impersonatorEmail = undefined;
        token.impersonatorRole = undefined;
        token.impersonatorPermissionLevel = undefined;
        token.impersonatorInitials = undefined;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as StaffRole;
        session.user.permissionLevel = token.permissionLevel as 1 | 2 | 3;
        session.user.initials = (token.initials as string) || "";

        try {
          const userRepository = new PrismaUserRepository();
          const user = await userRepository.findById(token.id as string);
          session.user.permissions = user?.permissions?.map(p => ({ name: p.name })) || [];
        } catch {
          session.user.permissions = token.permissions as Array<{ name: string }> || [];
        }

        session.user.impersonating = Boolean(token.impersonating);
        if (token.impersonating && token.impersonatorId) {
          session.user.impersonator = {
            id: token.impersonatorId as string,
            name: (token.impersonatorName as string) || "",
            email: (token.impersonatorEmail as string) || "",
            role: token.impersonatorRole as StaffRole,
            permissionLevel: token.impersonatorPermissionLevel as 1 | 2 | 3,
            initials: (token.impersonatorInitials as string) || "",
          };
        } else {
          session.user.impersonator = undefined;
        }
      }
      return session;
    },
  },
} satisfies NextAuthConfig;
