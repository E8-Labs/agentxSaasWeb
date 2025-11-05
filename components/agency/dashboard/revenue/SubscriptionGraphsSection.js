"use client";

import React, { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";
import moment from "moment";
import Image from "next/image";

/**
 * SubscriptionGraphsSection - Displays subscription-related graphs
 * @param {Object} props
 * @param {Object} props.subscriptionData - Data for subscription graphs
 */
function SubscriptionGraphsSection({ subscriptionData = {} }) {
  const {
    planSubscriptionStats = {},
    activePlansUsers = {},
    reactivationsByPlan = {},
    newSubscriptions = 0,
  } = subscriptionData;

  const [showPlansTooltip, setShowPlansTooltip] = useState(false);

  // Define colors for each plan
  const colors = ["#8E24AA", "#FF6600", "#402FFF", "#FF2D2D"];

  // Transform API data into chart format for New Subscriptions
  const subscriptionChartData = (() => {
    if (!planSubscriptionStats || Object.keys(planSubscriptionStats).length === 0) {
      return [];
    }

    // Collect ALL unique dates from all plans
    const allDatesSet = new Set();
    Object.values(planSubscriptionStats).forEach((planDates) => {
      Object.keys(planDates).forEach((date) => {
        allDatesSet.add(date);
      });
    });

    // Convert to array and sort by date
    const allDates = Array.from(allDatesSet).sort((a, b) => {
      return moment(a, "MMM DD, YY").valueOf() - moment(b, "MMM DD, YY").valueOf();
    });

    return allDates.map((dateKey) => {
      const formattedDate = moment(dateKey, "MMM DD, YY").format("MMM DD");
      const entry = { month: formattedDate, fullDate: dateKey };

      Object.keys(planSubscriptionStats).forEach((planName) => {
        entry[planName] = planSubscriptionStats[planName]?.[dateKey] || 0;
      });

      return entry;
    });
  })();

  // Transform data for Plans chart
  const planChartData = Object.keys(activePlansUsers || {}).map(
    (planName, index) => ({
      name: planName || "",
      value: activePlansUsers[planName] || 0,
      color: colors[index % colors.length],
    })
  );

  const maxPlanValue = planChartData.length > 0
    ? Math.max(...planChartData.map(d => d.value))
    : 0;

  // Transform data for Reactivation Rate chart
  const reActivationChartData = Object.keys(reactivationsByPlan || {}).map(
    (planName, index) => ({
      name: planName || "",
      value: reactivationsByPlan[planName] || 0,
      color: colors[index % colors.length],
    })
  );

  const maxReactivationValue = reActivationChartData.length > 0
    ? Math.max(...reActivationChartData.map(d => d.value))
    : 0;

  return (
    <div className="w-full flex flex-col gap-6">
      {/* New Subscriptions Chart (60%) and Stacked Bar Charts (40%) */}
      <div className="flex flex-row gap-6 w-full items-stretch">
        {/* New Subscriptions Chart - 60% Width */}
        <div
          style={{ border: "2px solid white" }}
          className="flex w-[60%] flex-col items-center bg-[#ffffff68] rounded-lg p-6"
        >
          <div className="flex flex-col w-full items-start">
            <div className="flex flex-row items-center gap-4 justify-start">
              <div>
                <div
                  style={{
                    fontSize: 18,
                    fontWeight: "700",
                    color: "#0E0E0E",
                    whiteSpace: "nowrap",
                  }}
                >
                  New Subscriptions
                </div>
                <div
                  style={{
                    fontSize: 13,
                    fontWeight: "500",
                    color: "#00000060",
                  }}
                >
                  Number of new paid users over a period of time
                </div>
              </div>
            </div>
            <div className="w-full flex flex-row items-start justify-between mt-4">
              <div className="flex flex-col items-center">
                <div
                  style={{ fontSize: 48, fontWeight: "300", color: "#000" }}
                >
                  {newSubscriptions}
                </div>
              </div>
            </div>
          </div>

          <div className="flex w-full flex-row items-center gap-8 mt-5 overflow-x-auto">
            {Object.keys(planSubscriptionStats || {}).map((planName, index) => (
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

          <div className="flex w-full justify-center">
            {subscriptionChartData.length > 0 ? (
              <LineChart
                width={600}
                height={460}
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
                  allowDecimals={false}
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

                {Object.keys(planSubscriptionStats || {}).map((planName, index) => (
                  <Line
                    key={planName}
                    type="monotone"
                    dataKey={planName}
                    stroke={colors[index % colors.length] || "#000"}
                    strokeWidth={2}
                    dot={{ r: 4 }}
                  />
                ))}
              </LineChart>
            ) : (
              <div className="py-10 text-gray-500">Not enough data available.</div>
            )}
          </div>
        </div>

        {/* Plans and Reactivation Rate - Stacked Vertically (40%) */}
        <div className="flex flex-col gap-6 w-[40%] flex-1">
          {/* Plans Chart */}
          <div
            style={{ border: "2px solid white" }}
            className="flex w-full flex-col items-center bg-[#ffffff68] rounded-lg p-4 flex-1"
          >
            <div className="w-full flex flex-col items-center h-full">
              <div className="flex flex-row items-center justify-between w-full mb-2">
                <div className="flex flex-row items-center gap-2">
                  <div
                    style={{ fontSize: 18, fontWeight: "700", color: "#000" }}
                  >
                    Plans
                  </div>
                  <div
                    className="relative"
                    onMouseEnter={() => setShowPlansTooltip(true)}
                    onMouseLeave={() => setShowPlansTooltip(false)}
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="cursor-pointer text-gray-500"
                    >
                      <circle cx="8" cy="8" r="7" stroke="currentColor" strokeWidth="1.5" />
                      <path d="M8 7V11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                      <circle cx="8" cy="5" r="0.5" fill="currentColor" />
                    </svg>
                    {showPlansTooltip && (
                      <div
                        className="absolute left-0 top-6 z-50 bg-gray-900 text-white text-xs rounded-md px-3 py-2 whitespace-nowrap shadow-lg"
                        style={{ minWidth: "200px" }}
                      >
                        Number of users on active plans
                        <div
                          className="absolute -top-1 left-2 w-2 h-2 bg-gray-900 transform rotate-45"
                        ></div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {planChartData.length > 0 ? (
                <BarChart
                  zIndex={1}
                  width={350}
                  height={210}
                  data={planChartData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 10,
                    bottom: 10,
                  }}
                >
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    domain={[0, maxPlanValue > 0 ? maxPlanValue + 1 : 1]}
                    allowDecimals={false}
                    ticks={Array.from({ length: (maxPlanValue > 0 ? maxPlanValue + 2 : 2) }, (_, i) => i)}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      padding: "10px",
                    }}
                    labelStyle={{ color: "#6b7280" }}
                  />
                  <Bar
                    zIndex={1}
                    dataKey="value"
                    fill="#7902DF"
                    isAnimationActive={true}
                    radius={[4, 4, 0, 0]}
                    barSize={20}
                  />
                </BarChart>
              ) : (
                <div className="py-10 text-gray-500 text-sm">Not enough data available.</div>
              )}
            </div>
          </div>

          {/* Reactivation Rate Chart */}
          <div
            style={{ border: "2px solid white" }}
            className="flex w-full flex-col items-center bg-[#ffffff68] rounded-lg p-4 flex-1"
          >
            <div className="w-full flex flex-col items-center h-full">
              <div className="flex flex-row items-center justify-between w-full mb-2">
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
              {reActivationChartData.length > 0 ? (
                <BarChart
                  zIndex={1}
                  width={350}
                  height={210}
                  data={reActivationChartData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 10,
                    bottom: 10,
                  }}
                >
                  <XAxis
                    dataKey="name"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "#6b7280" }}
                    domain={[0, maxReactivationValue > 0 ? maxReactivationValue + 1 : 1]}
                    allowDecimals={false}
                    ticks={Array.from({ length: (maxReactivationValue > 0 ? maxReactivationValue + 2 : 2) }, (_, i) => i)}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: "8px",
                      backgroundColor: "white",
                      border: "1px solid #e5e7eb",
                      padding: "10px",
                    }}
                    labelStyle={{ color: "#6b7280" }}
                  />
                  <Bar
                    zIndex={1}
                    dataKey="value"
                    fill="#7902DF"
                    radius={[4, 4, 0, 0]}
                    barSize={20}
                  />
                </BarChart>
              ) : (
                <div className="py-10 text-gray-500 text-sm">Not enough data available.</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubscriptionGraphsSection;
