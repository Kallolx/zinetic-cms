import { Suspense } from "react";
import { loadCustomerList } from "@/lib/admin/customers";
import { CustomersTable } from "@/components/admin-panel/customers-table";

export default async function CustomersPage() {
  const rows = await loadCustomerList();
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl font-semibold">Customers</h1>
        <p className="mt-1 text-sm text-muted-foreground">Everyone who has signed up. Approve new people, then open a customer to manage their dashboards, credits and plans.</p>
      </div>
      <Suspense>
        <CustomersTable rows={rows} />
      </Suspense>
    </div>
  );
}
