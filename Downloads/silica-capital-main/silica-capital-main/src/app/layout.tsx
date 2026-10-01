import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { Shell } from "@/components/Shell";
import { AuthGate } from "@/components/AuthGate";

export const metadata: Metadata = {
  title: "Silica Capital",
  description: "Pooled investment ledger — contributions, trades, and each member's share.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* The gate wraps the store so no query is fired before sign-in. */}
        <AuthGate>
          <StoreProvider>
            <Shell>{children}</Shell>
          </StoreProvider>
        </AuthGate>
      </body>
    </html>
  );
}
