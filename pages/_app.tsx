import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { SettingsProvider } from "@/components/settings";

export default function App({ Component, pageProps }: AppProps) {
  return (
    <SettingsProvider>
      <Component {...pageProps} />
    </SettingsProvider>
  );
}
