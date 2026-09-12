export const metadata = { title: "About Us | Zinetic Music" };

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">About Us</h1>
      </div>

      <Section title="Who we are">
        <p>
          Zinetic Music Limited operates Zinetic Music, a YouTube MCN (Multi-Channel Network)
          checker and copyright management platform for creators, record labels, and digital
          rights managers. The Service instantly identifies which network a YouTube channel
          belongs to, surfaces verified contact details, and helps manage copyright claims.
        </p>
      </Section>

      <Section title="Digital service, no physical shipping">
        <p>
          Zinetic Music is a fully digital, online-only service. There are no physical products,
          shipping, or delivery involved, channel checks and wallet top-ups are delivered
          instantly to your account.
        </p>
      </Section>

      <Section title="Registered office">
        <p>Batar Goli, Boro Moghbazar, Ramna, Dhaka, 1217, Bangladesh</p>
      </Section>

      <Section title="Company details">
        <p className="text-muted-foreground">
          Trade License No.: <span className="text-foreground">[to be added]</span>
          <br />
          TIN: <span className="text-foreground">[to be added]</span>
        </p>
      </Section>

      <Section title="Management">
        <p className="text-muted-foreground">[Management team details to be added]</p>
      </Section>

      <Section title="Contact">
        <p>
          <a href="mailto:info@zineticmusic.com" className="text-primary underline underline-offset-4">
            info@zineticmusic.com
          </a>{" "}
          &middot; +880 9696 797 267
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
