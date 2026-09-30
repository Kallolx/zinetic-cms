import Link from "next/link";
import { LuArrowUpRight, LuAudioLines, LuClapperboard, LuClock, LuLanguages } from "react-icons/lu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const TOOLS = [
  { name: "Text to speech", note: "Turn a script into a natural voice-over.", href: "/studio/voice", icon: LuAudioLines },
  { name: "AI avatar video", note: "A presenter that speaks your script.", icon: LuClapperboard },
  { name: "Video translation", note: "Dub a video into another language.", icon: LuLanguages },
];

export default function StudioHome() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-heading text-2xl font-semibold">AI Studio</h2>
        <p className="text-[0.925rem] text-muted-foreground">Voice, audio and video tools in one place.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {TOOLS.map((t) => {
          const body = (
            <Card className="h-full transition-colors hover:bg-accent/40">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <t.icon className="size-6 text-primary" />
                  {t.href ? (
                    <LuArrowUpRight className="size-5 text-muted-foreground" />
                  ) : (
                    <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <LuClock className="size-3.5" /> Soon
                    </span>
                  )}
                </div>
                <CardTitle className="mt-3 text-base">{t.name}</CardTitle>
                <CardDescription>{t.note}</CardDescription>
              </CardHeader>
              <CardContent />
            </Card>
          );
          return t.href ? (
            <Link key={t.name} href={t.href}>
              {body}
            </Link>
          ) : (
            <div key={t.name} className="opacity-70">
              {body}
            </div>
          );
        })}
      </div>
    </div>
  );
}
