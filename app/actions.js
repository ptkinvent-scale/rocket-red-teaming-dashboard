"use server";

import { cookies } from "next/headers";

const AUTH_COOKIE = "site_auth";

export async function login(prevState, formData) {
  const password = formData.get("password") || "";

  if (password !== process.env.SITE_PASSWORD) {
    return { error: "Incorrect password" };
  }

  const cookieStore = await cookies();
  cookieStore.set(AUTH_COOKIE, process.env.SITE_PASSWORD, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return { error: null };
}
