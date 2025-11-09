import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import moment from "moment";
import Apis from "@/components/apis/Apis";
import { Box, CircularProgress } from "@mui/material";
import { CalendarDots, CaretDown, CaretUp } from "@phosphor-icons/react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "./CalendarOverrides.css";
import { AuthToken } from "@/components/agency/plan/AuthDetails";

// Hook to handle clicks outside element
function useClickOutside(ref, handler) {
  useEffect(() => {
    const listener = (event) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler(event);
    };
    document.addEventListener("mousedown", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
    };
  }, [ref, handler]);
}

function AdminCallAnalytics({ selectedAgency, isFromAgency = false }) {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoader, setInitialLoader] = useState(true);
  
  // Date filter states
  const [selectedFromDate, setSelectedFromDate] = useState(() => {
    // Default to 30 days ago
    const date = new Date();
    date.setDate(date.getDate() - 30);
    return date;
  });
  const [selectedToDate, setSelectedToDate] = useState(new Date());
  const [showFromDatePicker, setShowFromDatePicker] = useState(false);
  const [showToDatePicker, setShowToDatePicker] = useState(false);
  const [isSummaryCollapsed, setIsSummaryCollapsed] = useState(false);

  // Use ref to track initial mount
  const isInitialMount = useRef(true);
  
  // Refs for date pickers to handle click outside
  const fromDatePickerRef = useRef(null);
  const toDatePickerRef = useRef(null);

  // Close date pickers when clicking outside
  useClickOutside(fromDatePickerRef, () => {
    if (showFromDatePicker) {
      setShowFromDatePicker(false);
    }
  });

  useClickOutside(toDatePickerRef, () => {
    if (showToDatePicker) {
      setShowToDatePicker(false);
    }
  });

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      fetchCallAnalytics();
    }
  }, []);

  // Refetch when date filters change
  useEffect(() => {
    if (!isInitialMount.current && (selectedFromDate || selectedToDate)) {
      fetchCallAnalytics();
    }
  }, [selectedFromDate, selectedToDate, selectedAgency]);

  const fetchCallAnalytics = async () => {
    try {
      setLoading(true);
      setInitialLoader(true);

      const token = AuthToken();
      if (!token) return;

      // Format dates as YYYY-MM-DD
      const startDate = selectedFromDate 
        ? moment(selectedFromDate).format("YYYY-MM-DD")
        : moment().subtract(30, 'days').format("YYYY-MM-DD");
      
      const endDate = selectedToDate 
        ? moment(selectedToDate).format("YYYY-MM-DD")
        : moment().format("YYYY-MM-DD");

      let ApiPath = `${Apis.getCallAnalytics}?startDate=${startDate}&endDate=${endDate}`;

      // Add agency filter if provided
      if (selectedAgency) {
        ApiPath += `&agencyId=${selectedAgency.id}`;
      }

      console.log("Fetching call analytics from:", ApiPath);

      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response?.data?.status && response?.data?.data) {
        setAnalyticsData(response.data.data);
        console.log("Call analytics data:", response.data.data);
      }
    } catch (error) {
      console.error("Error fetching call analytics:", error);
    } finally {
      setLoading(false);
      setInitialLoader(false);
    }
  };

  const handleFromDateChange = (date) => {
    setSelectedFromDate(date);
    setShowFromDatePicker(false);
  };

  const handleToDateChange = (date) => {
    setSelectedToDate(date);
    setShowToDatePicker(false);
  };

  const formatNumber = (num) => {
    if (num === null || num === undefined) return "-";
    return typeof num === 'number' ? num.toLocaleString() : num;
  };

  const formatPercentage = (num) => {
    if (num === null || num === undefined) return "-";
    return typeof num === 'number' ? `${num}%` : num;
  };

  if (initialLoader) {
    return (
      <div className="flex flex-row items-center justify-center h-[67vh]">
        <CircularProgress size={35} />
      </div>
    );
  }

  return (
    <div className="w-full h-[67vh] overflow-y-auto" id="scrollableDiv1" style={{ scrollbarWidth: "none" }}>
      {/* Collapsible Header with Toggle */}
      <div className="flex flex-row items-center justify-between pl-10 pr-10 mb-4">
        <div className="flex flex-row items-center gap-4">
          <div style={{ fontSize: 16, fontWeight: "600", color: "#000000" }}>
            Summary & Filters
          </div>
          {isSummaryCollapsed && (
            <div 
              className="px-3 py-1 bg-purple10 text-purple rounded-full"
              style={{ fontSize: 12, fontWeight: "500" }}
            >
              {selectedFromDate && selectedToDate
                ? `${moment(selectedFromDate).format("MMM DD")} - ${moment(selectedToDate).format("MMM DD, YYYY")}`
                : "Date range not set"}
            </div>
          )}
        </div>
        <button
          onClick={() => setIsSummaryCollapsed(!isSummaryCollapsed)}
          className="flex flex-row items-center gap-2 outline-none hover:opacity-80 transition-opacity"
          style={{ color: "#7902DF", fontSize: 14, fontWeight: "500" }}
        >
          {isSummaryCollapsed ? (
            <>
              <span>Expand</span>
              <CaretDown size={20} />
            </>
          ) : (
            <>
              <span>Collapse</span>
              <CaretUp size={20} />
            </>
          )}
        </button>
      </div>

      {/* Collapsible Content */}
      {!isSummaryCollapsed && (
        <>
          {/* Date Filter Section */}
          <div className="flex flex-row items-start gap-4 pl-10 mb-6 relative">
        <div className="w-1/2 relative" ref={fromDatePickerRef}>
          <div
            style={{
              fontWeight: "500",
              fontSize: 12,
              color: "#00000060",
              marginBottom: 8,
            }}
          >
            From Date
          </div>
          <button
            style={{ border: "1px solid #00000020" }}
            className="flex flex-row items-center justify-between p-2 rounded-lg w-full"
            onClick={() => {
              setShowFromDatePicker(!showFromDatePicker);
              setShowToDatePicker(false);
            }}
          >
            <p>
              {selectedFromDate
                ? moment(selectedFromDate).format("MMM DD, YYYY")
                : "Select Date"}
            </p>
            <CalendarDots weight="regular" size={25} />
          </button>
          {showFromDatePicker && (
            <div className="absolute z-50 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
              <Calendar
                onChange={handleFromDateChange}
                value={selectedFromDate}
                locale="en-US"
                maxDate={selectedToDate || new Date()}
                tileClassName={({ date, view }) => {
                  const today = new Date();
                  if (
                    date.getDate() === today.getDate() &&
                    date.getMonth() === today.getMonth() &&
                    date.getFullYear() === today.getFullYear()
                  ) {
                    return "current-date";
                  }
                  return null;
                }}
              />
            </div>
          )}
        </div>

        <div className="w-1/2 relative" ref={toDatePickerRef}>
          <div
            style={{
              fontWeight: "500",
              fontSize: 12,
              color: "#00000060",
              marginBottom: 8,
            }}
          >
            To Date
          </div>
          <button
            style={{ border: "1px solid #00000020" }}
            className="flex flex-row items-center justify-between p-2 rounded-lg w-full"
            onClick={() => {
              setShowToDatePicker(!showToDatePicker);
              setShowFromDatePicker(false);
            }}
          >
            <p>
              {selectedToDate
                ? moment(selectedToDate).format("MMM DD, YYYY")
                : "Select Date"}
            </p>
            <CalendarDots weight="regular" size={25} />
          </button>
          {showToDatePicker && (
            <div className="absolute z-50 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg">
              <Calendar
                onChange={handleToDateChange}
                value={selectedToDate}
                locale="en-US"
                minDate={selectedFromDate}
                maxDate={new Date()}
                tileClassName={({ date, view }) => {
                  const today = new Date();
                  if (
                    date.getDate() === today.getDate() &&
                    date.getMonth() === today.getMonth() &&
                    date.getFullYear() === today.getFullYear()
                  ) {
                    return "current-date";
                  }
                  return null;
                }}
              />
            </div>
          )}
        </div>
      </div>

          {/* Summary Cards */}
          {analyticsData && (
            <>
              <div className="grid grid-cols-4 gap-4 mb-8 pl-10 pr-10">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div style={{ fontSize: 12, color: "#00000060", fontWeight: "500" }}>
                    Total Users
                  </div>
                  <div style={{ fontSize: 24, fontWeight: "600", color: "#7902DF", marginTop: 8 }}>
                    {formatNumber(analyticsData.summary?.totalUsers)}
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div style={{ fontSize: 12, color: "#00000060", fontWeight: "500" }}>
                    Total Calls
                  </div>
                  <div style={{ fontSize: 24, fontWeight: "600", color: "#7902DF", marginTop: 8 }}>
                    {formatNumber(analyticsData.summary?.totalCalls)}
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div style={{ fontSize: 12, color: "#00000060", fontWeight: "500" }}>
                    Total Minutes
                  </div>
                  <div style={{ fontSize: 24, fontWeight: "600", color: "#7902DF", marginTop: 8 }}>
                    {formatNumber(analyticsData.summary?.totalMinutesUsed?.toFixed(2))}
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div style={{ fontSize: 12, color: "#00000060", fontWeight: "500" }}>
                    Success Rate
                  </div>
                  <div style={{ fontSize: 24, fontWeight: "600", color: "#7902DF", marginTop: 8 }}>
                    {formatPercentage(analyticsData.summary?.overallSuccessRate)}
                  </div>
                </div>
              </div>

              {/* Additional Summary Metrics */}
              <div className="grid grid-cols-4 gap-4 mb-8 pl-10 pr-10">
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div style={{ fontSize: 12, color: "#00000060", fontWeight: "500" }}>
                    Total Batches
                  </div>
                  <div style={{ fontSize: 20, fontWeight: "600", marginTop: 8 }}>
                    {formatNumber(analyticsData.summary?.totalBatches)}
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div style={{ fontSize: 12, color: "#00000060", fontWeight: "500" }}>
                    Unique Leads Called
                  </div>
                  <div style={{ fontSize: 20, fontWeight: "600", marginTop: 8 }}>
                    {formatNumber(analyticsData.summary?.uniqueLeadsCalled)}
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div style={{ fontSize: 12, color: "#00000060", fontWeight: "500" }}>
                    Hot Leads
                  </div>
                  <div style={{ fontSize: 20, fontWeight: "600", marginTop: 8 }}>
                    {formatNumber(analyticsData.summary?.overallHotLeads)}
                  </div>
                </div>
                <div className="bg-white border border-gray-200 rounded-lg p-4">
                  <div style={{ fontSize: 12, color: "#00000060", fontWeight: "500" }}>
                    Booked Leads
                  </div>
                  <div style={{ fontSize: 20, fontWeight: "600", marginTop: 8 }}>
                    {formatNumber(analyticsData.summary?.overallBookedLeads)}
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {loading && !analyticsData ? (
        <div className="flex flex-row items-center justify-center h-[67vh]">
          <CircularProgress size={35} />
        </div>
      ) : analyticsData ? (
        <div className="w-full pl-10 pr-10">
          {/* User List Table */}
          <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <div style={{ fontSize: 18, fontWeight: "600" }}>
                User Analytics ({analyticsData.userList?.length || 0} users)
              </div>
            </div>
            <div 
              className="overflow-x-auto" 
              style={{ 
                maxHeight: isSummaryCollapsed ? "75vh" : "50vh", 
                scrollbarWidth: "none" 
              }}
            >
              <table className="w-full" style={{ borderCollapse: "collapse" }}>
                <thead className="bg-gray-50 sticky top-0">
                  <tr>
                    <th style={styles.tableHeader}>Sub Account</th>
                    <th style={styles.tableHeader}>Email</th>
                    <th style={styles.tableHeader}>Total Calls</th>
                    <th style={styles.tableHeader}>Total Credits</th>
                    <th style={styles.tableHeader}>Nurtured Leads</th>
                    <th style={styles.tableHeader}>Hot Leads</th>
                    <th style={styles.tableHeader}>Booked Leads</th>
                    <th style={styles.tableHeader}>Success Rate</th>
                    <th style={styles.tableHeader}>Batches</th>
                    <th style={styles.tableHeader}>Avg Call Duration</th>
                    <th style={styles.tableHeader}>Balance (Credits)</th>
                  </tr>
                </thead>
                <tbody>
                  {analyticsData.userList && analyticsData.userList.length > 0 ? (
                    analyticsData.userList.map((user, index) => (
                      <tr
                        key={user.userId || index}
                        className="hover:bg-gray-50"
                        style={{ borderBottom: "1px solid #f0f0f0" }}
                      >
                        <td style={styles.tableCell}>
                          <div
                            className="text-purple underline cursor-pointer"
                            onClick={() => {
                              if (user.userId) {
                                window.open(`/admin/users?userId=${user.userId}`, "_blank");
                              }
                            }}
                          >
                            {user.userName || "-"}
                          </div>
                        </td>
                        <td style={styles.tableCell}>{user.userEmail || "-"}</td>
                        <td style={styles.tableCell}>{formatNumber(user.totalCalls)}</td>
                        <td style={styles.tableCell}>
                          {formatNumber(user.totalMinutes?.toFixed(2))}
                        </td>
                        <td style={styles.tableCell}>{formatNumber(user.uniqueLeadsCalled)}</td>
                        <td style={styles.tableCell}>{formatNumber(user.hotLeads)}</td>
                        <td style={styles.tableCell}>{formatNumber(user.bookedLeads)}</td>
                        <td style={styles.tableCell}>
                          {formatPercentage(user.successCallRate)}
                        </td>
                        <td style={styles.tableCell}>
                          {formatNumber(user.totalBatches)} ({user.activeBatches} active)
                        </td>
                        <td style={styles.tableCell}>
                          {formatNumber(user.averageCallDuration?.toFixed(2))} min
                        </td>
                        <td style={styles.tableCell}>
                          {formatNumber(user.currentBalanceMinutes?.toFixed(2))}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="11" style={{ ...styles.tableCell, textAlign: "center", padding: "40px" }}>
                        No user data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-row items-center justify-center h-[67vh]">
          <div style={{ fontSize: 18, fontWeight: "500", color: "#00000060" }}>
            No analytics data available
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCallAnalytics;

const styles = {
  tableHeader: {
    padding: "12px 16px",
    textAlign: "left",
    fontSize: 13,
    fontWeight: "600",
    color: "#00000090",
    backgroundColor: "#f9fafb",
    borderBottom: "1px solid #e5e7eb",
  },
  tableCell: {
    padding: "12px 16px",
    fontSize: 14,
    fontWeight: "500",
    color: "#000000",
    borderBottom: "1px solid #f0f0f0",
  },
};

