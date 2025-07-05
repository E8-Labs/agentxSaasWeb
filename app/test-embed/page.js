// app/test-embed/page.tsx
"use client";

import { useEffect } from "react";

export default function TestEmbed() {
  return (
    <div style={{ minHeight: "100vh", background: "red" }}>
      <iframe
        src="/embed/vapi?assistantId=84ceab69-812d-4c6e-a8e1-0c8cb23f7a95"
        width="350"
        height="385"
        style={{
          border: "1px solid red",
          borderRadius: 12,
          background: "transparent",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
          position: "absolute",
          right: "2%",
          bottom: "3%",
        }}
        title="AgentX Widget"
      />
    </div>
  );
}
