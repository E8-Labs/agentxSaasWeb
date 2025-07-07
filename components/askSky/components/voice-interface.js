import Image from "next/image";
import { AudioWaveActivity } from "./audio-wave-activity";
import { MYAGENTX_URL } from "../constants";

export function VoiceInterface({ loading, loadingMessage, isSpeaking }) {
  return (
    <>
      <div className="h-[150px] w-[200px] flex flex-col items-center justify-between mb-8">
        <Image
          className="rounded-full bg-white shadow-lg h-auto w-auto shrink-0 z-0 object-center object-cover"
          src="/agentXOrb.gif"
          alt="AgentX Orb"
          height={144}
          width={144}
        />
        {loading ? (
          <p className="mt-10 italic">{loadingMessage}</p>
        ) : (
          <AudioWaveActivity
            isActive={isSpeaking}
            barCount={15}
            className="mt-12"
          />
        )}
      </div>
      <div className="relative w-2/3 flex flex-col h-5 items-center justify-center gap-6 z-10">
        <div className="h-full flex justify-center items-center gap-1">
          <p className="text-xs">Powered by</p>
          <a
            href={MYAGENTX_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="block font-medium"
          >
            <Image
              src="/agentx-logo.png"
              alt="AgentX Logo"
              className="w-auto h-auto"
              height={14}
              width={60}
            />
          </a>
        </div>
      </div>
    </>
  );
}
