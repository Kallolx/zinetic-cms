import { LuReceipt } from "react-icons/lu";
import { LegalDoc, PageHero, type DocSection } from "@/components/landing/page-parts";

export const metadata = { title: "Return and Refund Policy | Zinetic Music" };

const sections: DocSection[] = [
  {
    id: "digital-service",
    title: "Digital service",
    body: (
      <p>
        Zinetic Music is a digital service. Wallet top-ups and channel/network checks are
        delivered instantly online, there is no physical product to return or ship.
      </p>
    ),
  },
  {
    id: "eligible-refunds",
    title: "Eligible refunds",
    body: (
      <>
        <p>We will issue a refund to your original payment method if:</p>
        <ul>
          <li>A wallet top-up was charged but never credited to your account due to a technical error.</li>
          <li>You were charged twice for the same top-up or the same check.</li>
          <li>
            A check was charged but failed due to an error on our end (not a &quot;not found&quot;
            result, which reflects a completed lookup).
          </li>
        </ul>
      </>
    ),
  },
  {
    id: "how-to-request",
    title: "How to request a refund",
    body: (
      <p>
        Contact{" "}
        <a
          href="mailto:info@zineticmusic.com"
          className="text-(--zl-text) underline decoration-[#ff3d86] underline-offset-4"
        >
          info@zineticmusic.com
        </a>{" "}
        within 14 days of the charge, with your account email and the transaction date/amount.
        We review every request individually.
      </p>
    ),
  },
  {
    id: "refund-timeline",
    title: "Refund timeline",
    body: (
      <p>
        Approved refunds are processed back to the original payment method within{" "}
        <strong>7 to 10 working days</strong> of approval. The exact time funds take to appear
        in your account after that depends on your bank or mobile banking provider.
      </p>
    ),
  },
  {
    id: "unused-balance",
    title: "Unused wallet balance",
    body: (
      <p>
        Unused wallet balance is not automatically refundable, but you may request a refund of
        your remaining balance when closing your account; this is also processed within 7 to 10
        working days of approval.
      </p>
    ),
  },
];

export default function RefundPolicyPage() {
  return (
    <>
      <PageHero
        eyebrow="Legal"
        title={
          <>
            Return &amp; <span className="zl-serif zl-grad-text">Refund</span> Policy
          </>
        }
        sub="Fair, simple and fast: approved refunds reach you within 7 to 10 working days."
        meta={
          <p className="inline-flex items-center gap-2 rounded-full border border-(--zl-line) bg-(--zl-surface)/70 px-3.5 py-1.5 text-xs font-medium text-(--zl-muted) backdrop-blur-md">
            <LuReceipt className="size-3.5" /> Last updated: September 2026
          </p>
        }
      />
      <LegalDoc sections={sections} />
    </>
  );
}
