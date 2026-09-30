import { PageHero } from "@/components/landing/page-parts";
import { CheckoutForm } from "@/components/landing/checkout-form";
import { ZButton } from "@/components/landing/button";
import { getService } from "@/lib/service-pages";

export const metadata = {
  title: "Checkout | Zinetic Music",
  description: "Choose your plan, create your account and place your order.",
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string; plan?: string }>;
}) {
  const { service: serviceId, plan } = await searchParams;
  const service = serviceId ? getService(serviceId) : undefined;
  const initialPlan = service?.tiers.find((t) => t.name === plan)?.name ?? service?.tiers[0].name ?? "";

  return (
    <>
      <PageHero
        className="pb-10 sm:pb-14"
        eyebrow="Checkout"
        title={
          <>
            Complete your <span className="zl-serif zl-grad-text">order.</span>
          </>
        }
        sub={service ? "Confirm your plan, create your account and place your order." : "Pick a service and plan to get started."}
      />
      <section className="px-5 pb-24 sm:pb-32">
        <div className="mx-auto max-w-6xl">
          {service ? (
            <CheckoutForm service={service} initialPlan={initialPlan} />
          ) : (
            <div className="mx-auto max-w-xl rounded-[28px] border border-(--zl-line) bg-(--zl-surface) p-8 text-center sm:p-12">
              <p className="zl-display text-2xl font-semibold">No plan selected</p>
              <p className="mt-3 text-(--zl-muted)">Choose a service and a plan, and we will bring you back here.</p>
              <div className="mt-6 flex justify-center">
                <ZButton href="/services">Browse services</ZButton>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
