import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const TOKEN_COOKIE = "auth_session";
const USER_COOKIE = "auth_user";

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax" as const,
  path: "/",
  maxAge: 60 * 60 * 24 * 7, // 7 days
};

export async function GET(request: NextRequest) {
  const token = request.cookies.get(TOKEN_COOKIE)?.value ?? null;
  const userRaw = request.cookies.get(USER_COOKIE)?.value ?? null;

  if (!token || !userRaw) {
    return NextResponse.json({ token: null, user: null });
  }

  try {
    const user = JSON.parse(decodeURIComponent(userRaw));
    return NextResponse.json({ token, user });
  } catch {
    return NextResponse.json({ token: null, user: null });
  }
}

export async function POST(request: NextRequest) {
  const { token, user } = await request.json();

  if (!token || !user) {
    return NextResponse.json(
      { error: "Missing token or user" },
      { status: 400 },
    );
  }

  // Store only the fields needed to rehydrate — keeps the cookie small
  const minimalUser = {
    id: user.id,
    school_id: user.school_id,
    first_name: user.first_name,
    last_name: user.last_name,
    email: user.email,
    role: user.role,
    permissions: user.permissions,
    is_active: user.is_active,
    is_staff: user.is_staff,
    is_superuser: user.is_superuser,
  };

  const response = NextResponse.json({ success: true });
  response.cookies.set(TOKEN_COOKIE, token, COOKIE_OPTIONS);
  response.cookies.set(
    USER_COOKIE,
    encodeURIComponent(JSON.stringify(minimalUser)),
    COOKIE_OPTIONS,
  );
  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete(TOKEN_COOKIE);
  response.cookies.delete(USER_COOKIE);
  return response;
}
