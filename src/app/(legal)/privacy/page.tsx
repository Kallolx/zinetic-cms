export const metadata = { title: "Privacy Policy | Zinetic Music" };

export default function PrivacyPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Privacy Policy</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: September 2026</p>
      </div>

      <Section title="1. Information we collect">
        <p>
          We collect the information you provide when you register (name, email address), the
          channel links or IDs you submit for a check, and payment metadata from our payment
          processor (such as transaction ID and status, we do not store your card details).
        </p>
      </Section>

      <Section title="2. How we use your information">
        <p>
          We use your information to operate your account, process wallet payments, run the
          checks you request, provide customer support, and comply with legal and financial
          record-keeping obligations.
        </p>
      </Section>

      <Section title="3. Payment processing">
        <p>
          Wallet top-ups are processed by SSLCommerz, a licensed payment service provider. Card
          and mobile banking details are entered directly on SSLCommerz&apos;s secure payment page
          and are never seen or stored by Zinetic Music.
        </p>
      </Section>

      <Section title="4. Sharing your information">
        <p>
          We do not sell your personal information. We share it only with service providers
          necessary to operate the Service (such as our hosting provider, database provider, and
          payment processor), or where required by law. We do not permit third-party advertising
          on the Service, and we are not responsible for any third party a user independently
          chooses to share their own information with.
        </p>
      </Section>

      <Section title="5. Data retention">
        <p>
          We retain account and transaction records for as long as your account is active and for
          a reasonable period afterward to meet legal, accounting, and dispute-resolution
          requirements.
        </p>
      </Section>

      <Section title="6. Your rights">
        <p>
          You can request a copy of the personal information we hold about you, or request
          correction or deletion of your account, by contacting us at the email below.
        </p>
      </Section>

      <Section title="7. Contact">
        <p>
          Privacy questions can be sent to{" "}
          <a href="mailto:info@zineticmusic.com" className="text-primary underline underline-offset-4">
            info@zineticmusic.com
          </a>
          .
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
