import NextAuth from "next-auth";
import type { DefaultSession } from "next-auth";
import type { StaffRole } from "@core/domain/users/user.entity";

type ImpersonatorSession = {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  permissionLevel: 1 | 2 | 3;
  initials: string;
};

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: StaffRole;
      permissionLevel: 1 | 2 | 3;
      initials: string;
      permissions?: Array<{ name: string }>;
      impersonating?: boolean;
      impersonator?: ImpersonatorSession;
    } & DefaultSession["user"];
  }

  interface User {
    role?: StaffRole;
    permissionLevel?: 1 | 2 | 3;
    initials?: string;
    permissions?: Array<{ name: string }>;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: StaffRole;
    permissionLevel?: 1 | 2 | 3;
    initials?: string;
    permissions?: Array<{ name: string }>;
    impersonating?: boolean;
    impersonatorId?: string;
    impersonatorName?: string;
    impersonatorEmail?: string;
    impersonatorRole?: StaffRole;
    impersonatorPermissionLevel?: 1 | 2 | 3;
    impersonatorInitials?: string;
  }
}

export {};
