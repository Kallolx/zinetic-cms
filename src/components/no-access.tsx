import Link from "next/link";
import { LuLock } from "react-icons/lu";

export function NoAccess({ product }: { product: string }) {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 py-24 text-center">
      <LuLock className="size-8 text-muted-foreground" />
      <h2 className="font-heading text-2xl font-semibold">You do not have {product} yet</h2>
      <p className="text-sm text-muted-foreground">
        This account is not set up for {product}. Pick a plan and we will activate it, or write to
        support@zineticmusic.com if you already paid.
      </p>
      <Link href="/checkout" className="text-sm font-medium underline underline-offset-4">
        See plans
      </Link>
    </div>
  );
}
