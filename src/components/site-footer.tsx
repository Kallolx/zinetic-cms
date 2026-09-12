import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/components/logo";
import { LuMapPin, LuMail, LuPhone } from "react-icons/lu";
import {
  FaFacebookF,
  FaWhatsapp,
  FaLinkedinIn,
  FaYoutube,
  FaInstagram,
  FaXTwitter,
  FaSoundcloud,
  FaSpotify,
  FaTiktok,
  FaStar,
} from "react-icons/fa6";

export function SiteFooter() {
  return (
    <footer className="relative z-10 border-t border-neutral-800 bg-[#080808] text-white pt-16 pb-8 px-6">
      <div className="mx-auto max-w-7xl">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12">
          {/* Column 1: Brand Info (3 cols) */}
          <div className="space-y-6 lg:col-span-3">
            <Logo size={36} />
            <p className="text-sm leading-relaxed text-neutral-400 max-w-sm">
              YouTube MCN Checker &amp; Copyright Management portal built for creators, record labels, and digital rights managers.
            </p>
            <div className="flex items-center gap-3">
              <a href="#" className="flex size-10 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white">
                <FaFacebookF className="size-4" />
              </a>
              <a href="#" className="flex size-10 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white">
                <FaWhatsapp className="size-4" />
              </a>
              <a href="#" className="flex size-10 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white">
                <FaLinkedinIn className="size-4" />
              </a>
              <a href="#" className="flex size-10 items-center justify-center rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-300 transition-colors hover:bg-neutral-800 hover:text-white">
                <FaYoutube className="size-4" />
              </a>
            </div>
          </div>

          {/* Column 2: Legal (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-white mb-5">LEGAL</h4>
            <ul className="space-y-3 text-sm text-neutral-400">
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact Us</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms &amp; Conditions</Link></li>
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/refund-policy" className="hover:text-white transition-colors">Refund Policy</Link></li>
            </ul>
          </div>

          {/* Column 3: United Kingdom (3 cols) */}
          <div className="lg:col-span-3">
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-white mb-5 flex items-center gap-2">
              <span>🇬🇧</span> UNITED KINGDOM
            </h4>
            <ul className="space-y-3.5 text-sm text-neutral-400">
              <li className="flex items-start gap-3">
                <LuMapPin className="size-4 mt-0.5 shrink-0 text-neutral-500" />
                <span>71-75 Shelton Street, Covent Garden, London, WC2H 9JQ</span>
              </li>
              <li className="flex items-center gap-3">
                <LuPhone className="size-4 shrink-0 text-neutral-500" />
                <span>+44 7307 601 744</span>
              </li>
              <li className="flex items-center gap-3">
                <LuMail className="size-4 shrink-0 text-neutral-500" />
                <a href="mailto:contact@zineticmusic.com" className="hover:text-white transition-colors">contact@zineticmusic.com</a>
              </li>
            </ul>
          </div>

          {/* Column 4: Bangladesh (4 cols) */}
          <div className="lg:col-span-4">
            <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-white mb-5 flex items-center gap-2">
              <span>🇧🇩</span> BANGLADESH
            </h4>
            <ul className="space-y-3.5 text-sm text-neutral-400">
              <li className="flex items-start gap-3">
                <LuMapPin className="size-4 mt-0.5 shrink-0 text-neutral-500" />
                <span>Batar Goli, Boro Moghbazar, Ramna, Dhaka, 1217</span>
              </li>
              <li className="flex items-center gap-3">
                <LuPhone className="size-4 shrink-0 text-neutral-500" />
                <span>+880 9696 797 267</span>
              </li>
              <li className="flex items-center gap-3">
                <LuMail className="size-4 shrink-0 text-neutral-500" />
                <a href="mailto:info@zineticmusic.com" className="hover:text-white transition-colors">info@zineticmusic.com</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Payment methods & Certifications */}
        <div className="mt-12 border-t border-neutral-900 pt-8">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-end">
            <div className="lg:col-span-7 flex flex-col justify-center">
              <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-white mb-4">
                WE ACCEPT
              </h4>
              <div className="overflow-hidden rounded-lg bg-white p-2 border border-neutral-800 flex h-20 w-full items-center justify-center">
                <Image
                  src="/SSLCommerz-Pay-With-logo-All-Size.webp"
                  alt="Payment Methods Accepted"
                  width={1200}
                  height={150}
                  className="max-h-full max-w-full w-auto h-auto object-contain mx-auto my-auto"
                />
              </div>
            </div>

            <div className="lg:col-span-5 flex flex-col justify-center">
              <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-white mb-4">
                GOVT. CERTIFIED SHOP
              </h4>
              <div className="overflow-hidden rounded-lg bg-white p-2 border border-neutral-800 flex h-20 w-full items-center justify-center">
                <Image
                  src="/govt-certified-banner.jpg"
                  alt="Government Certified Shop DBID Trust Badge"
                  width={1200}
                  height={200}
                  className="max-h-full max-w-full w-auto h-auto object-contain mx-auto my-auto"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row Bar */}
        <div className="mt-8 border-t border-neutral-900 pt-8 flex flex-col lg:flex-row items-center justify-between gap-6 text-xs text-neutral-500">
          <div>
            © Copyright 2026 | Zinetic Music Limited | All Right Reserved |{" "}
            <Link href="/privacy" className="hover:text-neutral-300">Privacy Policy</Link> |{" "}
            <Link href="/terms" className="hover:text-neutral-300">Terms and Conditions</Link> |{" "}
            <Link href="/refund-policy" className="hover:text-neutral-300">Refund Policy</Link> |{" "}
            <Link href="/about" className="hover:text-neutral-300">About Us</Link> |{" "}
            <Link href="/contact" className="hover:text-neutral-300">Contact Us</Link>
          </div>

          <div className="flex items-center gap-6">
            {/* Trustpilot Branding */}
            <div className="flex items-center gap-1.5 font-bold text-white text-sm">
              <FaStar className="size-4 text-[#00b67a] fill-[#00b67a]" />
              <span>Trustpilot</span>
            </div>

            {/* Small Circular Social Icons */}
            <div className="flex items-center gap-2">
              <a href="#" className="flex size-7 items-center justify-center rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors">
                <FaInstagram className="size-3.5" />
              </a>
              <a href="#" className="flex size-7 items-center justify-center rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors">
                <FaXTwitter className="size-3.5" />
              </a>
              <a href="#" className="flex size-7 items-center justify-center rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors">
                <FaSoundcloud className="size-3.5" />
              </a>
              <a href="#" className="flex size-7 items-center justify-center rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors">
                <FaSpotify className="size-3.5" />
              </a>
              <a href="#" className="flex size-7 items-center justify-center rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-white transition-colors">
                <FaTiktok className="size-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
