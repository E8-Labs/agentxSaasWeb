import Image from "next/image";
import { MYAGENTX_URL } from "./constants";
import { AudioWaveActivity } from "./askskycomponents/AudioWaveActivity";
import { VoiceWavesComponent } from "./askskycomponents/voice-waves";

export function VoiceInterface({ loading, loadingMessage, isSpeaking }) {
  return (
    <>
      <div className="h-[200px] w-[200px] flex flex-col items-center justify-between mb-8">
        <div className="relative w-[125px] h-[150px] mx-auto mt-4">
          {/* Gradient Glow Border */}
          {/* <div className="absolute inset-0 rounded-full bg-gradient-to-br from-pink-400 via-purple-400 to-blue-400 blur-2xl opacity-70"></div> */}

          {/* Image */}
          <img
            src="/agentXOrb.gif"
            alt="AgentX Orb"
            className="relative z-10 rounded-full bg-white shadow-lg object-cover"
            style={{
              height: "120px",
              width: "120px",
            }}
          />
        </div>
        {loading ? (
          <p style={{
            whiteSpace:'nowrap'
          }} className="mt-10 italic w-full truncate">{loadingMessage}</p>
        ) : (
          isSpeaking ? (
            <VoiceWavesComponent
              className="mt-12"

            />
          ) :
            <AudioWaveActivity
              isActive={isSpeaking}
              barCount={15}
              className="mt-10"
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
