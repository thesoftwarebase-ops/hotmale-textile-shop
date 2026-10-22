import AccountSettingsView from "../../../../components/admin/AccountSettingsView";
import { getAdminUi } from "../../../../lib/data";

export const instant = false;

export async function generateMetadata() {
  const admin = await getAdminUi();
  return { title: admin.account.title };
}

export default async function AccountSettingsPage() {
  const admin = await getAdminUi();
  const copy = admin.account;

  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-col gap-5 border-b border-white/10 pb-7 sm:flex-row sm:items-end sm:justify-between lg:pb-9">
        <div>
          <p className="flex items-center gap-3 text-[9px] font-bold uppercase tracking-[0.3em] text-gold">
            <span aria-hidden="true" className="h-px w-7 bg-gold/60" />
            {copy.eyebrow}
          </p>
          <h1 className="mt-4 font-display text-4xl font-black uppercase leading-[0.98] tracking-tight text-cream sm:text-5xl">
            {copy.title}
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-silver">
            {copy.intro}
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-gold/20 bg-gold/[0.05] px-3 py-2 sm:self-auto">
          <span aria-hidden="true" className="h-1 w-1 rounded-full bg-gold" />
          <span className="text-[8px] font-bold uppercase tracking-[0.22em] text-gold/80">
            {admin.brandLabel}
          </span>
        </span>
      </header>

      <AccountSettingsView copy={copy} />
    </div>
  );
}
