"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

/**
 * PayoutMetricsSection - Displays 4 payout-related metric cards
 * @param {Object} props
 * @param {Object} props.metrics - Object containing payout metrics
 * @param {string} props.metrics.nextPayoutDate - Next payout date
 * @param {string} props.metrics.nextPayoutTime - Next payout time
 * @param {string} props.metrics.lifetimePayouts - Lifetime payouts value
 * @param {string} props.metrics.avgTransactionValue - Average transaction value
 * @param {string} props.metrics.refundsCount - Number of refunds
 * @param {string} props.metrics.refundsAmount - Total refunds amount
 */
function PayoutMetricsSection({ metrics = {} }) {
  const {
    nextPayoutDate = "March 12",
    nextPayoutTime = "12:04PM",
    lifetimePayouts = "$9,302.12",
    avgTransactionValue = "$9,302.12",
    clv = "$0",
    refundsCount = "12",
    refundsAmount = "$40,902",
  } = metrics;

  const MetricCard = ({ icon, label, value, iconComponent }) => (
    <Card className="bg-white rounded-lg border-2 border-white shadow-sm">
      <CardContent className="p-6">
        <div className="flex flex-col gap-4">
          {/* Icon */}
          {iconComponent && (
            <div className="flex items-center justify-start">
              {iconComponent}
            </div>
          )}
          
          {/* Label */}
          <div className="text-sm font-medium text-gray-600">{label}</div>
          
          {/* Value - can be string or React element */}
          <div className="text-2xl font-bold text-gray-900">
            {typeof value === 'string' ? value : value}
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Icon components
  const CalendarIcon = () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-purple-600"
    >
      <path
        d="M19 4H5C3.89543 4 3 4.89543 3 6V20C3 21.1046 3.89543 22 5 22H19C20.1046 22 21 21.1046 21 20V6C21 4.89543 20.1046 4 19 4Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 2V6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 2V6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 10H21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const HourglassIcon = () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-purple-600"
    >
      <path
        d="M6 2H18V6L12 12L6 6V2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M6 22H18V18L12 12L6 18V22Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const ChartIcon = () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-purple-600"
    >
      <path
        d="M3 3V21H21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7 16L12 11L16 15L21 10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21 10H16V15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  const RefreshIcon = () => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-purple-600"
    >
      <path
        d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M21 3V9H15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <div className="w-full grid grid-cols-5 gap-4">
      <MetricCard
        icon="calendar"
        label="Next Payout Date & Time"
        value={
          <div className="flex flex-col">
            <span>{nextPayoutDate}</span>
            {/* <span className="text-lg font-normal text-gray-600">
              {nextPayoutTime}
            </span> */}
          </div>
        }
        iconComponent={<CalendarIcon />}
      />

      <MetricCard
        icon="hourglass"
        label="Lifetime Payouts"
        value={lifetimePayouts}
        iconComponent={<HourglassIcon />}
      />

      <MetricCard
        icon="chart"
        label="Avg. Transaction Value (ATV)"
        value={avgTransactionValue}
        iconComponent={<ChartIcon />}
      />

      <MetricCard
        icon="chart"
        label="Customer Lifetime Value (CLV)"
        value={clv}
        iconComponent={<ChartIcon />}
      />

      <MetricCard
        icon="refresh"
        label="Refunds/Charge backs"
        value={`${refundsCount} (${refundsAmount})`}
        iconComponent={<RefreshIcon />}
      />
    </div>
  );
}

export default PayoutMetricsSection;

