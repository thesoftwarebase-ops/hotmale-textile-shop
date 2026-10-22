"use client";

import { clearToken } from "../../lib/client-auth";
import { useAdminTransition } from "./AdminTransition";

export default function SignOutButton({ copy }) {
  const { navigate } = useAdminTransition();

  function handleSignOut() {
    clearToken();
    navigate("/admin", { replace: true });
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      className="group flex min-h-[44px] w-full items-center justify-between gap-3 text-[10px] font-bold uppercase tracking-[0.16em] text-muted transition-colors hover:text-gold"
    >
      {copy.signOut}
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
      >
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
      </svg>
    </button>
  );
}
