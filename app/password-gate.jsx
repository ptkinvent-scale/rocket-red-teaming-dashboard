"use client";

import { useActionState } from "react";
import { login } from "./actions";

export default function PasswordGate() {
  const [state, formAction, pending] = useActionState(login, { error: null });

  return (
    <div className="flex flex-1 items-center justify-center px-4">
      <form action={formAction} className="w-full max-w-sm rounded-lg border border-neutral-700 p-6 shadow-sm">
        <h1 className="mb-4 text-lg font-semibold">Enter password</h1>
        <input
          type="password"
          name="password"
          autoFocus
          className="mb-3 w-full rounded border border-neutral-500 px-3 py-2 text-sm"
          placeholder="Password"
        />
        {state?.error && <p className="mb-3 text-sm text-red-600">{state.error}</p>}
        <button
          type="submit"
          disabled={pending}
          className="w-full rounded bg-red-600 px-3 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          {pending ? "Checking…" : "Continue"}
        </button>
      </form>
    </div>
  );
}
