"use client";

import React from "react";
import TopMetricsSection from "./TopMetricsSection";
import RevenueGrowthChart from "./RevenueGrowthChart";
import LeaderBoardTable from "./LeaderBoardTable";
import TransactionTable from "./TransactionTable";
import PayoutMetricsSection from "./PayoutMetricsSection";

/**
 * AgencyRevenueDashboard - Main dashboard component arranging all revenue-related components
 * @param {Object} props
 * @param {Object} props.topMetrics - Metrics for top metrics section
 * @param {Object} props.revenueChart - Data for revenue growth chart
 * @param {Array} props.leaderboardData - Data for leaderboard table
 * @param {Array} props.transactionData - Data for transaction table
 * @param {Object} props.payoutMetrics - Metrics for payout section
 */
function AgencyRevenueDashboard({
  topMetrics,
  revenueChart,
  leaderboardData,
  transactionData,
  payoutMetrics,
}) {
  return (
    <div
      className="flex flex-col items-center justify-start w-full h-[88vh] bg-gray-50"
      style={{ overflow: "auto", scrollbarWidth: "none", paddingTop: "2rem" }}
    >
      <div className="flex flex-col items-start w-11/12 gap-6 pb-6">
        {/* Top Metrics Section */}
        <div className="w-full">
          <TopMetricsSection metrics={topMetrics} />
        </div>

        {/* Revenue Growth Chart and LeaderBoard - Side by Side */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Revenue Growth Chart - Takes up 8 columns */}
          <div className="lg:col-span-8">
            <RevenueGrowthChart
              data={revenueChart?.data}
              currentValue={revenueChart?.currentValue}
              selectedPeriod={revenueChart?.selectedPeriod}
              onPeriodChange={revenueChart?.onPeriodChange}
            />
          </div>

          {/* LeaderBoard Table - Takes up 4 columns */}
          <div className="lg:col-span-4">
            <LeaderBoardTable
              data={leaderboardData}
              onSeeAll={() => {
                // Handle see all action
                console.log("See all leaderboard");
              }}
            />
          </div>
        </div>

        {/* Transaction Table - Full Width */}
        <div className="w-full">
          <TransactionTable
            data={transactionData}
            onSearch={(query) => {
              // Handle search
              console.log("Search query:", query);
            }}
          />
        </div>

        {/* Payout Metrics Section - Full Width */}
        <div className="w-full">
          <PayoutMetricsSection metrics={payoutMetrics} />
        </div>
      </div>
    </div>
  );
}

export default AgencyRevenueDashboard;

