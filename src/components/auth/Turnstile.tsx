"use client";

import Script from "next/script";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (
        container: HTMLElement,
        options: {
          sitekey: string;
          callback: (token: string) => void;
          "expired-callback"?: () => void;
          "error-callback"?: () => void;
        }
      ) => string;
      reset: (widgetId?: string) => void;
      remove: (widgetId?: string) => void;
    };
  }
}

export type TurnstileHandle = {
  reset: () => void;
};

const Turnstile = forwardRef<
  TurnstileHandle,
  { onVerify: (token: string) => void; onExpire?: () => void }
>(function Turnstile({ onVerify, onExpire }, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const widgetIdRef = useRef<string | null>(null);
  const onVerifyRef = useRef(onVerify);
  const onExpireRef = useRef(onExpire);
  const [scriptLoaded, setScriptLoaded] = useState(
    typeof window !== "undefined" && !!window.turnstile
  );

  onVerifyRef.current = onVerify;
  onExpireRef.current = onExpire;

  useImperativeHandle(ref, () => ({
    reset: () => {
      if (widgetIdRef.current) {
        window.turnstile?.reset(widgetIdRef.current);
      }
    },
  }));

  useEffect(() => {
    if (!scriptLoaded || !containerRef.current || !window.turnstile) return;

    const id = window.turnstile.render(containerRef.current, {
      sitekey: process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!,
      callback: (token) => onVerifyRef.current(token),
      "expired-callback": () => onExpireRef.current?.(),
      "error-callback": () => onExpireRef.current?.(),
    });

    widgetIdRef.current = id;

    return () => {
      window.turnstile?.remove(id);
      widgetIdRef.current = null;
    };
  }, [scriptLoaded]);

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
        onLoad={() => setScriptLoaded(true)}
      />
      <div ref={containerRef} className="flex justify-center" />
    </>
  );
});

export default Turnstile;
