import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LuMail, LuClock } from "react-icons/lu";

export default function SupportPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-heading text-2xl font-semibold">Support</h2>
        <p className="text-[0.925rem] text-muted-foreground">
          Need help with a check, your wallet, or your account?
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contact us</CardTitle>
          <CardDescription>We usually reply within one business day.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          <a
            href="mailto:support@zineticmusic.com"
            className="flex items-center gap-3 rounded-lg border p-4 text-sm hover:bg-accent"
          >
            <LuMail className="size-5 text-primary" />
            <div>
              <p className="font-medium">Email support</p>
              <p className="text-muted-foreground">support@zineticmusic.com</p>
            </div>
          </a>
          <div className="flex items-center gap-3 rounded-lg border p-4 text-sm">
            <LuClock className="size-5 text-primary" />
            <div>
              <p className="font-medium">Support hours</p>
              <p className="text-muted-foreground">Sun–Thu, 10am–6pm (GMT+6)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
