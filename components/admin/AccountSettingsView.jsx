"use client";

import AccountForms from "./AccountForms";
import EmailDeliveryForm from "./EmailDeliveryForm";
import { useAdminAuth } from "./AdminAuthContext";

export default function AccountSettingsView({ copy }) {
  const { user } = useAdminAuth();
  return (
    <div className="flex flex-col gap-5">
      <AccountForms copy={copy} email={user.email} />
      <EmailDeliveryForm copy={copy} />
    </div>
  );
}
