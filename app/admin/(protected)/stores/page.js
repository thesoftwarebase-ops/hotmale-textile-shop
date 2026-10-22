import StoresBoard from "../../../../components/admin/cms/StoresBoard";
import { getAdminUi } from "../../../../lib/data";

export const instant = false;

export default async function AdminStoresPage() {
  const admin = await getAdminUi();

  return <StoresBoard copy={admin.cms} />;
}
