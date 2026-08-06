import { decode, encode } from "@auth/core/jwt";
import { cookies } from "next/headers";
import type { AuthenticatedUserDTO } from "@core/application/users/authenticate-user.usecase";
import type { StaffRole } from "@core/domain/users/user.entity";

const SESSION_MAX_AGE_SECONDS = 8 * 60 * 60;

export type SessionActor = {
  id: string;
  name: string;
  email: string;
  role: StaffRole;
  permissionLevel: 1 | 2 | 3;
  initials: string;
  permissions?: Array<{ name: string }>;
};

export type AuthSessionPayload = SessionActor & {
  sub?: string;
  permissions?: Array<{ name: string }>;
  impersonating?: boolean;
  impersonatorId?: string;
  impersonatorName?: string;
  impersonatorEmail?: string;
  impersonatorRole?: StaffRole;
  impersonatorPermissionLevel?: 1 | 2 | 3;
  impersonatorInitials?: string;
};

function isSecureCookie(): boolean {
  return process.env.NODE_ENV === "production";
}

export function sessionCookieName(secure = isSecureCookie()): string {
  if (secure) {
    return "__Secure-authjs.session-token";
  }
  return "authjs.session-token";
}

function requireAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET não configurado");
  }
  return secret;
}

async function writeSessionCookie(token: AuthSessionPayload): Promise<void> {
  const secret = requireAuthSecret();
  const secure = isSecureCookie();
  const cookieName = sessionCookieName(secure);
  const expires = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

  const encoded = await encode({
    token: {
      ...token,
      sub: token.id,
    },
    secret,
    salt: cookieName,
    maxAge: SESSION_MAX_AGE_SECONDS,
  });

  const cookieStore = await cookies();
  cookieStore.set(cookieName, encoded, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure,
    expires,
  });
}

export async function readAuthSessionPayload(): Promise<AuthSessionPayload | null> {
  const secret = requireAuthSecret();
  const secure = isSecureCookie();
  const cookieName = sessionCookieName(secure);
  const cookieStore = await cookies();
  const raw = cookieStore.get(cookieName)?.value;

  if (!raw) {
    return null;
  }

  const payload = await decode<AuthSessionPayload>({
    token: raw,
    secret,
    salt: cookieName,
  });

  if (!payload?.id) {
    return null;
  }

  return payload;
}

export async function createAuthSession(
  user: AuthenticatedUserDTO,
): Promise<void> {
  await writeSessionCookie({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    permissionLevel: user.permissionLevel,
    initials: user.initials,
    permissions: user.permissions,
    impersonating: false,
  });
}

export async function writeImpersonationSession(input: {
  actor: SessionActor;
  target: SessionActor;
}): Promise<void> {
  await writeSessionCookie({
    id: input.target.id,
    name: input.target.name,
    email: input.target.email,
    role: input.target.role,
    permissionLevel: input.target.permissionLevel,
    initials: input.target.initials,
    permissions: input.target.permissions,
    impersonating: true,
    impersonatorId: input.actor.id,
    impersonatorName: input.actor.name,
    impersonatorEmail: input.actor.email,
    impersonatorRole: input.actor.role,
    impersonatorPermissionLevel: input.actor.permissionLevel,
    impersonatorInitials: input.actor.initials,
  });
}

export async function restoreActorSession(actor: SessionActor): Promise<void> {
  await writeSessionCookie({
    id: actor.id,
    name: actor.name,
    email: actor.email,
    role: actor.role,
    permissionLevel: actor.permissionLevel,
    initials: actor.initials,
    permissions: actor.permissions,
    impersonating: false,
  });
}
