"use client";

import React, { useState } from "react";
import Image from "next/image";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import CustomTooltip from "@/utilities/CustomTooltip";

/**
 * RevenueGrowthChart - Bar chart showing monthly revenue growth
 * @param {Object} props
 * @param {Array} props.data - Chart data array with month and value
 * @param {string} props.currentValue - Current revenue value to display
 * @param {string} props.selectedPeriod - Selected time period (default: "This Year")
 */
function RevenueGrowthChart({
  data = [],
  currentValue = "11,728",
  selectedPeriod = "This Year",
  onPeriodChange,
}) {
  const [period, setPeriod] = useState(selectedPeriod);

  // Default sample data if none provided
  const chartData =
    data.length > 0
      ? data
      : [
          { month: "Jan", value: 100 },
          { month: "Feb", value: 200 },
          { month: "Mar", value: 300 },
          { month: "Apr", value: 121200 },
          { month: "May", value: 500 },
          { month: "Jun", value: 600 },
          { month: "Jul", value: 700 },
          { month: "Aug", value: 800 },
          { month: "Sep", value: 900 },
          { month: "Oct", value: 1000 },
          { month: "Nov", value: 1100 },
          { month: "Dec", value: 1200 },
        ];

  // Calculate Y-axis domain based on max value
  const maxValue = Math.max(...chartData.map((d) => d.value), 0);
  
  // Generate Y-axis ticks in logarithmic-like scale for better visualization
  const generateYTicks = (max) => {
    if (max === 0) return [0];
    const scale = Math.pow(10, Math.floor(Math.log10(max)));
    const multiplier = Math.ceil(max / scale);
    const ticks = [];
    const steps = [1, 2, 5, 10];
    const step = steps.find((s) => s * scale * 10 >= max) || 1;
    
    for (let i = 0; i <= multiplier * step; i += step) {
      const value = i * scale;
      if (value <= max * 1.2) {
        ticks.push(value);
      }
    }
    return ticks.length > 0 ? ticks : [0, Math.ceil(max)];
  };

  const yTicks = generateYTicks(maxValue);

  const formatYAxis = (tick) => {
    if (tick >= 1000) return `${tick / 1000}k`;
    return tick.toString();
  };

  const handlePeriodSelect = (value) => {
    setPeriod(value);
    if (onPeriodChange) {
      onPeriodChange(value);
    }
  };

  const customTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const monthNames = {
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
      return (
        <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
          <p className="font-medium text-gray-900">{monthNames[label] || label}</p>
          <p className="text-purple-600 font-semibold">${payload[0].value?.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="bg-white rounded-lg border-2 border-white shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CardTitle className="text-lg font-bold text-gray-900">
              Revenue Growth
            </CardTitle>
            <CustomTooltip title="Revenue growth over a period of time" />
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-700 border border-gray-200 rounded-full hover:bg-gray-50">
                {period}
                <Image
                  src="/svgIcons/downArrow.svg"
                  alt="Dropdown"
                  width={16}
                  height={16}
                />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-40">
              <DropdownMenuItem onClick={() => handlePeriodSelect("This Year")}>
                This Year
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePeriodSelect("Last Year")}>
                Last Year
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handlePeriodSelect("All Time")}>
                All Time
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        {/* <div className="text-2xl font-light text-gray-900 mt-2">{currentValue}</div> */}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "#6b7280" }}
              tickMargin={10}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "#6b7280" }}
              tickMargin={10}
              tickFormatter={formatYAxis}
              domain={[0, maxValue > 0 ? maxValue * 1.2 : 100]}
              ticks={yTicks}
            />
            <Tooltip content={customTooltip} />
            <Bar
              dataKey="value"
              fill="#8E24AA"
              radius={[4, 4, 0, 0]}
              barSize={30}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}

export default RevenueGrowthChart;

