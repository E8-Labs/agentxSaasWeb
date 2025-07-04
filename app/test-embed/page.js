// app/test-embed/page.tsx
"use client";

export default function TestEmbed() {
  return (
    <div style={{ minHeight: "100vh", background: "#f7f7fa", padding: 40 }}>
      <iframe
        src="/embed/vapi?assistantId=84ceab69-812d-4c6e-a8e1-0c8cb23f7a95"
        width="350"
        height="400"
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          background: "#fff",
          boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        }}
        title="AgentX Widget"
      />
    </div>
  );
}
