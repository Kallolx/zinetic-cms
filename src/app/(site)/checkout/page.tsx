import { PageHero } from "@/components/landing/page-parts";
import { CheckoutForm } from "@/components/landing/checkout-form";
import { SERVICES } from "@/lib/landing-services";

export const metadata = {
  title: "Checkout | Zinetic Music",
  description: "Choose a service and plan, create your account and place your order.",
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; plan?: string }>;
}) {
  const { service, plan } = await searchParams;
  const initialService = SERVICES.find((s) => s.id === service)?.id ?? SERVICES[0].id;

  return (
    <>
      <PageHero
        className="pb-10 sm:pb-14"
        eyebrow="Checkout"
        title={
          <>
            Pick a plan. <span className="zl-serif zl-grad-text">Start today.</span>
          </>
        }
        sub="Browse every service, choose the plan that fits and place your order in one go."
      />
      <section className="px-5 pb-24 sm:pb-32">
        <div className="mx-auto max-w-6xl">
          <CheckoutForm initialService={initialService} initialPlan={plan ?? ""} />
        </div>
      </section>
    </>
  );
}
