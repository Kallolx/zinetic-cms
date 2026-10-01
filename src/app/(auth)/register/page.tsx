import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { checkoutUrl } from "@/lib/site";

// Every account starts with a purchase now. Each dashboard's login sends "Register" here,
// and this opens checkout on that dashboard's own service.
export default async function RegisterPage() {
  const host = ((await headers()).get("host") ?? "").split(":")[0];
  let studioHost = "";
  try {
    studioHost = new URL(process.env.NEXT_PUBLIC_STUDIO_URL ?? "").hostname;
  } catch {}
  redirect(checkoutUrl(studioHost && host === studioHost ? "voice-generator" : "mcn-checker"));
}
