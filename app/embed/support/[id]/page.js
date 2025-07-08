// app/embed/support/[id]/page.jsx or page.tsx

import { SupportEmbed } from "./support";

async function Page({ params }) {
  const { id: assistantId } = await params;

  if (!assistantId) {
    throw new Error("No Assistant ID provided");
  }

  return (
    <div style={{ 
      width: '100vw', 
      height: '100vh', 
      background: 'transparent',
      margin: 0,
      padding: 0,
      overflow: 'hidden'
    }}>
      <SupportEmbed assistantId={assistantId} />
    </div>
  );
}

export default Page;
