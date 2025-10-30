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
import { CalendarPicker } from "../users/CalendarPicker";
import { PersistanceKeys } from "@/constants/Constants";
import axios from "axios";
import Apis from "@/components/apis/Apis";
import moment from "moment";

function AdminSubscriptions() {
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

  const [showCustomRangePopup, setShowCustomRangePopup] = useState(null);

  const [subscriptionStartDate, setSubscriptionStartDate] =
    useState("2025-01-01");
  const [subscriptionEndDate, setSubscriptionEndDate] = useState(
    moment(currantDate).format("YYYY-MM-DD")
  );
  const [selectedSubRange, setSelectedSubRange] = useState("All Time");

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

  // Extract months dynamically from API response
  let months = analyticData
    ? Object.keys(analyticData?.planSubscriptionStats?.Trial || {})
    : [];

  // Transform API data into chart format
  const subscriptionChartData = Object.keys(
    analyticData?.planSubscriptionStats?.Trial || {}
  ).map((dateKey) => {
    // Ensure proper date formatting (MMM DD)
    const formattedDate = moment(dateKey, "MMM DD, YY").format("MMM DD");

    return {
      month: formattedDate, // Correct format for X-axis
      Trial: analyticData?.planSubscriptionStats?.Trial?.[dateKey] || 0,
      Plan30: analyticData?.planSubscriptionStats?.Plan30?.[dateKey] || 0,
      Plan120: analyticData?.planSubscriptionStats?.Plan120?.[dateKey] || 0,
      Plan360: analyticData?.planSubscriptionStats?.Plan360?.[dateKey] || 0,
      Plan720: analyticData?.planSubscriptionStats?.Plan720?.[dateKey] || 0,
    };
  });
  const totalNewSubscriptions = subscriptionChartData.newSubscriptions || '-'
  // .reduce((total, monthData) => {
  //   return total + (monthData.Trial || 0) + (monthData.Plan30 || 0) + (monthData.Plan120 || 0) + (monthData.Plan360 || 0) + (monthData.Plan720 || 0);
  // }, 0);

  //console.log;

  // Mapping Plan names to UI labels
  const planMapping = {
    Plan30: "Plan30",
    Plan120: "Plan120",
    Plan360: "Plan360",
    Plan720: "Plan720",
  };

  // Define colors for each plan
  const colors = ["#8E24AA", "#FF6600", "#402FFF", "#FF2D2D"];

  // Transform data into required format
  const planChartData = Object.keys(analyticData?.subscription?.activePlans || {}).map((planKey, index) => ({
    name: planKey || "",
    value: analyticData?.subscription?.activePlans[planKey] || 0,
    color: colors[index % colors.length],
  }));

  // Calculate max value for plans chart to set Y-axis domain with increments of 1
  const maxPlanValue = planChartData.length > 0 
    ? Math.max(...planChartData.map(d => d.value)) 
    : 0;

  const reActivationChartData = Object.keys(analyticData?.reactivationsByPlan || {}).map((planName, index) => ({
    name: planName || "",
    value: analyticData.reactivationsByPlan[planName] || 0,
    color: colors[index % colors.length],
  }));

  // Calculate max value for reactivation chart to set Y-axis domain with increments of 1
  const maxReactivationValue = reActivationChartData.length > 0 
    ? Math.max(...reActivationChartData.map(d => d.value)) 
    : 0;

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

  const cancellationsRateData = [
    {
      name: "trial",
      value: analyticData?.subscription?.cancellations?.trial || 0,
      color: "#8E24AA",
    },
    {
      name: "From $45",
      value: analyticData?.subscription?.cancellations?.Plan30 || 0,
      color: "#FF6600",
    },
    {
      name: "From $99",
      value: analyticData?.subscription?.cancellations?.Plan120 || 0,
      color: "#402FFF",
    },
    {
      name: "From $299",
      value: analyticData?.subscription?.cancellations?.Plan360 || 0,
      color: "#000000",
    },
    {
      name: "From $599",
      value: analyticData?.subscription?.cancellations?.Plan720 || 0,
      color: "#FF2D2D",
    },
  ];

  useEffect(() => {
    getAdminAnalytics();
  }, []);

  const getAdminAnalytics = async (customeRange = false) => {
    //console.log;
    try {
      const data = localStorage.getItem("User");
      //console.log;

      if (data) {
        let u = JSON.parse(data);

        let path = Apis.AdminAnalytics;
        if (customeRange) {
          path =
            path + "?startDate=" +
            subscriptionStartDate +
            "&endDate=" +
            subscriptionEndDate


          // "?subscriptionStartDate=" +
          // subscriptionStartDate +
          // "&subscriptionEndDate=" +
          // subscriptionEndDate +
          // "&planStartDate=" +
          // planStartDate +
          // "&planEndDate=" +
          // planEndDate +
          // subscriptionEndDate +
          // "&subscriptionUpgradeStartDate=" +
          // upgradeStartDate +
          // "&subscriptionUpgradeEndDate=" +
          // upgradeEndDate;
        }
        //console.log;
        const response = await axios.get(path, {
          headers: {
            "Authorization": "Bearer " + u.token,
            "Content-Type": "application/json",
          },
        });
        //console.log;

        if (response.data) {
          if (response.data.status == true) {
            //console.log;
            setAnalyticData(response.data.data);
          } else {
            //console.log;
          }
        }
      } else {
        //console.log;
      }
    } catch (e) {
      //console.log;
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
    <div
      className="flex flex-col items-center justify-center w-full h-[88vh]"
      style={{ overflow: "auto", scrollbarWidth: "none", paddingTop: "45rem" }}
    >
      <div className="flex flex-col items-start w-11/12 mt-10 gap-3">

        <div className="flex flex-row gap-5 items-center w-full border">
          <div style={{ fontSize: 48, fontWeight: "400", color: "#000" }}>
            Subscription<span style={{ color: "#00000047" }}> Performance</span>
          </div>

          {/* Range date Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="
                  px-4 py-2 border border-[#EEE7FF] rounded-full text-sm font-medium text-gray-800 hover:bg-gray-100
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
                    getAdminAnalytics(false);
                    setShowCustomRange(false)

                  }}
                >
                  All Time
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
                    getAdminAnalytics(false)
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


        </div>

        <div className="flex w-full flex-row items-start gap-3 mt-4">
          <div className="flex flex-col w-8/12">
            <div
              style={{ border: "2px solid white" }}
              className="flex w-full flex-col items-center bg-[#ffffff68] rounded-lg p-4"
            >
              <div className="flex flex-col w-full items-start">
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
                <div className="w-full flex flex-row items-start justify-between">
                  <div className="flex flex-col items-center">
                    <div
                      style={{ fontSize: 48, fontWeight: "300", color: "#000" }}
                    >
                      {analyticData?.newSubscriptions || '='}
                    </div>
                  </div>

                  <div className="w-full flex flex-row items-center gap-4 justify-end">



                  </div>
                </div>
              </div>

              <div className="flex w-full flex-row items-center gap-8 mt-5">
                <div className="flex flex-row items-center gap-">
                  <div className="h-[13px] w-[13px] rounded-full shadow-md bg-[#8E24AA] border border-white"></div>
                  <p style={{ fontSize: 15, fontWeight: "500", color: "#000" }}>
                    Trail
                  </p>
                </div>

                <div className="flex flex-row items-center gap-">
                  <div className="h-[13px] w-[13px] rounded-full shadow-md bg-[#000] border border-white"></div>
                  <p style={{ fontSize: 15, fontWeight: "500", color: "#000" }}>
                    30mins
                  </p>
                </div>

                <div className="flex flex-row items-center gap-">
                  <div className="h-[13px] w-[13px] rounded-full shadow-md bg-[#FF6600] border border-white"></div>
                  <p style={{ fontSize: 15, fontWeight: "500", color: "#000" }}>
                    120mins
                  </p>
                </div>

                <div className="flex flex-row items-center gap-">
                  <div className="h-[13px] w-[13px] rounded-full shadow-md bg-[#402FFF] border border-white"></div>
                  <p style={{ fontSize: 15, fontWeight: "500", color: "#000" }}>
                    360mins
                  </p>
                </div>

                <div className="flex flex-row items-center gap-">
                  <div className="h-[13px] w-[13px] rounded-full shadow-md bg-[#FF2222] border border-white"></div>
                  <p style={{ fontSize: 15, fontWeight: "500", color: "#000" }}>
                    720mins
                  </p>
                </div>

                <div className="flex w-full"></div>
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
                  {/* X-Axis */}
                  <XAxis
                    dataKey="month"
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                    tickFormatter={(value) => moment(value, "MMM DD").format("MMM DD")} // ✅ Ensure correct formatting
                  />

                  {/* Y-Axis */}
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={10}
                    tick={{ fontSize: 12, fill: "#6b7280" }}
                  />

                  {/* Tooltip */}
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

                  {/* Legend
                                <Legend verticalAlign="top" height={36} /> */}

                  {/* Lines */}
                  <Line
                    type="monotone"
                    dataKey="Trial"
                    stroke="#8E24AA"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="Plan30"
                    stroke="#000"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="Plan120"
                    stroke="#FF6600"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="Plan360"
                    stroke="#402FFF"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="Plan720"
                    stroke="#FF2222"
                    strokeWidth={2}
                    dot={false}
                  />
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
                        radius={[4, 4, 0, 0]}
                        barSize={20}
                      />
                    )}
                  </BarChart>
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
                    {reActivationChartData.length > 0 && (
                      <Bar
                        zIndex={1}
                        dataKey="value"
                        fill="#7902DF"
                        radius={[4, 4, 0, 0]}
                        barSize={20}
                    />
                    )}
                  </BarChart>
                </div>
              </div>
            </div>
          </div>

          <div className="flex w-4/12 flex-col gap-3">
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

                <div className="w-full flex flex-row gap-4 items-center mt-4">
                  {manu.map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setSelectedMau(item);
                      }}
                    >
                      <div className="flex flex-col items-center">
                        <div>{item.name}</div>
                        {selectedManu.id == item.id && (
                          <div className="w-full h-[2px] bg-purple"></div>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
                {
                  selectedManu.id === 1 ? (
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
                        <div className="flex flex-row items-center gap-">
                          <div className="h-[13px] w-[13px] rounded-full shadow-md bg-[#8E24AA] border border-white"></div>
                          <p
                            style={{
                              fontSize: 15,
                              fontWeight: "500",
                              color: "#000",
                            }}
                          >
                            Trial to Plan30 -{" "}
                            {analyticData?.subscription?.upgradeBreakdown?.[
                              "Trial to Plan30"
                            ] || 0}{" "}
                            users
                          </p>
                        </div>

                        <div className="flex flex-row items-center gap-">
                          <div className="h-[13px] w-[13px] rounded-full shadow-md bg-[#FF6600] border border-white"></div>
                          <p
                            style={{
                              fontSize: 15,
                              fontWeight: "500",
                              color: "#000",
                            }}
                          >
                            Trial to Plan120 -{" "}
                            {analyticData?.subscription?.upgradeBreakdown?.[
                              "Trial to Plan120"
                            ] || 0}{" "}
                            users
                          </p>
                        </div>

                        <div className="flex flex-row items-center gap-">
                          <div className="h-[13px] w-[13px] rounded-full shadow-md bg-[#402FFF] border border-white"></div>
                          <p
                            style={{
                              fontSize: 15,
                              fontWeight: "500",
                              color: "#000",
                            }}
                          >
                            Trial to Plan360 -{" "}
                            {analyticData?.subscription?.upgradeBreakdown?.[
                              "Trial to Plan360"
                            ] || 0}{" "}
                            users
                          </p>
                        </div>

                        <div className="flex flex-row items-center gap-">
                          <div className="h-[13px] w-[13px] rounded-full shadow-md bg-[#FF2D2D] border border-white"></div>
                          <p
                            style={{
                              fontSize: 15,
                              fontWeight: "500",
                              color: "#000",
                            }}
                          >
                            Trial to Plan720 -{" "}
                            {analyticData?.subscription?.upgradeBreakdown?.[
                              "Trial to Plan720"
                            ] || 0}{" "}
                            users
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full flex flex-row items-center gap- mt-8">
                      <PieChart width={150} height={150}>
                        <Pie
                          data={UpgateRateData2}
                          innerRadius={60}
                          outerRadius={65}
                          dataKey="value"
                          startAngle={90}
                          endAngle={-270}
                          paddingAngle={1}
                        >
                          {UpgateRateData2.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>

                      <div className="flex flex-col gap-2">
                        {/* <div className="flex flex-row items-center gap-">
                          <div className="h-[13px] w-[13px] rounded-full shadow-md bg-[#8E24AA] border border-white"></div>
                          <p
                            style={{
                              fontSize: 15,
                              fontWeight: "500",
                              color: "#000",
                            }}
                          >
                            Trial to Plan30 -{" "}
                            {analyticData?.plan30Upgrades[
                              "Trial to Plan30"
                            ] || 0}{" "}
                            users
                          </p>
                        </div> */}

                        <div className="flex flex-row items-center gap-">
                          <div className="h-[13px] w-[13px] rounded-full shadow-md bg-[#FF6600] border border-white"></div>
                          <p
                            style={{
                              fontSize: 15,
                              fontWeight: "500",
                              color: "#000",
                            }}
                          >
                            $45 to Plan120 -{" "}
                            {analyticData?.plan30Upgrades[
                              "Trial to Plan120"
                            ] || 0}{" "}
                            users
                          </p>
                        </div>

                        <div className="flex flex-row items-center gap-">
                          <div className="h-[13px] w-[13px] rounded-full shadow-md bg-[#402FFF] border border-white"></div>
                          <p
                            style={{
                              fontSize: 15,
                              fontWeight: "500",
                              color: "#000",
                            }}
                          >
                            $45 to Plan360 -{" "}
                            {analyticData?.plan30Upgrades[
                              "Trial to Plan360"
                            ] || 0}{" "}
                            users
                          </p>
                        </div>

                        <div className="flex flex-row items-center gap-">
                          <div className="h-[13px] w-[13px] rounded-full shadow-md bg-[#FF2D2D] border border-white"></div>
                          <p
                            style={{
                              fontSize: 15,
                              fontWeight: "500",
                              color: "#000",
                            }}
                          >
                            $45 to Plan720 -{" "}
                            {analyticData?.plan30Upgrades[
                              "Trial to Plan720"
                            ] || 0}{" "}
                            users
                          </p>
                        </div>
                      </div>
                    </div>
                  )
                }

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
                    <div className="flex flex-row items-center gap-">
                      <div className="h-[13px] w-[13px] rounded-full shadow-md bg-[#8E24AA] border border-white"></div>
                      From trial  -{" "}
                      {analyticData?.subscription?.cancellations?.trial ||
                        0}{" "}
                      users
                    </div>

                    <div className="flex flex-row items-center gap-">
                      <div className="h-[13px] w-[13px] rounded-full shadow-md bg-[#FF6600] border border-white"></div>
                      From $45 -{" "}
                      {analyticData?.subscription?.cancellations?.Plan30 || 0}{" "}
                      users
                    </div>

                    <div className="flex flex-row items-center gap-">
                      <div className="h-[13px] w-[13px] rounded-full shadow-md bg-[#402FFF] border border-white"></div>
                      <p
                        style={{
                          fontSize: 15,
                          fontWeight: "500",
                          color: "#000",
                        }}
                      >
                        From $99 -{" "}
                        {analyticData?.subscription?.cancellations?.Plan120 || 0}{" "}
                        users
                      </p>
                    </div>

                    <div className="flex flex-row items-center gap-">
                      <div className="h-[13px] w-[13px] rounded-full shadow-md bg-[#000000] border border-white"></div>
                      <p
                        style={{
                          fontSize: 15,
                          fontWeight: "500",
                          color: "#000",
                        }}
                      >
                        From $299 -{" "}
                        {analyticData?.subscription?.cancellations?.Plan360 || 0}{" "}
                        users
                      </p>
                    </div>

                    <div className="flex flex-row items-center gap-">
                      <div className="h-[13px] w-[13px] rounded-full shadow-md bg-[#FF2D2D] border border-white"></div>
                      <p
                        style={{
                          fontSize: 15,
                          fontWeight: "500",
                          color: "#000",
                        }}
                      >
                        From $599 -{" "}
                        {analyticData?.subscription?.cancellations?.Plan720 || 0}{" "}
                        users
                      </p>
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

        <div className="w-full flex flex-row items-center gap-3">
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

          <div
            style={{ border: "2px solid white" }}
            className="flex flex-col justify-between p-4 bg-[#ffffff68] w-[18vw] rounded-lg"
          >
            {/* Title */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-purple">MRR</h3>


            </div>

            {/* Value */}
            <div
              style={{ whiteSpace: "nowrap", fontSize: 23, fontWeight: "500" }}
            >
              ${analyticData?.mrr}
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
              Monthly Recurring Revenue
            </div>
          </div>

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
          <div
            style={{ border: "2px solid white" }}
            className="flex flex-col justify-between p-4 bg-[#ffffff68] w-[18vw] rounded-lg"
          >
            {/* Title */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-purple">NRR</h3>


            </div>

            {/* Value */}
            <div
              style={{ whiteSpace: "nowrap", fontSize: 23, fontWeight: "500" }}
            >
              ${analyticData?.nrr}
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
              Net Revenue Retention (NRR)
            </div>
          </div>
        </div>

        <div style={{ fontSize: 48, fontWeight: "300", marginTop: 20 }}>
          Customer Acquistion
        </div>

        <div className="w-full flex flex-row items-center gap-3 mb-10">
          <div
            style={{ border: "2px solid white" }}
            className="flex flex-col justify-between p-4 bg-[#ffffff68] w-[18vw] rounded-lg"
          >
            {/* Title */}
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-purple">CAC</h3>

            </div>

            {/* Value */}
            <div
              style={{ whiteSpace: "nowrap", fontSize: 30, fontWeight: "300" }}
            >
              $802
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
              Customer Acquisition Cost
            </div>
          </div>

          <div
            style={{ border: "2px solid white" }}
            className="flex flex-col p-4 bg-[#ffffff68] w-[18vw] rounded-lg"
          >
            {/* Title */}
            <div className="flex items-center justify-between">
              <div className="h-[30px] w-[30px] rounded-full flex flex-col bg-white items-center justify-center">
                <Image
                  src={"/svgIcons/purpleClockIcon.svg"}
                  height={20}
                  width={20}
                  alt="*"
                />
              </div>


            </div>

            {/* Value */}
            <div
              style={{ whiteSpace: "nowrap", fontSize: 30, fontWeight: "300" }}
            >
              $802
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
              CAC Payback Period
            </div>
          </div>
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

                <button
                  onClick={() => {
                    setShowCustomRangePopup(null);
                    setSelectedSubRange("All Time")
                  }}
                >
                  <Image
                    src={"/assets/blackBgCross.png"}
                    height={20}
                    width={20}
                    alt="*"
                  />
                </button>
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
                  getAdminAnalytics(true);
                  setShowCustomRangePopup(null);
                  setShowCustomRange(true)
                }}
              >
                Continue
              </button>
            </div>
          </div>
        </Box>
      </Modal>
    </div>
  );
}

export default AdminSubscriptions;

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
