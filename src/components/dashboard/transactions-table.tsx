"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { TablePagination } from "@/components/dashboard/table-pagination";
import { usePagination } from "@/hooks/use-pagination";
import type { WalletTransaction } from "@/lib/types";

const PAGE_SIZE = 15;

const typeLabel: Record<string, string> = {
  topup: "Top-up",
  check_charge: "MCN check",
  refund: "Refund",
  adjustment: "Adjustment",
};

export function TransactionsTable({ transactions }: { transactions: WalletTransaction[] }) {
  const { page, setPage, pageCount, pageItems } = usePagination(transactions, PAGE_SIZE);

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Note</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="text-right">Date</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.map((t) => (
              <TableRow key={t.id}>
                <TableCell>
                  <Badge variant="secondary">{typeLabel[t.type] ?? t.type}</Badge>
                </TableCell>
                <TableCell className="max-w-[280px] truncate text-muted-foreground">
                  {t.note ?? "N/A"}
                </TableCell>
                <TableCell
                  className={`text-right font-medium ${
                    Number(t.amount) >= 0 ? "text-emerald-600" : "text-destructive"
                  }`}
                >
                  {Number(t.amount) >= 0 ? "+" : ""}
                  {Number(t.amount).toFixed(2)}
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {new Date(t.created_at).toLocaleDateString()}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <TablePagination page={page} pageCount={pageCount} onPageChange={setPage} />
    </div>
  );
}
