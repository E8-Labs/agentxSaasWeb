// app/embed/support/[id]/page.jsx or page.tsx

import { SupportEmbed } from "./support";

async function Page({ params }) {
  const { id: assistantId } = await params;

  if (!assistantId) {
    throw new Error("No Assistant ID provided");
  }

  return (
    <div>
      <SupportEmbed assistantId={assistantId} />
    </div>
  );
}

export default Page;
