import { ZButton } from "@/components/landing/button";
import { LuCheck } from "react-icons/lu";

export const metadata = { title: "Payment received | Zinetic Music" };

const COPY: Record<string, { title: string; body: string }> = {
  held: {
    title: "Payment under review.",
    body: "Your bank flagged this payment for a quick review. As soon as it clears your account is activated automatically and we will email you.",
  },
  distribution: {
    title: "Payment received.",
    body: "Your Music Distribution plan is active on your account. The distribution dashboard is opening soon, we will email you the moment it is ready.",
  },
};

export default async function CheckoutSuccessPage({ searchParams }: { searchParams: Promise<{ state?: string }> }) {
  const { state = "" } = await searchParams;
  const c = COPY[state] ?? COPY.distribution;
  return (
    <section className="px-5 py-24 sm:py-32">
      <div className="mx-auto max-w-3xl text-center">
        <span className="zl-grad-bg mx-auto flex size-14 items-center justify-center rounded-full text-white">
          <LuCheck className="size-7" />
        </span>
        <h1 className="zl-display mt-8 text-5xl font-bold sm:text-6xl">{c.title}</h1>
        <p className="mx-auto mt-6 max-w-xl text-lg leading-relaxed text-white/65">{c.body}</p>
        <div className="mt-10 flex flex-wrap justify-center gap-3">
          <ZButton href="/client-login">Go to client login</ZButton>
          <ZButton href="/" variant="glass" arrow={false}>
            Back to home
          </ZButton>
        </div>
      </div>
    </section>
  );
}
