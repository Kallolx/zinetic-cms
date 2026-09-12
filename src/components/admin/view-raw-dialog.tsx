"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { LuCode } from "react-icons/lu";

export function ViewRawDialog({
  channelName,
  channelInput,
  rawResponse,
}: {
  channelName: string;
  channelInput: string;
  rawResponse: unknown;
}) {
  return (
    <Dialog>
      <DialogTrigger
        render={
          <Button variant="ghost" size="icon-sm" aria-label="View raw API response">
            <LuCode className="size-4" />
          </Button>
        }
      />
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{channelName || channelInput}</DialogTitle>
        </DialogHeader>
        <pre className="max-h-[60vh] overflow-auto rounded-lg bg-muted p-4 text-xs leading-relaxed">
          {JSON.stringify(rawResponse ?? {}, null, 2)}
        </pre>
      </DialogContent>
    </Dialog>
  );
}
