"use client";

import React, { useEffect, useMemo, useState } from "react";
import TopMetricsSection from "./TopMetricsSection";
import RevenueGrowthChart from "./RevenueGrowthChart";
import LeaderBoardTable from "./LeaderBoardTable";
import TransactionTable from "./TransactionTable";
import PayoutMetricsSection from "./PayoutMetricsSection";
import axios from "axios";
import Apis from "@/components/apis/Apis";
import moment from "moment";

/**
 * AgencyRevenueDashboard - Main dashboard component arranging all revenue-related components
 * @param {Object} props
 * @param {Object} props.topMetrics - Metrics for top metrics section
 * @param {Object} props.revenueChart - Data for revenue growth chart
 * @param {Array} props.leaderboardData - Data for leaderboard table
 * @param {Array} props.transactionData - Data for transaction table
 * @param {Object} props.payoutMetrics - Metrics for payout section
 */
function AgencyRevenueDashboard({ selectedAgency }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [summary, setSummary] = useState(null);
  const [growth, setGrowth] = useState(null);
  const [leaderboard, setLeaderboard] = useState([]);
  const [payouts, setPayouts] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [hasMoreTransactions, setHasMoreTransactions] = useState(true);
  const [txLoadingMore, setTxLoadingMore] = useState(false);

  const [txPage, setTxPage] = useState(1);
  const [txLimit] = useState(50);

  const endDate = useMemo(() => moment().toISOString(), []);
  const startDate = "2025-01-01";

  useEffect(() => {
    const fetchAll = async () => {
      try {
        if (txPage === 1) {
          setLoading(true);
        } else {
          setTxLoadingMore(true);
        }
        setError(null);

        const userStr = localStorage.getItem("User");
        const token = userStr ? JSON.parse(userStr)?.token : null;
        const headers = token
          ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
          : {};

        const summaryReq = axios.get(
          `${Apis.revenueSummary}?startDate=${startDate}&endDate=${encodeURIComponent(endDate)}`,
          { headers }
        );

        const growthReq = axios.get(
          `${Apis.revenueGrowth}?range=thisYear`,
          { headers }
        );

        const leaderboardReq = axios.get(
          `${Apis.revenueLeaderboard}?limit=5&sortBy=revenue&startDate=${startDate}&endDate=${encodeURIComponent(endDate)}`,
          { headers }
        );

        const payoutsReq = axios.get(
          `${Apis.revenuePayoutsSummary}?startDate=${startDate}&endDate=${encodeURIComponent(endDate)}`,
          { headers }
        );

        const txReq = axios.get(
          `${Apis.revenueTransactions}?page=${txPage}&limit=${txLimit}&type=all&status=all&dateFilter=all&sortBy=createdAt&sortOrder=DESC`,
          { headers }
        );

        const [summaryRes, growthRes, leaderboardRes, payoutsRes, txRes] = await Promise.all([
          summaryReq,
          growthReq,
          leaderboardReq,
          payoutsReq,
          txReq,
        ]);

        setSummary(summaryRes?.data?.data || null);
        setGrowth(growthRes?.data?.data || null);
        setLeaderboard(leaderboardRes?.data?.data?.accounts || []);
        setPayouts(payoutsRes?.data?.data || null);
        
        // Handle transactions with infinite scroll accumulation
        const newTransactions = txRes?.data?.data?.transactions || [];
        if (txPage === 1) {
          setTransactions(newTransactions);
        } else {
          setTransactions((prev) => [...prev, ...newTransactions]);
        }
        
        // Check if there are more transactions to load
        const hasMore = newTransactions.length === txLimit;
        setHasMoreTransactions(hasMore);
      } catch (e) {
        console.error("Failed to fetch revenue data", e);
        setError("Failed to load revenue data");
      } finally {
        if (txPage === 1) {
          setLoading(false);
        } else {
          setTxLoadingMore(false);
        }
      }
    };

    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txPage]);

  const topMetrics = useMemo(() => {
    if (!summary) return undefined;
    return {
      totalRevenue: `$${Number(summary.totalRevenue || 0).toLocaleString()}`,
      mrr: `$${Number(summary.mrr || 0).toLocaleString()}`,
      netRevenue: `$${Number(summary.netRevenue || 0).toLocaleString()}`,
      agencyNetEarnings: `$${Number(summary.agencyNetEarnings || 0).toLocaleString()}`,
      stripeBalance: `$${Number(summary.stripeBalance || 0).toLocaleString()}`,
    };
  }, [summary]);

  const revenueChart = useMemo(() => {
    const monthly = growth?.monthlyData || [];
    return {
      data: monthly.map((m) => ({ month: m.month, value: m.revenue || 0 })),
      currentValue: growth?.currentRevenue ? `${growth.currentRevenue}` : "0",
      selectedPeriod: "This Year",
    };
  }, [growth]);

  const leaderboardData = useMemo(() => {
    return (leaderboard || []).map((row, idx) => ({
      rank: row.rank || idx + 1,
      accountName: row.account?.name || `Account ${idx + 1}`,
      accountIcon: String((idx % 9) + 1),
      revenue: `$${Number(row.revenue || 0).toLocaleString()}`,
      mrr: `$${Number(row.mrr || 0).toLocaleString()}`,
      netRevenue: `$${Number(row.netRevenue || 0).toLocaleString()}`,
    }));
  }, [leaderboard]);

  const transactionData = useMemo(() => {
    return (transactions || []).map((t, idx) => ({
      id: t.id,
      subAccount: t.subaccountName || "N/A",
      accountIcon: String((idx % 9) + 1),
      product: t.productName || t.title || "Product",
      type: t.type || "-",
      totalPaid: `$${Number(t.amountPaid || 0).toLocaleString()}`,
      stripeFee: `$${Number(t.stripeFee || 0).toLocaleString()}`,
      platformFee: `$${Number(t.platformFeeAmount || 0).toLocaleString()}`,
      payout: `$${Number(t.agencyNetAmount || 0).toLocaleString()}`,
      date: moment(t.date).format("MM/DD/YYYY"),
      status: (t.status || "completed").toLowerCase().includes("complete")
        ? "success"
        : (t.status || "").toLowerCase().includes("pending")
        ? "pending"
        : (t.status || "").toLowerCase().includes("fail")
        ? "failed"
        : "success",
    }));
  }, [transactions]);

  const payoutMetrics = useMemo(() => {
    if (!payouts) return undefined;
    const refundsCount = Number(payouts.refundsCount || 0) + Number(payouts.chargebacksCount || 0);
    const refundsAmount = (Number(payouts.refundsAmount || 0) + Number(payouts.chargebacksAmount || 0)).toFixed(2);
    let nextPayoutDate = payouts.nextPayoutAt ? moment(payouts.nextPayoutAt).format("MMMM D") : "—";
    let nextPayoutTime = payouts.nextPayoutAt ? moment(payouts.nextPayoutAt).format("h:mmA") : "—";
    return {
      nextPayoutDate,
      nextPayoutTime,
      lifetimePayouts: `$${Number(payouts.lifetimePayouts || 0).toLocaleString()}`,
      avgTransactionValue: `$${Number(payouts.avgTransactionValue || 0).toLocaleString()}`,
      refundsCount: `${refundsCount}`,
      refundsAmount: `$${Number(refundsAmount).toLocaleString()}`,
    };
  }, [payouts]);
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
            hasMore={hasMoreTransactions}
            loadingMore={txLoadingMore}
            onLoadMore={() => {
              if (!txLoadingMore && hasMoreTransactions) {
                setTxPage((prev) => prev + 1);
              }
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

