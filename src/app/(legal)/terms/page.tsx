import { LuFileText } from "react-icons/lu";
import { LegalDoc, PageHero, type DocSection } from "@/components/landing/page-parts";

export const metadata = { title: "Terms and Conditions | Zinetic Music" };

const sections: DocSection[] = [
  {
    id: "about-the-service",
    title: "About the service",
    body: (
      <p>
        Zinetic Music (&quot;we&quot;, &quot;our&quot;, &quot;the Service&quot;) is operated by
        Zinetic Music Limited. The Service is a digital platform that lets registered users look
        up YouTube channel network (MCN) affiliation and contact information, and manage
        copyright and claim workflows, in exchange for a per-check fee deducted from a prepaid
        wallet balance.
      </p>
    ),
  },
  {
    id: "accounts",
    title: "Accounts",
    body: (
      <p>
        Registration requires an accurate name and email address. New accounts must be reviewed
        and approved by an administrator before use. We may suspend or reject accounts that
        provide false information or misuse the Service.
      </p>
    ),
  },
  {
    id: "wallet-and-payments",
    title: "Wallet balance and payments",
    body: (
      <p>
        Checks are charged against your wallet balance at the price displayed at the time of the
        check. Wallet balance can be added through our online payment gateway or by contacting
        an administrator. Wallet balance has no cash value outside the Service and is
        non-transferable between accounts.
      </p>
    ),
  },
  {
    id: "acceptable-use",
    title: "Acceptable use",
    body: (
      <p>
        You agree not to use the Service to violate any law, to misrepresent channel or network
        data, or to attempt to circumvent wallet charges or access controls. We may suspend
        accounts found in breach of these terms.
      </p>
    ),
  },
  {
    id: "third-party-data",
    title: "Data from third parties",
    body: (
      <p>
        Channel and network information is retrieved from third-party data providers on a
        best-effort basis. We do not guarantee the accuracy, completeness, or timeliness of this
        data, and results should be independently verified before being relied upon for
        copyright or business decisions.
      </p>
    ),
  },
  {
    id: "advertisements-and-sharing",
    title: "Third-party advertisements and data sharing",
    body: (
      <p>
        We do not run or permit third-party advertisements on the Service. If a user or merchant
        independently integrates or allows any third-party advertisement on their own channel,
        content, or account, that is entirely their own responsibility and not ours. Likewise, if
        a user shares any customer or personal information with a third party outside of the
        Service, that sharing and its consequences are the sharing party&apos;s sole
        responsibility.
      </p>
    ),
  },
  {
    id: "liability",
    title: "Limitation of liability",
    body: (
      <p>
        The Service is provided &quot;as is&quot;. To the extent permitted by law, Zinetic Music
        Limited is not liable for indirect, incidental, or consequential damages arising from
        use of the Service.
      </p>
    ),
  },
  {
    id: "changes",
    title: "Changes to these terms",
    body: (
      <p>
        We may update these Terms from time to time. Continued use of the Service after changes
        are posted constitutes acceptance of the revised Terms.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    body: (
      <p>
        Questions about these Terms can be sent to{" "}
        <a
          href="mailto:info@zineticmusic.com"
          className="text-(--zl-text) underline decoration-[#ff3d86] underline-offset-4"
        >
          info@zineticmusic.com
        </a>
        .
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title={
          <>
            Terms &amp; <span className="zl-serif zl-grad-text">Conditions</span>
          </>
        }
        sub="The rules for using Zinetic Music, written to be read."
        meta={
          <p className="inline-flex items-center gap-2 rounded-full border border-(--zl-line) bg-(--zl-surface)/70 px-3.5 py-1.5 text-xs font-medium text-(--zl-muted) backdrop-blur-md">
            <LuFileText className="size-3.5" /> Last updated: September 2026
          </p>
        }
      />
      <LegalDoc sections={sections} />
    </>
  );
}
