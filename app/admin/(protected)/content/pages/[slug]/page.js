import { notFound } from "next/navigation";
import SingletonEditor from "../../../../../../components/admin/cms/SingletonEditor";
import { getAdminUi } from "../../../../../../lib/data";
import { getPageSchema } from "../../../../../../lib/cms/schema";

export const instant = false;

export default async function AdminPageEditor({ params }) {
  const { slug } = await params;
  const schema = getPageSchema(slug);
  if (!schema) notFound();

  const admin = await getAdminUi();

  return (
    <SingletonEditor
      kind="page"
      contentKey={slug}
      schema={schema}
      copy={admin.cms}
      backHref="/admin/content/pages"
      backLabel={admin.cms.pages.back}
      viewHref={schema.path}
      viewLabel={admin.cms.pages.viewPage}
    />
  );
}
