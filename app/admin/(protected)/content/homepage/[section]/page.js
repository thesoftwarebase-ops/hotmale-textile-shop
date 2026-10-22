import { notFound } from "next/navigation";
import HomepageSectionEditor from "../../../../../../components/admin/cms/HomepageSectionEditor";
import { getAdminUi } from "../../../../../../lib/data";
import { getHomepageSectionSchema } from "../../../../../../lib/cms/homepage-sections";

export const instant = false;

export default async function AdminHomepageSectionPage({ params }) {
  const { section } = await params;
  const schema = getHomepageSectionSchema(section);
  if (!schema) notFound();

  const admin = await getAdminUi();

  return (
    <HomepageSectionEditor
      section={section}
      schema={schema}
      copy={admin.cms}
    />
  );
}
