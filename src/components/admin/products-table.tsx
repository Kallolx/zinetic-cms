"use client";

import * as React from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { setUserProduct } from "@/app/actions/admin";
import { PRODUCTS, type ProductId } from "@/lib/products";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

type U = { id: string; full_name: string | null; email: string; status: string };

export function ProductsTable({ users, access }: { users: U[]; access: Record<string, ProductId[]> }) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [pending, startTransition] = React.useTransition();
  const [granted, setGranted] = React.useState(access);

  const q = query.trim().toLowerCase();
  const rows = q
    ? users.filter((u) => u.email.toLowerCase().includes(q) || (u.full_name ?? "").toLowerCase().includes(q))
    : users;

  function toggle(userId: string, product: ProductId, enabled: boolean) {
    setGranted((g) => ({
      ...g,
      [userId]: enabled ? [...(g[userId] ?? []), product] : (g[userId] ?? []).filter((p) => p !== product),
    }));
    startTransition(async () => {
      const res = await setUserProduct(userId, product, enabled);
      if (res.error) {
        toast.error(res.error);
        router.refresh();
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name or email"
        className="max-w-sm"
      />
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Customer</TableHead>
            {PRODUCTS.map((p) => (
              <TableHead key={p.id} className="text-center">
                {p.name}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((u) => (
            <TableRow key={u.id}>
              <TableCell>
                <p className="font-medium">{u.full_name || u.email}</p>
                <p className="text-xs text-muted-foreground">
                  {u.email} · {u.status}
                </p>
              </TableCell>
              {PRODUCTS.map((p) => (
                <TableCell key={p.id} className="text-center">
                  <Switch
                    checked={(granted[u.id] ?? []).includes(p.id)}
                    disabled={pending}
                    onCheckedChange={(v) => toggle(u.id, p.id, v)}
                    aria-label={`${p.name} for ${u.email}`}
                  />
                </TableCell>
              ))}
            </TableRow>
          ))}
          {rows.length === 0 && (
            <TableRow>
              <TableCell colSpan={PRODUCTS.length + 1} className="py-8 text-center text-sm text-muted-foreground">
                No customers found.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
