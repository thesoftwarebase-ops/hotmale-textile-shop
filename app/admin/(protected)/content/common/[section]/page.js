import { notFound } from "next/navigation";
import CommonSectionEditor from "../../../../../../components/admin/cms/CommonSectionEditor";
import { getAdminUi } from "../../../../../../lib/data";
import { getCommonSectionSchema } from "../../../../../../lib/cms/common-sections";

export const instant = false;

export default async function AdminCommonSectionPage({ params }) {
  const { section } = await params;
  const schema = getCommonSectionSchema(section);
  if (!schema) notFound();

  const admin = await getAdminUi();

  return (
    <CommonSectionEditor
      section={section}
      schema={schema}
      copy={admin.cms}
    />
  );
}
