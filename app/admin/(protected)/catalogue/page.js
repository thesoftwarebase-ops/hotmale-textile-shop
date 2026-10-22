import CatalogueBoard from "../../../../components/admin/cms/CatalogueBoard";
import { getAdminUi } from "../../../../lib/data";

export const instant = false;

export default async function AdminCataloguePage() {
  const admin = await getAdminUi();

  return <CatalogueBoard copy={admin.cms} />;
}
