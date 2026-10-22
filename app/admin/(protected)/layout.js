import AdminShell from "../../../components/admin/AdminShell";
import { getAdminUi, getBrand } from "../../../lib/data";

export const instant = false;

export default async function ProtectedAdminLayout({ children }) {
  const [admin, brand] = await Promise.all([getAdminUi(), getBrand()]);

  return <AdminShell admin={admin} brand={brand}>{children}</AdminShell>;
}
