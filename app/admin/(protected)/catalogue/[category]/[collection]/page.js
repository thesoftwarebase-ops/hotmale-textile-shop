import CatalogueBoard from "../../../../../../components/admin/cms/CatalogueBoard";
import { getAdminUi } from "../../../../../../lib/data";

export const instant = false;

export default async function AdminCatalogueCollectionPage({ params }) {
  const { category, collection } = await params;
  const admin = await getAdminUi();

  return (
    <CatalogueBoard
      copy={admin.cms}
      category={category}
      collection={collection}
    />
  );
}
