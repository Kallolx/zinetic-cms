"use client";

import * as React from "react";

export function ExpandableText({
  text,
  className,
  maxChars = 180,
}: {
  text: string;
  className?: string;
  maxChars?: number;
}) {
  const [expanded, setExpanded] = React.useState(false);
  const needsTruncation = text.length > maxChars;
  const shown = expanded || !needsTruncation ? text : text.slice(0, maxChars).trimEnd();

  return (
    <p className={className}>
      {shown}
      {needsTruncation && !expanded && "… "}
      {needsTruncation && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="font-medium text-primary hover:underline"
        >
          {expanded ? "See less" : "See all"}
        </button>
      )}
    </p>
  );
}
