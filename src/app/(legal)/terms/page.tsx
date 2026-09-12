export const metadata = { title: "Terms and Conditions | Zinetic Music" };

export default function TermsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-3xl font-bold">Terms and Conditions</h1>
        <p className="mt-2 text-sm text-muted-foreground">Last updated: September 2026</p>
      </div>

      <Section title="1. About the service">
        <p>
          Zinetic Music (&quot;we&quot;, &quot;our&quot;, &quot;the Service&quot;) is operated by
          Zinetic Music Limited. The Service is a digital platform that lets registered users look
          up YouTube channel network (MCN) affiliation and contact information, and manage
          copyright and claim workflows, in exchange for a per-check fee deducted from a prepaid
          wallet balance.
        </p>
      </Section>

      <Section title="2. Accounts">
        <p>
          Registration requires an accurate name and email address. New accounts must be reviewed
          and approved by an administrator before use. We may suspend or reject accounts that
          provide false information or misuse the Service.
        </p>
      </Section>

      <Section title="3. Wallet balance and payments">
        <p>
          Checks are charged against your wallet balance at the price displayed at the time of the
          check. Wallet balance can be added through our online payment gateway or by contacting
          an administrator. Wallet balance has no cash value outside the Service and is
          non-transferable between accounts.
        </p>
      </Section>

      <Section title="4. Acceptable use">
        <p>
          You agree not to use the Service to violate any law, to misrepresent channel or network
          data, or to attempt to circumvent wallet charges or access controls. We may suspend
          accounts found in breach of these terms.
        </p>
      </Section>

      <Section title="5. Data from third parties">
        <p>
          Channel and network information is retrieved from third-party data providers on a
          best-effort basis. We do not guarantee the accuracy, completeness, or timeliness of this
          data, and results should be independently verified before being relied upon for
          copyright or business decisions.
        </p>
      </Section>

      <Section title="6. Third-party advertisements and data sharing">
        <p>
          We do not run or permit third-party advertisements on the Service. If a user or merchant
          independently integrates or allows any third-party advertisement on their own channel,
          content, or account, that is entirely their own responsibility and not ours. Likewise, if
          a user shares any customer or personal information with a third party outside of the
          Service, that sharing and its consequences are the sharing party&apos;s sole
          responsibility.
        </p>
      </Section>

      <Section title="7. Limitation of liability">
        <p>
          The Service is provided &quot;as is&quot;. To the extent permitted by law, Zinetic Music
          Limited is not liable for indirect, incidental, or consequential damages arising from
          use of the Service.
        </p>
      </Section>

      <Section title="8. Changes to these terms">
        <p>
          We may update these Terms from time to time. Continued use of the Service after changes
          are posted constitutes acceptance of the revised Terms.
        </p>
      </Section>

      <Section title="9. Contact">
        <p>
          Questions about these Terms can be sent to{" "}
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
