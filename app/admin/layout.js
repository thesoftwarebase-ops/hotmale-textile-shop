import { getAdminUi } from "../../lib/data";

export async function generateMetadata() {
  const admin = await getAdminUi();
  return {
    title: {
      default: admin.brandLabel,
      template: `%s | ${admin.brandLabel}`,
    },
    robots: { index: false, follow: false },
  };
}

export default function AdminRootLayout({ children }) {
  return children;
}
