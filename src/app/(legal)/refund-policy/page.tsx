export const metadata = { title: "Return and Refund Policy | Zinetic Music" };

export default function RefundPolicyPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Return and Refund Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: September 2026</p>
      </div>

      <Section title="1. Digital service">
        <p>
          Zinetic Music is a digital service. Wallet top-ups and channel/network checks are
          delivered instantly online, there is no physical product to return or ship.
        </p>
      </Section>

      <Section title="2. Eligible refunds">
        <p>We will issue a refund to your original payment method if:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>A wallet top-up was charged but never credited to your account due to a technical error.</li>
          <li>You were charged twice for the same top-up or the same check.</li>
          <li>A check was charged but failed due to an error on our end (not a &quot;not found&quot; result, which reflects a completed lookup).</li>
        </ul>
      </Section>

      <Section title="3. How to request a refund">
        <p>
          Contact{" "}
          <a href="mailto:info@zineticmusic.com" className="text-primary underline underline-offset-4">
            info@zineticmusic.com
          </a>{" "}
          within 14 days of the charge, with your account email and the transaction date/amount.
          We review every request individually.
        </p>
      </Section>

      <Section title="4. Refund timeline">
        <p>
          Approved refunds are processed back to the original payment method within{" "}
          <strong className="text-foreground">7 to 10 working days</strong> of approval. The exact
          time funds take to appear in your account after that depends on your bank or mobile
          banking provider.
        </p>
      </Section>

      <Section title="5. Unused wallet balance">
        <p>
          Unused wallet balance is not automatically refundable, but you may request a refund of
          your remaining balance when closing your account; this is also processed within 7 to 10
          working days of approval.
        </p>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-2">
      <h2 className="font-heading text-lg font-semibold">{title}</h2>
      <div className="text-sm leading-relaxed text-muted-foreground">{children}</div>
    </section>
  );
}
