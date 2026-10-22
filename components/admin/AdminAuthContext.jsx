"use client";

import { createContext, useContext } from "react";

export const AdminAuthContext = createContext(null);

export function useAdminAuth() {
  const value = useContext(AdminAuthContext);
  if (!value) {
    throw new Error("useAdminAuth must be used inside the admin shell.");
  }
  return value;
}
