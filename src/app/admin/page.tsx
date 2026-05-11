import { redirect } from "next/navigation";
import { buildAdminPanelUrl } from "@/lib/admin/panel-url";

type AdminRedirectPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminRedirectPage({
  searchParams,
}: AdminRedirectPageProps) {
  const params = (await searchParams) ?? {};
  const target = new URL(buildAdminPanelUrl("/"));

  Object.entries(params).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((item) => target.searchParams.append(key, item));
      return;
    }

    if (typeof value === "string") {
      target.searchParams.set(key, value);
    }
  });

  redirect(target.toString());
}
