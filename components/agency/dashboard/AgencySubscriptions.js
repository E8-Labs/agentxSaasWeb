"use client";

import React, { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@radix-ui/react-dropdown-menu";
import Image from "next/image";
import CloseBtn from "@/components/globalExtras/CloseBtn";

import {
  XAxis,
  YAxis,
  Tooltip,
  LineChart,
  Line,
  Bar,
  BarChart,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { SetMealRounded } from "@mui/icons-material";
import { Box, Modal } from "@mui/material";
import { CalendarPicker } from "@/components/admin/users/CalendarPicker";
import { PersistanceKeys } from "@/constants/Constants";
import axios from "axios";
import Apis from "@/components/apis/Apis";
import moment from "moment";

import AgencyDashboardDefaultUI from "./AgencyDashboardDefaultUI";

function AgencySubscriptions({
  selectedAgency
}) {
  // const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  let manu = [
    {
      id: 1,
      name: "Trail Plan",
    },
    {
      id: 2,
      name: "From $45",
    },
  ];

  let currantDate = new Date();

  const [selectedManu, setSelectedMau] = useState(manu[0]);
  const [analyticData, setAnalyticData] = useState(null);
  //test code
  const [testPlans, setTestPlans] = useState([]);

  const [showCustomRangePopup, setShowCustomRangePopup] = useState(null);

  const [subscriptionStartDate, setSubscriptionStartDate] =
    useState("2025-01-01");
  const [subscriptionEndDate, setSubscriptionEndDate] = useState(
    moment(currantDate).format("YYYY-MM-DD")
  );
  const [selectedSubRange, setSelectedSubRange] = useState("All Time");
  const [dateFilter, setDateFilter] = useState(null); // null, 'last7Days', 'last30Days', 'customRange'

  const [selectedPlanRange, setSelectedPlanRange] = useState("All Time");
  const [planStartDate, setPlanStartDate] = useState("2025-01-01");
  const [planEndDate, setPlanEndDate] = useState(
    moment(currantDate).format("YYYY-MM-DD")
  );

  const [upgradeStartDate, setUpgradeStartDate] = useState("2025-01-01");
  const [upgradeEndDate, setUpgradeEndDate] = useState(
    moment(currantDate).format("YYYY-MM-DD")
  );
  const [selectedUpgradeRange, setSelectedUpgradeRange] = useState("All Time");

  const [showCustomRange, setShowCustomRange] = useState(false)

  // Month mapping from short to full name
  const monthMap = {
    Jan: "January",
    Feb: "February",
    Mar: "March",
    Apr: "April",
    May: "May",
    Jun: "June",
    Jul: "July",
    Aug: "August",
    Sep: "September",
    Oct: "October",
    Nov: "November",
    Dec: "December",
  };


  // Define colors for each plan
  const colors = ["#8E24AA", "#FF6600", "#402FFF", "#FF2D2D"];


  // Extract months dynamically from API response
  let months = analyticData
    ? Object.keys(analyticData?.planSubscriptionStats?.Trial || {})
    : [];

  // Transform API data into chart format
  const subscriptionChartData = (() => {
    if (!analyticData?.planSubscriptionStats) return [];

    // Extract all dates
    const allDates = Object.keys(
      Object.values(analyticData.planSubscriptionStats)[0] || {}
    );

    return allDates.map((dateKey) => {
      const formattedDate = moment(dateKey, "MMM DD, YY").format("MMM DD");

      const entry = { month: formattedDate };

      // Loop through each dynamic plan title
      Object.keys(analyticData.planSubscriptionStats).forEach((planName) => {
        entry[planName] =
          analyticData.planSubscriptionStats[planName]?.[dateKey] || 0;
      });

      return entry;
    });
  })();

  const totalNewSubscriptions = subscriptionChartData.reduce((total, monthData) => {
    return total + (monthData.Trial || 0) + (monthData.Plan30 || 0) + (monthData.Plan120 || 0) + (monthData.Plan360 || 0) + (monthData.Plan720 || 0);
  }, 0);

  //console.log;

  // Mapping Plan names to UI labels
  const planMapping = {
    Plan30: "test",
    Plan120: "Plan120",
    Plan360: "Plan360",
    Plan720: "Plan720",
  };

  // const [planMapping, setPlanMapping] = useState(null);

  // Transform data into required format
  const planChartData = Object.keys(analyticData?.activePlansUsers || {}).map(
    (planName, index) => ({
      name: planName || "",
      value: analyticData.activePlansUsers[planName] || 0,
      color: colors[index % colors.length],
    })
  );

  // Calculate max value for plans chart to set Y-axis domain with increments of 1
  const maxPlanValue = planChartData.length > 0
    ? Math.max(...planChartData.map(d => d.value))
    : 0;



  const reActivationChartData = Object.keys(analyticData?.reactivationsByPlan || {}).map(
    (planName, index) => ({
      name: planName || "",
      value: analyticData.reactivationsByPlan[planName] || 0,
      color: colors[index % colors.length],
    })
  );

  // Calculate max value for reactivation chart to set Y-axis domain with increments of 1
  const maxReactivationValue = reActivationChartData.length > 0
    ? Math.max(...reActivationChartData.map(d => d.value))
    : 0;

  const cancellationsRateData = Object.keys(analyticData?.subscription?.cancellations || {}).map(
    (planName, index) => ({
      name: planName,
      value: analyticData.subscription.cancellations[planName] || 0,
      color: colors[index % colors.length],
    })
  );


  // Transform data into required format

  function selecteUpgradeRateMenu() {
    if (selectedManu.id == 1) {
      return analyticData?.subscription?.upgradeBreakdown
    } else {
      analyticData?.plan30Upgradesdown
    }
  }
  const UpgateRateData = analyticData?.subscription?.upgradeBreakdown ?
    Object.keys(analyticData?.subscription?.upgradeBreakdown).map(
      (key, index) => ({
        name: key,
        value: analyticData.subscription.upgradeBreakdown[key] || 0,
        color: colors[index % colors.length], // Assign color based on index
      })
    )
    : [];

  const UpgateRateData2 = analyticData?.plan30Upgrades ?
    Object.keys(analyticData?.plan30Upgrades).map(
      (key, index) => ({
        name: key,
        value: analyticData.subscription.upgradeBreakdown[key] || 0,
        color: colors[index % colors.length], // Assign color based on index
      })
    )
    : [];

  useEffect(() => {
    getAdminAnalytics();
  }, []);

  const getAdminAnalytics = async (filterType = null) => {
    try {
      const data = localStorage.getItem("User");

      if (data) {
        let u = JSON.parse(data);

        // Call both APIs: AdminAnalytics for all data, and new API for filtered subscription stats
        let analyticsPath = Apis.AdminAnalytics;
        if (selectedAgency) {
          analyticsPath = `${analyticsPath}?userId=${selectedAgency.id}`;
        }

        const [analyticsRes, subscriptionsRes] = await Promise.all([
          // Get all analytics data
          axios.get(analyticsPath, {
            headers: {
              "Authorization": "Bearer " + u.token,
              "Content-Type": "application/json",
            },
          }),
          // Get filtered subscription stats
          (async () => {
            let path = Apis.getPlanSubscriptions;
            const params = new URLSearchParams();

            // Set dateFilter
            if (filterType === 'last7Days') {
              params.set('dateFilter', 'last7Days');
              setDateFilter('last7Days');
            } else if (filterType === 'last30Days') {
              params.set('dateFilter', 'last30Days');
              setDateFilter('last30Days');
            } else if (filterType === 'customRange') {
              params.set('dateFilter', 'customRange');
              params.set('startDate', subscriptionStartDate);
              params.set('endDate', subscriptionEndDate);
              setDateFilter('customRange');
            } else {
              // All Time - use last30Days as default
              params.set('dateFilter', 'last30Days');
              setDateFilter(null);
            }

            // Add userId if selectedAgency is provided
            if (selectedAgency) {
              params.set('userId', selectedAgency.id);
            }

            const queryString = params.toString();
            const fullPath = queryString ? `${path}?${queryString}` : path;

            return axios.get(fullPath, {
              headers: {
                "Authorization": "Bearer " + u.token,
                "Content-Type": "application/json",
              },
            });
          })()
        ]);

        // Merge data from both APIs
        if (analyticsRes.data?.status && subscriptionsRes.data?.status) {
          const analyticsData = analyticsRes.data.data;
          const subscriptionsData = subscriptionsRes.data.data;
          
          setAnalyticData({
            ...analyticsData,
            planSubscriptionStats: subscriptionsData.planSubscriptionStats || analyticsData.planSubscriptionStats || {},
            newSubscriptions: subscriptionsData.newSubscriptions || analyticsData.newSubscriptions || 0,
            totalSubscriptions: subscriptionsData.totalSubscriptions || analyticsData.totalSubscriptions || 0,
          });
          
          const planStats = subscriptionsData.planSubscriptionStats || analyticsData.planSubscriptionStats || {};
          const planTitles = Object.keys(planStats);
          setTestPlans(planTitles);
          console.log("Plan Titles:", planTitles);
        }
      }
    } catch (e) {
      console.log("Error occurred in analytics api:", e);
    }
  };

  const handleStartDateSelect = (date) => {
    //console.log;

    let formatedDate = moment(date).format("YYYY-MM-DD");

    if (showCustomRangePopup === "Subscription") {
      setSubscriptionStartDate(formatedDate);
    } else if (showCustomRangePopup === "Subscription") {
      setPlanStartDate(formatedDate);
    } else {
      setUpgradeStartDate(formatedDate);
    }
  };

  const handleEndDateSelect = (date) => {
    //console.log;

    let formatedDate = moment(date).format("YYYY-MM-DD");

    if (showCustomRangePopup === "Subscription") {
      setSubscriptionEndDate(formatedDate);
    } else if (showCustomRangePopup === "Subscription") {
      setPlanEndDate(formatedDate);
    } else {
      setUpgradeEndDate(formatedDate);
    }
  };

  return (
    analyticData?.totalSubscriptions ? (
      <div
        className="flex flex-col items-center justify-center w-full h-[88vh]"
        style={{ overflow: "auto", scrollbarWidth: "none", paddingTop: "4rem" }}
      >
        <div className="flex flex-col items-start w-11/12 mt-2 gap-3">

          {/* Show filters here in a row*/}
          {
            showCustomRange &&
            <div className="flex flex-row items-center gap-4 flex-shrink-0 overflow-auto"
              style={{ scrollbarColor: "#00000000", scrollbarWidth: "none" }}
            >
              <div
                className="px-4 py-2 bg-[#402FFF10] text-purple flex-shrink-0 rounded-[25px] flex flex-row items-center gap-2"
                style={{ fontWeight: "500", fontSize: 15 }}
              >
                {`${moment(subscriptionStartDate).format("MM-DD-YYYY")} - ${moment(subscriptionEndDate).format("MM-DD-YYYY")}`}

                {/* Remove Filter Button */}
                <button
                  className="outline-none"
                  onClick={() => {
                    setSubscriptionEndDate(moment(currantDate).format("YYYY-MM-DD"))
                    setSubscriptionStartDate("2025-01-01")
                    setSelectedSubRange("All Time")
                    getAdminAnalytics(null)
                    setShowCustomRange(false)
                  }}
                >
                  <Image
                    src={"/otherAssets/crossIcon.png"}
                    height={20}
                    width={20}
                    alt="Remove Filter"
                  />
                </button>
              </div>
            </div>
          }

          <div className="flex w-full flex-row items-start gap-3">
            <div className="flex flex-col w-8/12">
              <div
                style={{ border: "2px solid white" }}
                className="flex w-full flex-col items-center bg-[#ffffff68] rounded-lg p-4"
              >
                <div className="flex flex-col w-full items-start">
                  <div className="flex flex-row items-center gap-4 justify-start">
                    <div
                      style={{
                        fontSize: 18,
                        fontWeight: "700",
                        color: "#0E0E0E",
                        whiteSpace: "nowrap",
                      }}
                    >
                      New Subscriptions{" "}
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: "500",
                          color: "#00000060",
                        }}
                      >
                        Number of new paid users over a period of time
                      </span>
                    </div>
                    {/* Range date Dropdown */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button
                          className="
                px-4 py-1 border border-[#EEE7FF] rounded-full text-sm font-medium text-gray-800 hover:bg-gray-100
                flex flex-row items-center gap-1
              "
                        >
                          <p>
                            {selectedSubRange
                              ? selectedSubRange
                              : "Select Range"}
                          </p>
                          <Image
                            src={"/svgIcons/downArrow.svg"}
                            height={20}
                            width={24}
                            alt="*"
                          />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        className="bg-white border rounded-lg shadow-md"
                        style={{ minWidth: "8rem", width: "100%" }} // Match button width
                      >
                        <DropdownMenuGroup style={{ cursor: "pointer" }}>
                          <DropdownMenuItem
                            className="hover:bg-gray-100 px-3"
                            onClick={() => {
                              setSubscriptionEndDate(
                                moment(currantDate).format("YYYY-MM-DD")
                              );
                              setSubscriptionStartDate("2025-01-01");
                              setSelectedSubRange("All Time");
                              getAdminAnalytics(null);
                              setShowCustomRange(false);
                            }}
                          >
                            All Time
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="hover:bg-gray-100 px-3"
                            onClick={() => {
                              setSelectedSubRange("Last 7 Days");
                              getAdminAnalytics('last7Days');
                              setShowCustomRange(false);
                            }}
                          >
                            Last 7 Days
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className="hover:bg-gray-100 px-3"
                            onClick={() => {
                              setSelectedSubRange("Last 30 Days");
                              getAdminAnalytics('last30Days');
                              setShowCustomRange(false);
                            }}
                          >
                            Last 30 Days
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              setShowCustomRangePopup("Subscription");
                              setSelectedSubRange("Custom Range");
                            }}
                            className="hover:bg-gray-100 px-3"
                          >
                            Custom Range
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="w-full flex flex-row items-start justify-between">
                    <div className="flex flex-col items-center">
                      <div
                        style={{ fontSize: 48, fontWeight: "300", color: "#000" }}
                      >
                        {analyticData?.newSubscriptions}
                      </div>
                    </div>

                    <div className="w-full flex flex-row items-center gap-4 justify-end">
                    </div>
                  </div>
                </div>

                <div className="flex w-full flex-row items-center gap-8 mt-5 overflow-x-auto">
                  {Object.keys(analyticData?.planSubscriptionStats || {}).map((planName, index) => (
                    <div
                      key={planName}
                      className="flex flex-row items-center gap-2 flex-shrink-0"
                    >
                      <div
                        className="h-[13px] w-[13px] rounded-full shadow-md border border-white"
                        style={{ backgroundColor: colors[index % colors.length] }}
                      ></div>
                      <p style={{ fontSize: 15, fontWeight: "500", color: "#000" }}>
                        {planName}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex w-full">
                  <LineChart
                    width={800}
                    height={317}
                    data={subscriptionChartData}
                    margin={{
                      top: 20,
                      right: 20,
                      left: 20,
                      bottom: 20,
                    }}
                  >
                    <XAxis
                      dataKey="month"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                      tickFormatter={(value) => moment(value, "MMM DD").format("MMM DD")}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickMargin={10}
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: "8px",
                        backgroundColor: "white",
                        border: "1px solid #e5e7eb",
                        padding: "10px",
                      }}
                      itemStyle={{ color: "#111827" }}
                      labelStyle={{ color: "#6b7280" }}
                    />

                    {Object.keys(analyticData?.planSubscriptionStats || {}).length > 0 ? (
                      Object.keys(analyticData?.planSubscriptionStats || {}).map((planName, index) => (
                        <Line
                          key={planName}
                          type="monotone"
                          dataKey={planName}
                          stroke={colors[index % colors.length] || "#000"}
                          strokeWidth={2}
                          dot={false}
                        />
                      ))
                    ) : (
                      <Line
                        type="monotone"
                        dataKey="fallback"
                        stroke="#ccc"
                        strokeWidth={2}
                        dot={false}
                        isAnimationActive={false}
                        data={[
                          { month: moment().subtract(1, "month").format("MMM DD"), fallback: 0 },
                          { month: moment().format("MMM DD"), fallback: 0 }
                        ]}
                      />
                    )}

                  </LineChart>
                </div>

              </div>

              <div className="flex flex-row gap-3 w-full -ml-3 mt-3">
                <div
                  style={{ border: "2px solid white" }}
                  className="
                  flex w-6/12 flex-col items-center bg-[#ffffff68] rounded-lg p-4"
                >
                  <div className="w-full flex flex-col items-center px-5 border">
                    <div className="flex flex-row items-center justify-between w-full">
                      <div
                        style={{ fontSize: 18, fontWeight: "700", color: "#000" }}
                      >
                        Plans
                      </div>



                    </div>
                    {
                      planChartData.length > 0 ?
                        (

                          <BarChart
                            zIndex={1}
                            width={400}
                            height={300}
                            data={planChartData}
                            margin={{
                              top: 20,
                              right: 20,
                              left: 20,
                              bottom: 20,
                            }}
                          >
                            {/* X-Axis */}
                            <XAxis
                              dataKey="name"
                              tickLine={false}
                              axisLine={false}
                              tick={{ fontSize: 12, fill: "#6b7280" }}
                            />

                            {/* Y-Axis */}
                            <YAxis
                              tickLine={false}
                              axisLine={false}
                              tick={{ fontSize: 12, fill: "#6b7280" }}
                              domain={[0, maxPlanValue > 0 ? maxPlanValue + 1 : 1]}
                              allowDecimals={false}
                              ticks={Array.from({ length: (maxPlanValue > 0 ? maxPlanValue + 2 : 2) }, (_, i) => i)}
                            />

                            {/* Tooltip */}
                            <Tooltip
                              contentStyle={{
                                borderRadius: "8px",
                                backgroundColor: "white",
                                border: "1px solid #e5e7eb",
                                padding: "10px",
                              }}
                              formatter={(value, name, props) => {
                                const { percentage, count } = props.payload;
                                if (percentage && count) {
                                  return `${percentage} (${count})`;
                                }
                                return value;
                              }}
                              labelStyle={{ color: "#6b7280" }}
                            />

                            {/* Bars */}
                            {planChartData.length > 0 && (
                              <Bar
                                zIndex={1}
                                dataKey="value"
                                fill="#7902DF"
                                isAnimationActive={true}
                                radius={[4, 4, 0, 0]}
                                barSize={20}
                              />
                            )}

                          </BarChart>
                        ) : (
                          <div className="mt-10">
                            Not enough data available.
                          </div>
                        )
                    }
                  </div>
                </div>

                <div
                  style={{ border: "2px solid white" }}
                  className="
                                    flex w-6/12 flex-col items-center bg-[#ffffff68] rounded-lg p-4"
                >
                  <div className="w-full flex flex-col items-center px-5">
                    <div className="flex flex-row items-center justify-between w-full">
                      <div>
                        <div
                          style={{
                            fontSize: 18,
                            fontWeight: "700",
                            color: "#000",
                          }}
                        >
                          Reactivation Rate
                        </div>
                        <div
                          style={{
                            fontSize: 13,
                            fontWeight: "500",
                            color: "#00000060",
                          }}
                        >
                          Churned users who return
                        </div>
                      </div>

                    </div>
                    {
                      reActivationChartData.length > 0 ?
                        (
                          <BarChart
                            zIndex={1}
                            width={400}
                            height={300}
                            data={reActivationChartData}
                            margin={{
                              top: 20,
                              right: 20,
                              left: 20,
                              bottom: 20,
                            }}
                          >
                            {/* X-Axis */}
                            <XAxis
                              dataKey="name"
                              tickLine={false}
                              axisLine={false}
                              tick={{ fontSize: 12, fill: "#6b7280" }}
                            />

                            {/* Y-Axis */}
                            <YAxis
                              tickLine={false}
                              axisLine={false}
                              tick={{ fontSize: 12, fill: "#6b7280" }}
                              domain={[0, maxReactivationValue > 0 ? maxReactivationValue + 1 : 1]}
                              allowDecimals={false}
                              ticks={Array.from({ length: (maxReactivationValue > 0 ? maxReactivationValue + 2 : 2) }, (_, i) => i)}
                            />

                            {/* Tooltip */}
                            <Tooltip
                              contentStyle={{
                                borderRadius: "8px",
                                backgroundColor: "white",
                                border: "1px solid #e5e7eb",
                                padding: "10px",
                              }}
                              formatter={(value, name, props) => {
                                const { percentage, count } = props.payload;
                                if (percentage && count) {
                                  return `${percentage} (${count})`;
                                }
                                return value;
                              }}
                              labelStyle={{ color: "#6b7280" }}
                            />

                            {/* Bars */}
                            {
                              reActivationChartData.length > 0 ? (
                                <Bar
                                  zIndex={1}
                                  dataKey="value"
                                  fill="#7902DF"
                                  radius={[4, 4, 0, 0]}
                                  barSize={20}
                                />
                              ) : (
                                <Bar
                                  dataKey="fallback"
                                  fill="#ccc"
                                  radius={[4, 4, 0, 0]}
                                  barSize={20}
                                  isAnimationActive={false}
                                  data={[
                                    { name: "No User", fallback: 2 },
                                    { name: "No User", fallback: 1 }
                                  ]}
                                />
                              )
                            }

                          </BarChart>
                        ) : (
                          <div className="mt-10">
                            Not enough data available.
                          </div>
                        )
                    }

                  </div>
                </div>
              </div>
            </div>

            <div className="flex w-4/12 flex-col gap-3">
              {/* <div
                style={{ border: "2px solid white" }}
                className="
                            flex w-full flex-col items-center bg-[#ffffff68] rounded-lg p-4"
              >
                <div className="flex w-full flex-col ">
                  <div className="w-full flex flex-row justify-between items-center">
                    <div>
                      <div
                        style={{ fontSize: 18, fontWeight: "700", color: "#000" }}
                      >
                        Subscription Upgrade Rate
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: "500",
                          color: "#00000060",
                        }}
                      >
                        Percentage of users who convert to paid plans.
                      </div>
                    </div>
                  </div>

                  <div className="w-full flex flex-row justify-end items-center gap-4">


                  </div>



                  <div className="w-full flex flex-row items-center gap- mt-8">
                    <PieChart width={150} height={150}>
                      <Pie
                        data={UpgateRateData}
                        innerRadius={60}
                        outerRadius={65}
                        dataKey="value"
                        startAngle={90}
                        endAngle={-270}
                        paddingAngle={1}
                      >
                        {UpgateRateData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>

                    <div className="flex flex-col gap-2">
                      <div className="flex flex-col gap-2">
                        {testPlans.map((item, index) => (
                          <div key={index} className="flex flex-row items-center gap-2">
                            <div
                              className="h-[13px] w-[13px] rounded-full shadow-md border border-white"
                              style={{ backgroundColor: colors[index % colors.length] }}
                            ></div>
                            <p
                              style={{
                                fontSize: 15,
                                fontWeight: "500",
                                color: "#000",
                              }}
                            >
                              {item} - {analyticData?.subscription?.upgradeBreakdown?.[item] || 0} users
                            </p>
                          </div>
                        ))}
                      </div>


                    </div>
                  </div>
                </div>
              </div>

              <div
                style={{ border: "2px solid white" }}
                className="
                            flex w-full flex-col items-center bg-[#ffffff68] rounded-lg p-4"
              >
                <div className="flex w-full flex-col ">
                  <div className="w-full flex flex-row justify-between items-center">
                    <div>
                      <div
                        style={{ fontSize: 18, fontWeight: "700", color: "#000" }}
                      >
                        Cancelled Plans
                      </div>
                      <div
                        style={{
                          fontSize: 13,
                          fontWeight: "500",
                          color: "#00000060",
                        }}
                      >
                        Tracks users discontinuing their subscriptions.
                      </div>
                    </div>

                  </div>

                  <div className="w-full flex flex-row items-start gap- mt-8">
                    <PieChart width={150} height={150}>
                      <Pie
                        data={cancellationsRateData}
                        innerRadius={60}
                        outerRadius={65}
                        dataKey="value"
                        startAngle={90}
                        endAngle={-270}
                        paddingAngle={1}
                      >
                        {cancellationsRateData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                    <div className="flex flex-col gap-2">
                      {cancellationsRateData.map((item, index) => (
                        <div key={item.name} className="flex flex-row items-center gap-2">
                          <div
                            className="h-[13px] w-[13px] rounded-full shadow-md border border-white"
                            style={{ backgroundColor: item.color }}
                          ></div>
                          <p
                            style={{
                              fontSize: 15,
                              fontWeight: "500",
                              color: "#000",
                            }}
                          >
                            {item.name} - {item.value} users
                          </p>
                        </div>
                      ))}
                    </div>

                  </div>
                </div>
              </div> */}

              <div
                style={{ border: "2px solid white" }}
                className="
                            flex w-full flex-col items-center bg-[#ffffff68] rounded-lg p-4"
              >
                <div className="flex w-full flex-col ">
                  <div className="w-full flex flex-row justify-between items-center">
                    <div
                      style={{ fontSize: 18, fontWeight: "700", color: "#000" }}
                    >
                      Total Referrals
                    </div>
                  </div>

                  <div style={{ fontSize: 48, fontWeight: 300, color: "#000" }}>
                    {analyticData?.referralCodeRate}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full flex flex-row items-center gap-3 mb-6">
            <div
              style={{ border: "2px solid white" }}
              className="flex flex-col justify-between p-4 bg-[#ffffff68] w-[18vw] rounded-lg"
            >
              {/* Title */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-purple">CLV</h3>


              </div>

              {/* Value */}
              <div
                style={{ whiteSpace: "nowrap", fontSize: 23, fontWeight: "500" }}
              >
                ${analyticData?.clv}
              </div>

              {/* Subtitle */}
              <div
                style={{
                  whiteSpace: "nowrap",
                  fontSize: 15,
                  fontWeight: "700",
                  color: "#000",
                }}
              >
                Customer Lifetime Value (CLV)
              </div>
            </div>

            {/*
              <div
                style={{ border: "2px solid white" }}
                className="flex flex-col justify-between p-4 bg-[#ffffff68] w-[18vw] rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-purple">MRR</h3>
                </div>
  
                <div
                  style={{ whiteSpace: "nowrap", fontSize: 23, fontWeight: "500" }}
                >
                  ${analyticData?.mrr}
                </div>
  
                <div
                  style={{
                    whiteSpace: "nowrap",
                    fontSize: 15,
                    fontWeight: "700",
                    color: "#000",
                  }}
                >
                Monthly Recurring Revenue
                </div>
              </div>
            */}

            <div
              style={{ border: "2px solid white" }}
              className="flex flex-col justify-between p-4 bg-[#ffffff68] w-[18vw] rounded-lg"
            >
              {/* Title */}
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-purple">ARR</h3>


              </div>

              {/* Value */}
              <div
                style={{ whiteSpace: "nowrap", fontSize: 23, fontWeight: "500" }}
              >
                ${analyticData?.arr}
              </div>

              {/* Subtitle */}
              <div
                style={{
                  whiteSpace: "nowrap",
                  fontSize: 15,
                  fontWeight: "700",
                  color: "#000",
                }}
              >
                Annual Recurring Revenue (ARR)
              </div>
            </div>

            {/*
              <div
                style={{ border: "2px solid white" }}
                className="flex flex-col justify-between p-4 bg-[#ffffff68] w-[18vw] rounded-lg"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-purple">NRR</h3>
                </div>
  
                <div
                  style={{ whiteSpace: "nowrap", fontSize: 23, fontWeight: "500" }}
                >
                  ${analyticData?.nrr}
                </div>
  
                <div
                  style={{
                    whiteSpace: "nowrap",
                    fontSize: 15,
                    fontWeight: "700",
                    color: "#000",
                  }}
                >
                  Net Revenue Retention (NRR)
                </div>
              </div>
            */}
          </div>

        </div>

        {/* Custom range popup */}

        <Modal
          open={showCustomRangePopup != null}
          onClose={() => setShowCustomRangePopup(null)}
          BackdropProps={{
            timeout: 200,
            sx: {
              backgroundColor: "#00000020",
              // //backdropFilter: "blur(20px)",
            },
          }}
        >
          <Box
            className="w-10/12 sm:w-8/12 md:w-6/12 lg:w-4/12 p-8 rounded-[15px]"
            sx={{ ...styles.modalsStyle, backgroundColor: "white" }}
          >
            <div style={{ width: "100%" }}>
              <div
                className="max-h-[60vh] overflow-auto"
                style={{ scrollbarWidth: "none" }}
              >
                <div
                  style={{
                    width: "100%",
                    direction: "row",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ fontWeight: "500", fontSize: 17 }}>
                    Select Date
                  </div>

                  <CloseBtn
                    onClick={() => {
                      setShowCustomRangePopup(null);
                      setSelectedSubRange("All Time")
                    }}
                  />
                </div>

                <div className=" w-full flex flex-row items-center justify-between">
                  <div
                    style={{

                      marginTop: 20,
                    }}
                  >
                    <div style={{ fontWeight: "500", fontSize: 14 }}>
                      Start Date
                    </div>
                    <div className="mt-5">
                      <CalendarPicker onSelectDate={handleStartDateSelect} />
                    </div>
                  </div>
                  <div
                    style={{
                      marginTop: 20,
                    }}
                  >
                    <div style={{ fontWeight: "500", fontSize: 14, }}>
                      End Date
                    </div>
                    <div className="mt-5">
                      <CalendarPicker onSelectDate={handleEndDateSelect} />
                    </div>
                  </div>
                </div>
                <button
                  className="text-white bg-purple outline-none rounded-xl w-full mt-8"
                  style={{ height: "50px" }}
                  onClick={() => {
                    getAdminAnalytics('customRange');
                    setShowCustomRangePopup(null);
                    setShowCustomRange(true);
                  }}
                >
                  Continue
                </button>
              </div>
            </div>
          </Box>
        </Modal>
      </div>
    ) : (
      <AgencyDashboardDefaultUI />
    )
  );
}

export default AgencySubscriptions;

const styles = {
  modalsStyle: {
    height: "auto",
    bgcolor: "transparent",
    p: 2,
    mx: "auto",
    my: "50vh",
    transform: "translateY(-50%)",
    borderRadius: 2,
    border: "none",
    outline: "none",
  },
};
