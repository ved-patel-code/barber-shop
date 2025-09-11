// src/app/(manager)/manager/_components/TimeInput.tsx
"use client";

import * as React from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

// --- FIX: Converted the empty interface to a type alias ---
export type TimeInputProps = React.InputHTMLAttributes<HTMLInputElement>;

const TimeInput = React.forwardRef<HTMLInputElement, TimeInputProps>(
  ({ className, ...props }, ref) => {
    const localRef = React.useRef<HTMLInputElement>(null);

    const mergedRef = React.useCallback(
      (instance: HTMLInputElement | null) => {
        if (typeof ref === "function") ref(instance);
        else if (ref) ref.current = instance;
        (localRef as React.MutableRefObject<HTMLInputElement | null>).current =
          instance;
      },
      [ref]
    );

    const handleClick = () => {
      if (props.disabled || props.readOnly) {
        return;
      }
      localRef.current?.showPicker();
    };

    return (
      <div
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2",
          props.disabled || props.readOnly
            ? "cursor-not-allowed opacity-50"
            : "cursor-text",
          className
        )}
        onClick={handleClick}
      >
        <input
          type="time"
          ref={mergedRef}
          className="w-full bg-transparent outline-none border-none p-0 appearance-none disabled:cursor-not-allowed"
          style={{
            WebkitAppearance: "none",
            MozAppearance: "none",
            appearance: "none",
            colorScheme: "dark",
          }}
          {...props}
        />
        <Clock className="h-4 w-4 text-muted-foreground" />
      </div>
    );
  }
);
TimeInput.displayName = "TimeInput";

export { TimeInput };