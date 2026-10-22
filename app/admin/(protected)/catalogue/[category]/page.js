import CatalogueBoard from "../../../../../components/admin/cms/CatalogueBoard";
import { getAdminUi } from "../../../../../lib/data";

export const instant = false;

export default async function AdminCatalogueCategoryPage({ params }) {
  const { category } = await params;
  const admin = await getAdminUi();

  return <CatalogueBoard copy={admin.cms} category={category} />;
}
