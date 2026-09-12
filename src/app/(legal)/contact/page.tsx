export const metadata = { title: "Contact Us | Zinetic Music" };

export default function ContactPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Contact Us</h1>
      </div>

      <Section title="Registered office (Bangladesh)">
        <p>Batar Goli, Boro Moghbazar, Ramna, Dhaka, 1217, Bangladesh</p>
        <p className="mt-1">
          Phone: +880 9696 797 267
          <br />
          Email:{" "}
          <a href="mailto:info@zineticmusic.com" className="text-primary underline underline-offset-4">
            info@zineticmusic.com
          </a>
        </p>
      </Section>

      <Section title="United Kingdom office">
        <p>71-75 Shelton Street, Covent Garden, London, WC2H 9JQ</p>
        <p className="mt-1">
          Phone: +44 7307 601 744
          <br />
          Email:{" "}
          <a href="mailto:contact@zineticmusic.com" className="text-primary underline underline-offset-4">
            contact@zineticmusic.com
          </a>
        </p>
      </Section>

      <Section title="Company details">
        <p className="text-muted-foreground">
          Trade License No.: <span className="text-foreground">[to be added]</span>
          <br />
          TIN: <span className="text-foreground">[to be added]</span>
        </p>
      </Section>

      <Section title="Support">
        <p>
          For account, wallet, or payment questions, email{" "}
          <a href="mailto:support@zineticmusic.com" className="text-primary underline underline-offset-4">
            support@zineticmusic.com
          </a>{" "}
          and we&apos;ll get back to you as soon as possible.
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
