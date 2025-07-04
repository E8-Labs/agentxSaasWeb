"use client";
import { useState } from "react";

export default function EmbedWidget({
  assistantId = "84ceab69-812d-4c6e-a8e1-0c8cb23f7a95",
  baseUrl = "https://ai.myagentx.com",
  setShowSuccessSnack = {setShowSuccessSnack},
  setIsVisible = {setIsVisible}
}) {
  // const [assistantId] = useState("84ceab69-812d-4c6e-a8e1-0c8cb23f7a95");

  const handleCopy = () => {
    const iframeCode = `<iframe
  src="${baseUrl}/embed/vapi?assistantId=${assistantId}"
  width="350"
  height="400"
  style="
    border: 1px solid #e5e7eb;
    border-radius: 12px;
    background: #fff;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  "
  title="AgentX Widget"
></iframe>`;

    navigator.clipboard.writeText(iframeCode).then(() => {
      // alert("Embed code copied to clipboard!");
      setShowSuccessSnack("Embed widget copied");
      setIsVisible(true);
    }).catch(err => {
      console.error("Failed to copy text: ", err);
    });
  };

  return (
    <div>
      <button onClick={handleCopy}>
        <div
            className="text-purple mb-3 mr-2"
            style={{ fontSize: 11, fontWeight: "600" }}
        >
         Embed
         </div>
      </button>
    </div>
  );
}





// "use client";
// import { useEffect, useState } from "react";

// export default function TestEmbed({
//   assistantId = "84ceab69-812d-4c6e-a8e1-0c8cb23f7a95",
  
// }) {
//   return (
//     <div style={{ minHeight: "100vh", background: "#f7f7fa", padding: 40 }}>

      
//         <iframe
//           src={`/embed/vapi?assistantId=${assistantId}`}
//           width="350"
//           height="400"
//           style={{
//             border: "1px solid #e5e7eb",
//             borderRadius: 12,
//             background: "#fff",
//             boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
//           }}
//           title="AgentX Widget"
//         />
  
//     </div>
//   );
// }
