// app/test-embed/page.tsx
"use client";

import { useEffect } from "react";

export default function TestEmbed() {


  return (
    <div style={{ minHeight: "100vh", background: "#f7f7fa" }}>
      <iframe src="http://localhost:3000/embed/support/dcddc675-d616-4089-8627-2b499da98188"
        style={{position: "fixed", bottom: 0, right: 0, width: "320px",
            height: "100vh", border: "none",
            background: "transparent", zIndex: 9999, pointerEvents: "auto"
          }}
        allow="microphone"
        // onLoad="this.style.pointerEvents = 'auto';"
        >
      </iframe>
    </div>
  );
}
