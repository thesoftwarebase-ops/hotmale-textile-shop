import DashboardView from "../../../../components/admin/DashboardView";
import { getAdminUi, getSeo } from "../../../../lib/data";

export const instant = false;

export async function generateMetadata() {
  const admin = await getAdminUi();
  return { title: admin.dashboard.navLabel };
}

export default async function AdminDashboardPage() {
  const [admin, seo] = await Promise.all([getAdminUi(), getSeo()]);

  return <DashboardView copy={admin.dashboard} locale={seo.locale} />;
}
