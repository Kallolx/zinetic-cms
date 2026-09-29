export const metadata = { title: "About Us | Zinetic Music" };

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">About Us</h1>
      </div>

      <Section title="Who we are">
        <p>
          Zinetic Music Limited is a Bangladesh-based digital music and technology company
          providing music distribution, digital creator services, subscription-based tools, and
          AI-powered media solutions to artists, labels, creators, and businesses.
        </p>
        <p className="mt-3">
          Our services are designed to support creators and digital businesses with access to
          music distribution, digital media tools, AI-powered audio and video solutions, and other
          online services through a secure and user-friendly platform. Zinetic Music, the YouTube
          MCN (Multi-Channel Network) checker and copyright management platform, is one of these
          services: it instantly identifies which network a YouTube channel belongs to, surfaces
          verified contact details, and helps manage copyright claims.
        </p>
      </Section>

      <Section title="Service activation time">
        <p>
          Zinetic Music is a fully digital, subscription-style service with no physical goods, so
          delivery time and stock quantity do not apply. Wallet top-ups are credited to your
          account within a few minutes of a successful payment, and channel/network checks return
          a result instantly. There is nothing to ship and nothing to wait days for.
        </p>
      </Section>

      <Section title="Company information">
        <p className="text-muted-foreground">
          Company Name: <span className="text-foreground">Zinetic Music Limited</span>
          <br />
          Country: <span className="text-foreground">Bangladesh</span>
          <br />
          RJSC Registration No.: <span className="text-foreground">C-195622/2024</span>
          <br />
          Trade License No.: <span className="text-foreground">TRAD/DNCC/000393/2024</span>
          <br />
          Registered Address:{" "}
          <span className="text-foreground">
            258/B, Batar Goli, Boro Moghbazar, Ramna, Dhaka 1217
          </span>
        </p>
      </Section>

      <Section title="Management">
        <p className="text-muted-foreground">
          <span className="text-foreground font-medium">Zishan Mahmud Rudro</span>
          <br />
          Managing Director &amp; CEO
          <br />
          Zinetic Music Limited
        </p>
      </Section>

      <Section title="Contact">
        <p>
          For business inquiries or customer support, please contact us through the information
          provided on our{" "}
          <a href="/contact" className="text-primary underline underline-offset-4">
            Contact Us
          </a>{" "}
          page.
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
