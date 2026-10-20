"use server";

import { redirect } from "next/navigation";
import { verifyPassword } from "@/lib/password";
import { createOwnerSession, deleteOwnerSession } from "@/lib/session";

export type LoginState = { error?: string; email?: string };

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");

  const ownerEmail = process.env.OWNER_EMAIL?.trim().toLowerCase();
  const ownerHash = process.env.OWNER_PASSWORD_HASH;
  if (!ownerEmail || !ownerHash) {
    return { error: "Owner login isn't set up on this server yet." };
  }

  // Always run the hash check so wrong emails and wrong passwords take the same time
  const passwordOk = await verifyPassword(password, ownerHash);
  if (email !== ownerEmail || !passwordOk) {
    await wait(800); // slow down guessing
    return { error: "That email and password don't match the captain's.", email };
  }

  await createOwnerSession();
  redirect("/studio");
}

export async function logout() {
  await deleteOwnerSession();
  redirect("/");
}
