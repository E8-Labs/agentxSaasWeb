import { useSearchParams } from "next/navigation";
import { VapiWidget } from "../../../components/askSky/vapi-widget"; // adjust import as needed
import { DEFAULT_ASSISTANT_ID } from "@/components/askSky/constants";

export default function EmbedVapi() {
  const searchParams = useSearchParams();
  const assistantId = searchParams.get("assistantId") || DEFAULT_ASSISTANT_ID;

  console.log("assistant id is ", assistantId);
  return (
    <div style={{backgroundColor: "#ffffff01"}}>
      <VapiWidget
        assistantId={assistantId}
        shouldStart={true}
        setShowAskSkyModal={() => { }}
        setShouldStartCall={() => { }}
        loadingChanged={() => { }}
        isEmbeded={true}
      />
    </div>
  );
}