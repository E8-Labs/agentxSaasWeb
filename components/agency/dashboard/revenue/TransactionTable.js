"use client";

import React, { useState } from "react";
import Image from "next/image";
import InfiniteScroll from "react-infinite-scroll-component";
import { CircularProgress } from "@mui/material";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * TransactionTable - Full-width table displaying transaction details
 * @param {Object} props
 * @param {Array} props.data - Array of transaction objects
 * @param {Function} props.onSearch - Callback for search input
 * @param {boolean} props.hasMore - Whether there are more items to load
 * @param {boolean} props.loadingMore - Whether more items are currently loading
 * @param {Function} props.onLoadMore - Callback to load more items
 */
function TransactionTable({ data = [], onSearch, hasMore = false, loadingMore = false, onLoadMore }) {
  const [searchQuery, setSearchQuery] = useState("");

  // Default sample data
  const defaultData = [
    {
      id: 1,
      subAccount: "Chris Perez",
      accountIcon: "5",
      product: "Product N...",
      type: "XBar",
      totalPaid: "$3,018.88",
      stripeFee: "$3,018.88",
      platformFee: "$18.88",
      payout: "$6,367.65",
      date: "11/11/2024",
      status: "success",
    },
    {
      id: 2,
      subAccount: "Jael Wilson",
      accountIcon: "2",
      product: "Product N...",
      type: "Trial Mins",
      totalPaid: "$6,986.19",
      stripeFee: "$6,986.19",
      platformFee: "$686.19",
      payout: "$8,149.61",
      date: "27/1/2024",
      status: "failed",
    },
    {
      id: 3,
      subAccount: "Storm Johnson",
      accountIcon: "3",
      product: "Product N...",
      type: "Seats",
      totalPaid: "$4,005.65",
      stripeFee: "$4,005.65",
      platformFee: "$505.65",
      payout: "$8,006.89",
      date: "28/9/2025",
      status: "pending",
    },
    {
      id: 4,
      subAccount: "Cypress Roberts",
      accountIcon: "4",
      product: "Product N...",
      type: "Phone",
      totalPaid: "$9,137.14",
      stripeFee: "$9,137.14",
      platformFee: "$37.14",
      payout: "$6,475.73",
      date: "4/8/2025",
      status: "success",
    },
    {
      id: 5,
      subAccount: "Hollis Kim",
      accountIcon: "1",
      product: "Product N...",
      type: "Enrichment",
      totalPaid: "$3,556.78",
      stripeFee: "$3,556.78",
      platformFee: "$356.78",
      payout: "$9,119.84",
      date: "15/1/2025",
      status: "success",
    },
  ];

  const transactionData = data.length > 0 ? data : defaultData;

  const getStatusDot = (status) => {
    const statusConfig = {
      success: "bg-green-500",
      failed: "bg-red-500",
      pending: "bg-yellow-500",
    };
    return (
      <div
        className={cn(
          "w-2 h-2 rounded-full",
          statusConfig[status] || "bg-gray-400"
        )}
      />
    );
  };

  const getAccountIconColor = (index) => {
    const colors = [
      "#8E24AA",
      "#FF6600",
      "#402FFF",
      "#FF2D2D",
      "#F59E0B",
    ];
    return colors[index % colors.length];
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  // Filter data based on search query
  const filteredData = transactionData.filter((item) =>
    item.subAccount.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Card className="bg-white rounded-lg border-2 border-white shadow-sm">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold text-gray-900">
            Transaction
          </CardTitle>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Image
                src="/svgIcons/searchIcon.svg"
                alt="Search"
                width={16}
                height={16}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              />
              <Input
                type="text"
                placeholder="Search Subaccount"
                value={searchQuery}
                onChange={handleSearchChange}
                className="pl-10 pr-10 w-64 h-9 text-sm border-gray-200"
              />
            </div>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <Image
                src="/svgIcons/filterBtn.svg"
                alt="Filter"
                width={16}
                height={16}
              />
            </button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div 
          id="transactionScrollableDiv"
          className="overflow-x-auto max-h-[640px] overflow-y-auto"
          style={{ scrollbarWidth: "none" }}
        >
          <InfiniteScroll
            dataLength={filteredData.length}
            next={() => {
              if (onLoadMore && !loadingMore && hasMore) {
                onLoadMore();
              }
            }}
            hasMore={hasMore}
            loader={
              <div className="w-full flex flex-row justify-center mt-4 py-4">
                <CircularProgress size={30} />
              </div>
            }
            endMessage={
              filteredData.length > 0 ? (
                <p
                  style={{
                    textAlign: "center",
                    paddingTop: "10px",
                    fontWeight: "400",
                    fontSize: 16,
                    color: "#00000060",
                  }}
                >
                 {` You're all caught up`}
                </p>
              ) : null
            }
            scrollableTarget="transactionScrollableDiv"
            style={{ overflow: "unset" }}
          >
            <Table>
              <TableHeader>
                <TableRow className="border-b border-gray-200">
                  <TableHead className="text-gray-600 font-medium">Sub account</TableHead>
                  <TableHead className="text-gray-600 font-medium">Product...</TableHead>
                  <TableHead className="text-gray-600 font-medium">Type</TableHead>
                  <TableHead className="text-gray-600 font-medium">Total Paid</TableHead>
                  <TableHead className="text-gray-600 font-medium">Stripe Fee</TableHead>
                  <TableHead className="text-gray-600 font-medium">Platform Fee</TableHead>
                  <TableHead className="text-gray-600 font-medium">Payout</TableHead>
                  <TableHead className="text-gray-600 font-medium">Date</TableHead>
                  <TableHead className="text-gray-600 font-medium">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData.map((item, index) => (
                  <TableRow
                    key={item.id || index}
                    className="border-b border-gray-100 hover:bg-gray-50"
                  >
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                          style={{
                            backgroundColor: getAccountIconColor(index),
                          }}
                        >
                          {item.accountIcon || String(index + 1)}
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {item.subAccount}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">
                      {item.product}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">{item.type}</TableCell>
                    <TableCell className="text-sm text-gray-700 font-medium">
                      {item.totalPaid}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">
                      {item.stripeFee}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">
                      {item.platformFee}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700 font-medium">
                      {item.payout}
                    </TableCell>
                    <TableCell className="text-sm text-gray-700">{item.date}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getStatusDot(item.status)}
                        <span className="text-sm text-gray-700 capitalize">
                          {item.status}
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </InfiniteScroll>
        </div>
      </CardContent>
    </Card>
  );
}

export default TransactionTable;

