import { LuShieldCheck } from "react-icons/lu";
import { LegalDoc, PageHero, type DocSection } from "@/components/landing/page-parts";

export const metadata = { title: "Privacy Policy | Zinetic Music" };

const sections: DocSection[] = [
  {
    id: "information-we-collect",
    title: "Information we collect",
    body: (
      <p>
        We collect the information you provide when you register (name, email address), the
        channel links or IDs you submit for a check, and payment metadata from our payment
        processor (such as transaction ID and status, we do not store your card details).
      </p>
    ),
  },
  {
    id: "how-we-use-it",
    title: "How we use your information",
    body: (
      <p>
        We use your information to operate your account, process wallet payments, run the
        checks you request, provide customer support, and comply with legal and financial
        record-keeping obligations.
      </p>
    ),
  },
  {
    id: "payment-processing",
    title: "Payment processing",
    body: (
      <p>
        Wallet top-ups are processed by SSLCommerz, a licensed payment service provider. Card
        and mobile banking details are entered directly on SSLCommerz&apos;s secure payment page
        and are never seen or stored by Zinetic Music.
      </p>
    ),
  },
  {
    id: "sharing",
    title: "Sharing your information",
    body: (
      <p>
        We do not sell your personal information. We share it only with service providers
        necessary to operate the Service (such as our hosting provider, database provider, and
        payment processor), or where required by law. We do not permit third-party advertising
        on the Service, and we are not responsible for any third party a user independently
        chooses to share their own information with.
      </p>
    ),
  },
  {
    id: "retention",
    title: "Data retention",
    body: (
      <p>
        We retain account and transaction records for as long as your account is active and for
        a reasonable period afterward to meet legal, accounting, and dispute-resolution
        requirements.
      </p>
    ),
  },
  {
    id: "your-rights",
    title: "Your rights",
    body: (
      <p>
        You can request a copy of the personal information we hold about you, or request
        correction or deletion of your account, by contacting us at the email below.
      </p>
    ),
  },
  {
    id: "contact",
    title: "Contact",
    body: (
      <p>
        Privacy questions can be sent to{" "}
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

export default function PrivacyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title={
          <>
            Privacy <span className="zl-serif zl-grad-text">Policy</span>
          </>
        }
        sub="What we collect, why we collect it, and what we never do with it."
        meta={
          <p className="inline-flex items-center gap-2 rounded-full border border-(--zl-line) bg-(--zl-surface)/70 px-3.5 py-1.5 text-xs font-medium text-(--zl-muted) backdrop-blur-md">
            <LuShieldCheck className="size-3.5" /> Last updated: September 2026
          </p>
        }
      />
      <LegalDoc sections={sections} />
    </>
  );
}
