// app/embed/vapi/page.jsx or page.tsx
"use client";
import React, { Suspense, useEffect } from "react";
import EmbedVapi from "./EmbedVapi";

function Page() {
  useEffect(() => {
    // Store current background to restore later
    const orig = document.body.style.background;
    document.body.style.background = "transparent";
    // For Next.js root container as well
    const nextRoot = document.getElementById("__next");
    let prevNextBg;
    if (nextRoot) {
      prevNextBg = nextRoot.style.background;
      nextRoot.style.background = "transparent";
    }
    return () => {
      // Restore on unmount
      document.body.style.background = orig;
      if (nextRoot) nextRoot.style.background = prevNextBg;
    };
  }, []);
  return (
    <div style={{ backgroundColor: "white" }}>
      <Suspense>
        <EmbedVapi />
      </Suspense>
    </div>
  );
}

export default Page;
