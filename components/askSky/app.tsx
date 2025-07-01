import { MYAGENTX_URL } from "./constants";
import { VapiWidget } from "./vapi-widget";

export function App() {
  return (
    <div className="relative w-full h-full min-h-screen flex flex-col gap-4 items-center justify-center bg-white text-black/90 z-0">
      <div className="fixed top-0 left-0 w-full px-6 h-16 flex items-center justify-between">
        <a href={MYAGENTX_URL} target="_blank" rel="noopener noreferrer">
          <img
            src="/agentx-logo.png"
            alt="AgentX Logo"
            className="h-7 w-auto"
          />
        </a>
      </div>
      <img
        src="/agentx-avatars.png"
        alt="AgentX Avatars"
        className="relative z-10 w-5/6 max-w-2xl h-auto"
      />
      <div className="relative z-10">
        <VapiWidget />
      </div>
    </div>
  );
}
