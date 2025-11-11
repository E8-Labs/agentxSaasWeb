"use client";

import React, { useEffect, useMemo, useState } from "react";
import TopMetricsSection from "./TopMetricsSection";
import RevenueGrowthChart from "./RevenueGrowthChart";
import LeaderBoardTable from "./LeaderBoardTable";
import TransactionTable from "./TransactionTable";
import PayoutMetricsSection from "./PayoutMetricsSection";
import SubscriptionGraphsSection from "./SubscriptionGraphsSection";
import axios from "axios";
import Apis from "@/components/apis/Apis";
import moment from "moment";
import AgencyDashboard from "../AgencyDashboard";
import AgencyDashboardDefaultUI from "../AgencyDashboardDefaultUI";
import { CircularProgress } from "@mui/material";
import { formatFractional2 } from "../../plan/AgencyUtilities";

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
  const [subscriptionData, setSubscriptionData] = useState(null);

  const [txPage, setTxPage] = useState(1);
  const [txLimit] = useState(50);
  const [txFilters, setTxFilters] = useState({
    type: 'all',
    status: 'all',
    dateFilter: 'all',
    startDate: '',
    endDate: ''
  });

  // Revenue growth filter state
  const [revenueGrowthFilter, setRevenueGrowthFilter] = useState("Last 30 Days");
  const [revenueGrowthStartDate, setRevenueGrowthStartDate] = useState(null);
  const [revenueGrowthEndDate, setRevenueGrowthEndDate] = useState(null);

  const endDate = useMemo(() => moment().toISOString(), []);
  const startDate = "2025-01-01";

  // Helper function to map filter text to API parameters
  const getRevenueGrowthParams = (filterText, startDateParam, endDateParam) => {
    const params = new URLSearchParams();
    
    if (filterText === "Custom Range" && startDateParam && endDateParam) {
      params.set("dateFilter", "customRange");
      params.set("startDate", startDateParam);
      params.set("endDate", endDateParam);
    } else if (filterText === "All Time" && startDateParam && endDateParam) {
      params.set("dateFilter", "customRange");
      params.set("startDate", startDateParam);
      params.set("endDate", endDateParam);
    } else {
      switch (filterText) {
        case "Last 7 Days":
          params.set("dateFilter", "last7Days");
          break;
        case "Last 30 Days":
          params.set("dateFilter", "last30Days");
          break;
        case "This Year":
          params.set("range", "thisYear");
          break;
        default:
          params.set("dateFilter", "last30Days");
      }
    }
    
    return params.toString();
  };

  // Fetch revenue growth data based on filter
  const fetchRevenueGrowth = async (filter, startDateParam, endDateParam) => {
    try {
      const userStr = localStorage.getItem("User");
      const token = userStr ? JSON.parse(userStr)?.token : null;
      const headers = token
        ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
        : {};

      const params = getRevenueGrowthParams(filter, startDateParam, endDateParam);
      const growthRes = await axios.get(
        `${Apis.revenueGrowth}?${params}`,
        { headers }
      );

      setGrowth(growthRes?.data?.data || null);
    } catch (e) {
      console.error("Failed to fetch revenue growth data", e);
    }
  };

  // Handle revenue growth filter change
  const handleRevenueGrowthFilterChange = (newFilter, startDateParam, endDateParam) => {
    setRevenueGrowthFilter(newFilter);
    setRevenueGrowthStartDate(startDateParam);
    setRevenueGrowthEndDate(endDateParam);
    fetchRevenueGrowth(newFilter, startDateParam, endDateParam);
  };

  // Fetch initial data (summary, growth, leaderboard, payouts, subscriptions)
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setLoading(true);
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

        const leaderboardReq = axios.get(
          `${Apis.revenueLeaderboard}?limit=5&sortBy=revenue&startDate=${startDate}&endDate=${encodeURIComponent(endDate)}`,
          { headers }
        );

        const payoutsReq = axios.get(
          `${Apis.revenuePayoutsSummary}?startDate=${startDate}&endDate=${encodeURIComponent(endDate)}`,
          { headers }
        );

        const subscriptionReq = axios.get(
          `${Apis.AdminAnalytics}?startDate=${startDate}&endDate=${encodeURIComponent(endDate)}${selectedAgency ? `&userId=${selectedAgency.id}` : ''}`,
          { headers }
        );

        const [summaryRes, leaderboardRes, payoutsRes, subscriptionRes] = await Promise.all([
          summaryReq,
          leaderboardReq,
          payoutsReq,
          subscriptionReq,
        ]);

        setSummary(summaryRes?.data?.data || null);
        setLeaderboard(leaderboardRes?.data?.data?.accounts || []);
        setPayouts(payoutsRes?.data?.data || null);
        setSubscriptionData(subscriptionRes?.data?.data || null);

        // Fetch initial revenue growth with default filter
        await fetchRevenueGrowth(revenueGrowthFilter, null, null);
      } catch (e) {
        console.error("Failed to fetch revenue data", e);
        setError("Failed to load revenue data");
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch transactions separately (responds to filters and pagination)
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        // Show loading only for first page, otherwise show "loading more"
        if (txPage === 1) {
          setLoading(true);
        } else {
          setTxLoadingMore(true);
        }

        const userStr = localStorage.getItem("User");
        const token = userStr ? JSON.parse(userStr)?.token : null;
        const headers = token
          ? { Authorization: `Bearer ${token}`, "Content-Type": "application/json" }
          : {};

        // Build transaction query parameters
        const txParams = new URLSearchParams({
          page: txPage,
          limit: txLimit,
          sortBy: 'createdAt',
          sortOrder: 'DESC',
          type: txFilters.type,
          status: txFilters.status,
          dateFilter: txFilters.dateFilter
        });

        // Add date range if custom range is selected
        if (txFilters.dateFilter === 'customRange') {
          if (txFilters.startDate) {
            txParams.set('startDate', moment(txFilters.startDate, 'MM/DD/YYYY').format('YYYY-MM-DD'));
          }
          if (txFilters.endDate) {
            txParams.set('endDate', moment(txFilters.endDate, 'MM/DD/YYYY').format('YYYY-MM-DD'));
          }
        }

        const txRes = await axios.get(
          `${Apis.revenueTransactions}?${txParams.toString()}`,
          { headers }
        );

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
        console.error("Failed to fetch transactions", e);
      } finally {
        if (txPage === 1) {
          setLoading(false);
        } else {
          setTxLoadingMore(false);
        }
      }
    };

    fetchTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [txPage, txFilters]);

  const handleTxFilterChange = (key, value) => {
    setTxFilters(prev => ({ ...prev, [key]: value }));
    setTxPage(1);
    setTransactions([]);
  };

  const topMetrics = useMemo(() => {
    if (!summary) {
      return {
        totalRevenue: "-",
        arr: "-",
        mrr: "-",
        netRevenue: "-",
        agencyNetEarnings: "-",
        stripeBalance: "-",
      };
    }
    return {
      totalRevenue: `$${Number(summary.totalRevenue || 0).toLocaleString()}`,
      arr: subscriptionData?.arr ? `$${Number(subscriptionData.arr || 0).toLocaleString()}` : "-",
      mrr: `$${Number(summary.mrr || 0).toLocaleString()}`,
      netRevenue: `$${Number(summary.netRevenue || 0).toLocaleString()}`,
      agencyNetEarnings: `$${Number(summary.agencyNetEarnings || 0).toLocaleString()}`,
      stripeBalance: `$${Number(summary.stripeBalance || 0).toLocaleString()}`,
    };
  }, [summary, subscriptionData]);

  const revenueChart = useMemo(() => {
    if (!growth) {
      return {
        data: [],
        currentValue: "-",
        selectedPeriod: revenueGrowthFilter,
      };
    }
    const monthly = growth?.monthlyData || [];
    return {
      data: monthly.map((m) => ({ month: m.month, value: m.revenue || 0 })),
      currentValue: growth?.currentRevenue ? `${growth.currentRevenue}` : "-",
      selectedPeriod: revenueGrowthFilter,
    };
  }, [growth, revenueGrowthFilter]);

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
      title: t.title || t.productName || "Transaction",
      subAccount: t.subaccountName || "N/A",
      accountIcon: String((idx % 9) + 1),
      product: t.productName || t.title || "Product",
      type: t.type || "-",
      totalPaid: `$${formatFractional2(Number(t.amountPaid || 0))}`,
      stripeFee: `$${formatFractional2(Number(t.stripeFee || 0))}`,
      platformFee: `$${formatFractional2(Number(t.platformFeeAmount || 0))}`,
      serviceCost: `$${formatFractional2(Number(t.serviceCost || 0))}`,
      agentXShare: `$${formatFractional2(Number(t.agentXShare || 0))}`,
      payout: `$${formatFractional2(Number(t.agencyNetAmount || 0))}`,
      date: moment(t.date).format("MM/DD/YYYY"),
      onHold: t.onHold || false,
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
    if (!payouts) {
      return {
        nextPayoutDate: "-",
        nextPayoutTime: "-",
        lifetimePayouts: "-",
        avgTransactionValue: "-",
        clv: "-",
        refundsCount: "-",
        refundsAmount: "-",
      };
    }
    const refundsCount = Number(payouts.refundsCount || 0) + Number(payouts.chargebacksCount || 0);
    const refundsAmount = (Number(payouts.refundsAmount || 0) + Number(payouts.chargebacksAmount || 0)).toFixed(2);
    let nextPayoutDate = payouts.nextPayoutAt ? moment(payouts.nextPayoutAt).format("MMMM D") : "-";
    let nextPayoutTime = payouts.nextPayoutAt ? moment(payouts.nextPayoutAt).format("h:mmA") : "-";
    return {
      nextPayoutDate,
      nextPayoutTime,
      lifetimePayouts: `$${Number(payouts.lifetimePayouts || 0).toLocaleString()}`,
      avgTransactionValue: `$${Number(payouts.avgTransactionValue || 0).toLocaleString()}`,
      clv: subscriptionData?.clv ? `$${Number(subscriptionData.clv || 0).toLocaleString()}` : "-",
      refundsCount: `${refundsCount}`,
      refundsAmount: `$${Number(refundsAmount).toLocaleString()}`,
    };
  }, [payouts, subscriptionData]);
  return (
    loading ? (
      <div className="flex flex-col justify-center items-center h-[90svh]">
        <CircularProgress size={45} />
      </div>
    ) : (

      <div
        className="flex flex-col items-center justify-start w-full h-[88vh] bg-gray-50"
        style={{ overflow: "auto", scrollbarWidth: "none", paddingTop: "2rem" }}
      >
        {
          subscriptionData ? (

            <div className="flex flex-col items-start w-11/12 gap-6 pb-6">
              {/* Top Metrics Section */}
              <div className="w-full">
                <TopMetricsSection metrics={topMetrics} />
              </div>

              {/* Payout Metrics Section - Full Width */}
              <div className="w-full">
                <PayoutMetricsSection metrics={payoutMetrics} />
              </div>

              {/* Revenue Growth Chart and LeaderBoard - Side by Side */}
              <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Revenue Growth Chart - Takes up 7 columns */}
                <div className="lg:col-span-7">
                  <RevenueGrowthChart
                    data={revenueChart?.data}
                    currentValue={revenueChart?.currentValue}
                    selectedPeriod={revenueChart?.selectedPeriod}
                    onPeriodChange={handleRevenueGrowthFilterChange}
                  />
                </div>

                {/* LeaderBoard Table - Takes up 5 columns */}
                <div className="lg:col-span-5">
                  <LeaderBoardTable
                    data={leaderboardData}
                    onSeeAll={() => {
                      // Handle see all action
                      console.log("See all leaderboard");
                    }}
                  />
                </div>
              </div>

              {/* Subscription Graphs Section - Full Width */}
              <div className="w-full">
                <SubscriptionGraphsSection
                  subscriptionData={subscriptionData}
                  fetchOwnData={true}
                  userId={selectedAgency?.id}
                />
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
                  filters={txFilters}
                  onFilterChange={handleTxFilterChange}
                />
              </div>

            </div>

          ) : (
            <AgencyDashboardDefaultUI />
          )
        }
      </div>
    ));
}

export default AgencyRevenueDashboard;

