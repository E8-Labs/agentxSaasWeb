"use client";

import React from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";

/**
 * TopMetricsSection - Displays 6 key revenue metric cards
 * @param {Object} metrics - Object containing all metric values
 * @param {string} metrics.totalRevenue - Total revenue value
 * @param {string} metrics.arr - Annual Recurring Revenue
 * @param {string} metrics.mrr - Monthly Recurring Revenue
 * @param {string} metrics.netRevenue - Net Revenue
 * @param {string} metrics.agencyNetEarnings - Agency Net Earnings
 * @param {string} metrics.stripeBalance - Stripe Balance
 */
function TopMetricsSection({ metrics = {} }) {
  const {
    totalRevenue = "$121,000",
    arr = "$0",
    mrr = "$31,040",
    netRevenue = "$93,164",
    agencyNetEarnings = "$90,920",
    stripeBalance = "$9,302.12",
  } = metrics;

  const MetricCard = ({ label, value, isStripe = false }) => (
    <div
      className={cn(
        "flex flex-col justify-between p-6 rounded-lg flex-shrink-0",
        isStripe
          ? "bg-white text-gray-900"
          : "bg-transparent text-white"
      )}
      style={{ minWidth: "200px" }}
    >
      {isStripe && (
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-semibold text-purple-600">stripe</span>
        </div>
      )}
      <div className={cn(
        "text-sm font-medium mb-2",
        isStripe ? "text-gray-600" : "text-white/80"
      )}>{label}</div>
      <div className={cn(
        "text-3xl font-bold",
        isStripe ? "text-gray-900" : "text-white"
      )}>{value}</div>
    </div>
  );

  return (
    <div
      className="w-full overflow-x-auto rounded-lg"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
    >
      <div
        className="flex flex-row gap-4 p-6 rounded-lg"
        style={{
          backgroundImage: "url('/otherAssets/revenueBg.svg')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          minWidth: "fit-content",
        }}
      >
        <MetricCard label="Total Revenue" value={totalRevenue} />
        <MetricCard label="ARR" value={arr} />
        <MetricCard label="MRR" value={mrr} />
        <MetricCard label="Net Revenue" value={netRevenue} />
        <MetricCard label="Agency Net Earnings" value={agencyNetEarnings} />
        <MetricCard label="Balance" value={stripeBalance} isStripe={true} />
      </div>
      <style jsx>{`
        div::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </div>
  );
}

export default TopMetricsSection;

