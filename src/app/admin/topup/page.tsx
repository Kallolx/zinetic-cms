import { redirect } from "next/navigation";

// Credits, plans and dashboards are all managed from the customer page now.
export default function Page() {
  redirect("/admin/customers");
}
