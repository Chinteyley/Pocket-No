import React from "react";
import { Pressable, Text, View } from "react-native";

import type { NoReason } from "@/features/no/contracts";
import { cn } from "@/lib/cn";

const FONT_DISPLAY = { fontFamily: "Instrument Serif, serif" } as const;
const FONT_BODY = { fontFamily: "Figtree, sans-serif" } as const;
const EASE_OUT = "cubic-bezier(0.23, 1, 0.32, 1)";

type AnimPhase = "idle" | "exiting" | "entering";

type DemoSectionProps = {
  isDesktop: boolean;
};

function delay(ms: number) {
  return new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

function raf() {
  return new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });
}

async function fetchReason(signal?: AbortSignal): Promise<NoReason> {
  const res = await fetch("/api/no", { signal });
  if (!res.ok) {
    throw new Error(`API responded with ${res.status}`);
  }
  return res.json();
}

export function DemoSection({ isDesktop }: DemoSectionProps) {
  const [reason, setReason] = React.useState<NoReason | null>(null);
  const [animPhase, setAnimPhase] = React.useState<AnimPhase>("idle");
  const [busy, setBusy] = React.useState<"loading" | "copy" | "another" | null>(
    "loading",
  );
  const [copyFlash, setCopyFlash] = React.useState(false);
  const [mounted, setMounted] = React.useState(false);
  const busyRef = React.useRef(false);
  const copyFlashTimeoutRef = React.useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const abortRef = React.useRef<AbortController | null>(null);

  React.useEffect(() => {
    const controller = new AbortController();
    abortRef.current = controller;

    fetchReason(controller.signal)
      .then((r) => {
        setReason(r);
        setBusy(null);
      })
      .catch(() => {
        if (!controller.signal.aborted) {
          setBusy(null);
        }
      });

    // Stagger entrance of the card itself
    const mountTimer = setTimeout(() => setMounted(true), 200);

    return () => {
      controller.abort();
      clearTimeout(mountTimer);
      if (copyFlashTimeoutRef.current) {
        clearTimeout(copyFlashTimeoutRef.current);
      }
    };
  }, []);

  const handleAnother = async () => {
    if (busyRef.current) return;
    busyRef.current = true;
    setBusy("another");
    setCopyFlash(false);
    setAnimPhase("exiting");
    await delay(220);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const r = await fetchReason(controller.signal);
      setReason(r);
      setAnimPhase("entering");
      // Split entering → idle across frames so the CSS engine paints the entering state
      await raf();
      await raf();
      setAnimPhase("idle");
    } catch {
      setAnimPhase("idle");
    } finally {
      setBusy(null);
      busyRef.current = false;
    }
  };

  const handleCopy = async () => {
    if (busyRef.current || !reason) return;
    busyRef.current = true;
    setBusy("copy");
    try {
      await navigator.clipboard.writeText(reason.copiedText);
      if (copyFlashTimeoutRef.current) {
        clearTimeout(copyFlashTimeoutRef.current);
      }
      setCopyFlash(true);
      copyFlashTimeoutRef.current = setTimeout(() => {
        copyFlashTimeoutRef.current = null;
        setCopyFlash(false);
      }, 1200);
    } catch {
      // clipboard may fail in non-secure contexts
    } finally {
      setBusy(null);
      busyRef.current = false;
    }
  };

  const textStyle = {
    opacity: animPhase === "exiting" ? 0 : 1,
    transform:
      animPhase === "exiting"
        ? "translateY(-8px)"
        : animPhase === "entering"
          ? "translateY(8px)"
          : "translateY(0)",
    transition: `opacity 200ms ${EASE_OUT}, transform 200ms ${EASE_OUT}`,
  } as const;

  return (
    <View className={cn("items-center px-6 py-16", isDesktop && "py-24")}>
      <Text
        className={cn(
          "mb-3 text-center text-muted",
          isDesktop ? "text-[15px]" : "text-[13px]",
        )}
        style={{
          ...FONT_BODY,
          fontWeight: "600",
          letterSpacing: 1.5,
          textTransform: "uppercase",
          opacity: mounted ? 1 : 0,
          transform: mounted ? "translateY(0)" : "translateY(8px)",
          // @ts-expect-error -- web-only
          transition: `opacity 500ms ${EASE_OUT}, transform 500ms ${EASE_OUT}`,
        }}
      >
        Try it yourself
      </Text>

      <View
        className={cn(
          "w-full rounded-[28px] border border-outline bg-warm-surface px-6 pb-6 pt-8",
          isDesktop ? "max-w-[560px]" : "max-w-[480px]",
        )}
        style={{
          boxShadow:
            "0 24px 48px rgba(0,0,0,0.06), 0 4px 12px rgba(0,0,0,0.03)",
          opacity: mounted ? 1 : 0,
          transform: mounted
            ? "translateY(0) scale(1)"
            : "translateY(16px) scale(0.98)",
          // @ts-expect-error -- web-only CSS property
          transition: `opacity 600ms ${EASE_OUT} 80ms, transform 600ms ${EASE_OUT} 80ms, box-shadow 300ms ${EASE_OUT}`,
        }}
      >
        <View style={{ minHeight: 120, justifyContent: "center" }}>
          {reason ? (
            <Text
              className={cn(
                "text-ink",
                isDesktop
                  ? "text-[28px] leading-[38px]"
                  : "text-[24px] leading-[34px]",
              )}
              style={{
                ...FONT_DISPLAY,
                ...textStyle,
              }}
            >
              {`\u201C${reason.text}\u201D`}
            </Text>
          ) : (
            <Text
              className={cn(
                "text-muted",
                isDesktop
                  ? "text-[22px] leading-[30px]"
                  : "text-[20px] leading-[28px]",
              )}
              style={FONT_DISPLAY}
            >
              {busy === "loading"
                ? "Finding you an excuse\u2026"
                : "Something went wrong. Try refreshing."}
            </Text>
          )}
        </View>

        <View className="mt-6 flex-row gap-3">
          <Pressable
            accessibilityRole="button"
            onPress={() => void handleAnother()}
            disabled={busy !== null}
            className={cn(
              "flex-1 items-center justify-center rounded-[16px] bg-button-primary px-5 py-4",
              busy !== null && "opacity-60",
            )}
            style={({ pressed, hovered }) => ({
              transform: pressed
                ? "scale(0.97)"
                : hovered
                  ? "scale(1.02)"
                  : "scale(1)",
              transition: `transform 160ms ${EASE_OUT}`,
            })}
          >
            <Text
              className="text-[16px] text-button-primary-text"
              style={{ ...FONT_BODY, fontWeight: "600" }}
            >
              {busy === "another" ? "Loading\u2026" : "Another one"}
            </Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => void handleCopy()}
            disabled={busy !== null || !reason}
            className={cn(
              "flex-1 items-center justify-center rounded-[16px] border px-5 py-4",
              copyFlash
                ? "border-accent/20 bg-accent-wash"
                : "border-outline bg-button-secondary",
              (busy !== null || !reason) && !copyFlash && "opacity-60",
            )}
            style={({ pressed, hovered }) => ({
              transform: pressed
                ? "scale(0.97)"
                : hovered
                  ? "scale(1.02)"
                  : "scale(1)",
              transition: `transform 160ms ${EASE_OUT}, background-color 300ms ${EASE_OUT}, border-color 300ms ${EASE_OUT}`,
            })}
          >
            <Text
              className={cn(
                "text-[16px]",
                copyFlash ? "text-accent" : "text-button-secondary-text",
              )}
              style={{
                ...FONT_BODY,
                fontWeight: "600",
                // @ts-expect-error -- web-only CSS property
                transition: `color 300ms ${EASE_OUT}`,
              }}
            >
              {copyFlash ? "\u2713  Copied!" : "Copy"}
            </Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
}
