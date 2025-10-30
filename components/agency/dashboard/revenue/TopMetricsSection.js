"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * TopMetricsSection - Displays 5 key revenue metric cards
 * @param {Object} metrics - Object containing all metric values
 * @param {string} metrics.totalRevenue - Total revenue value
 * @param {string} metrics.mrr - Monthly Recurring Revenue
 * @param {string} metrics.netRevenue - Net Revenue
 * @param {string} metrics.agencyNetEarnings - Agency Net Earnings
 * @param {string} metrics.stripeBalance - Stripe Balance
 */
function TopMetricsSection({ metrics = {} }) {
  const {
    totalRevenue = "$121,000",
    mrr = "$31,040",
    netRevenue = "$93,164",
    agencyNetEarnings = "$90,920",
    stripeBalance = "$9,302.12",
  } = metrics;

  const MetricCard = ({ label, value, isStripe = false }) => (
    <div
      className={cn(
        "flex flex-col justify-between p-6 rounded-lg text-white flex-1",
        isStripe
          ? "bg-gradient-to-br from-purple-400 to-purple-300"
          : "bg-transparent"
      )}
    >
      {isStripe && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm font-semibold text-white/90">stripe</span>
        </div>
      )}
      <div className="text-sm font-medium text-white/80 mb-2">{label}</div>
      <div className="text-3xl font-bold text-white">{value}</div>
    </div>
  );

  return (
    <div
      className="w-full flex flex-row gap-4 p-6 rounded-lg"
      // add background image
      style={{
        backgroundImage: "url('/otherAssets/revenueBg.svg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <MetricCard label="Total Revenue" value={totalRevenue} />
      <MetricCard label="MRR" value={mrr} />
      <MetricCard label="Net Revenue" value={netRevenue} />
      <MetricCard label="Agency Net Earnings" value={agencyNetEarnings} />
      <MetricCard label="Balance" value={stripeBalance} isStripe={true} />
    </div>
  );
}

export default TopMetricsSection;

