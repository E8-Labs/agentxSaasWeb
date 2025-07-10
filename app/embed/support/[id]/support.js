"use client";

import { SupportWidget } from "@/components/askSky/support-widget";


export function SupportEmbed({ assistantId,isEmbed }) {
  return <SupportWidget assistantId={assistantId} isEmbed = {isEmbed} />;
}
