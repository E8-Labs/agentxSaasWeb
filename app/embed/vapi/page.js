// app/embed/vapi/page.jsx or page.tsx
"use client";
import { useSearchParams } from "next/navigation";
import { VapiWidget } from "../../../components/askSky/vapi-widget"; // adjust import as needed
import { DEFAULT_ASSISTANT_ID } from "@/components/asksky/constants";

export default function EmbedVapi() {
  const searchParams = useSearchParams();
  const assistantId = searchParams.get("assistantId") || DEFAULT_ASSISTANT_ID;

  console.log("assistant id is ", assistantId);
  return (
    <VapiWidget
      assistantId={assistantId}
      shouldStart={true}
      setShowAskSkyModal={() => {}}
      setShouldStartCall={() => {}}
      loadingChanged={() => {}}
      isEmbeded={true}
    />
  );
}
