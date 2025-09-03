"use client";
import React, { useEffect, useState } from "react";
import axios from "axios";
import Apis from "@/components/apis/Apis";
import { Box, CircularProgress, Modal } from '@mui/material';
import { GetFormattedDateString } from "@/utilities/utility";
import InfiniteScroll from "react-infinite-scroll-component";

function UserActivityLogs({ open, onClose, userId, userName }) {
  const [loading, setLoading] = useState(false);
  const [activityLogs, setActivityLogs] = useState([]);
  const [pagination, setPagination] = useState({
    totalItems: 0,
    counts: {
      apiCalls: 0,
      paymentTransactions: 0,
      callBatches: 0
    }
  });
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const limitPerLoad = 50;
  
  // Cache for storing activity logs data
  const [cache, setCache] = useState({});
  const [cacheTimestamp, setCacheTimestamp] = useState(0);
  const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds

  useEffect(() => {
    if (open && userId) {
      console.log('Modal opened for userId:', userId);
      // Check if we have valid cached data
      if (cache[userId] && (Date.now() - cacheTimestamp) < CACHE_DURATION) {
        console.log('Using cached data');
        setActivityLogs(cache[userId].logs || []);
        setPagination(cache[userId].pagination || {});
        setHasMore(cache[userId].hasMore || false);
        setOffset(cache[userId].offset || 0);
      } else {
        console.log('Fetching fresh data');
        // Clear cache and fetch fresh data
        setCache({});
        setCacheTimestamp(0);
        setActivityLogs([]);
        setOffset(1);
        setHasMore(true);
        fetchActivityLogs(1);
      }
    }
    
    // Clear cache when modal closes
    if (!open) {
      console.log('Modal closed, clearing cache');
      setCache({});
      setCacheTimestamp(0);
      setActivityLogs([]);
      setOffset(1);
      setHasMore(true);
    }
  }, [open, userId]);

  // Debug useEffect to monitor state changes
  useEffect(() => {
    console.log('State changed:', { 
      activityLogsLength: activityLogs.length, 
      hasMore, 
      offset, 
      loading 
    });
  }, [activityLogs.length, hasMore, offset, loading]);

  // Monitor scroll position and manually trigger loadMore if needed
  useEffect(() => {
    const scrollableDiv = document.getElementById('scrollableDiv');
    if (scrollableDiv && hasMore && !loading) {
      const handleScroll = () => {
        const { scrollTop, scrollHeight, clientHeight } = scrollableDiv;
        const scrollPercentage = (scrollTop + clientHeight) / scrollHeight;
        
        if (scrollPercentage > 0.8) {
          console.log('Scroll threshold reached, triggering loadMore');
          loadMore();
        }
      };
      
      scrollableDiv.addEventListener('scroll', handleScroll);
      return () => scrollableDiv.removeEventListener('scroll', handleScroll);
    }
  }, [hasMore, loading, offset]);

  const fetchActivityLogs = async (currentPage = 1) => {
    try {
      console.log('fetchActivityLogs called with page:', currentPage);
      setLoading(true);
      
      // Add a timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.log('API call timeout after 2 minutes');
        setLoading(false);
      }, 120000);
      
      const data = localStorage.getItem("User");
      if (data) {
        let u = JSON.parse(data);
        // Use page parameter as the API expects it
        const apiPath = `${Apis.getUsers.replace('/users', '/user-activity-logs')}?userId=${userId}&page=${currentPage}&limit=${limitPerLoad}`;
        console.log('API Path:', apiPath);
        
        const response = await axios.get(apiPath, {
          headers: {
            Authorization: "Bearer " + u.token,
          },
        });

        console.log('API Response:', response.data);
        console.log('Response status:', response.status);
        console.log('Response headers:', response.headers);
        setLoading(false);
        if (response.data?.status) {
          const newLogs = response.data.data.activities || [];
          const newPagination = response.data.data.pagination || {};
          
          console.log('New logs received:', newLogs.length, 'Current page:', currentPage);
          console.log('Response structure:', response.data.data);
          
          if (currentPage === 1) {
            // First load - replace all data
            setActivityLogs(newLogs);
            setOffset(2); // Next page to load
          } else {
            // Append new data
            setActivityLogs(prev => [...prev, ...newLogs]);
            setOffset(currentPage + 1); // Next page to load
          }
          
          setPagination(newPagination);
          // Use hasNextPage from the API response
          const hasMoreData = newPagination.hasNextPage || false;
          setHasMore(hasMoreData);
          
          console.log('Updated state:', { 
            hasMore: hasMoreData, 
            currentPage: currentPage,
            totalItems: newPagination.totalItems || 0,
            hasNextPage: newPagination.hasNextPage
          });
          
          // Cache the data
          const cacheData = {
            logs: currentPage === 1 ? newLogs : [...(cache[userId]?.logs || []), ...newLogs],
            pagination: newPagination,
            hasMore: hasMoreData,
            offset: currentPage + 1
          };
          
          setCache(prev => ({
            ...prev,
            [userId]: cacheData
          }));
          setCacheTimestamp(Date.now());
        } else {
          console.log('API response status is false:', response.data);
        }
      }
    } catch (error) {
      console.error("Error fetching activity logs:", error);
      console.error("Error details:", {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        config: error.config
      });
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  const loadMore = () => {
    console.log('loadMore called:', { loading, hasMore, offset, currentLength: activityLogs.length });
    if (!loading && hasMore) {
      console.log('Calling fetchActivityLogs with page:', offset);
      fetchActivityLogs(offset);
    } else {
      console.log('loadMore blocked:', { loading, hasMore });
    }
  };

  const getActivityTypeIcon = (action) => {
    switch (action) {
      case "API Call":
        return "🔌";
      case "Payment Transaction":
        return "💳";
      case "Call Batch":
        return "📞";
      default:
        return "📝";
    }
  };

  const getStatusColor = (httpStatus) => {
    if (httpStatus >= 200 && httpStatus < 300) return "text-green-600";
    if (httpStatus >= 400 && httpStatus < 500) return "text-yellow-600";
    if (httpStatus >= 500) return "text-red-600";
    return "text-gray-600";
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      BackdropProps={{
        timeout: 200,
        sx: {
          backgroundColor: "#00000020",
          zIndex: 1200,
        },
      }}
      sx={{
        zIndex: 1300,
      }}
    >
      <Box
        className="w-11/12 max-h-[90vh] p-8 rounded-[15px] overflow-y-auto"
        sx={{
          height: "auto",
          bgcolor: "transparent",
          p: 2,
          mx: "auto",
          my: "5vh",
          transform: "translateY(-5%)",
          borderRadius: 2,
          border: "none",
          outline: "none",
          backgroundColor: "white",
          position: "relative",
          zIndex: 1301,
        }}
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Activity Logs</h2>
            <p className="text-gray-600">User: {userName}</p>
            {cache[userId] && (Date.now() - cacheTimestamp) < CACHE_DURATION && (
              <p className="text-xs text-green-600 mt-1">
                Data cached • Expires in {Math.ceil((CACHE_DURATION - (Date.now() - cacheTimestamp)) / 1000 / 60)} minutes
              </p>
            )}
          </div>
          {/* <div className="flex items-center gap-3">
            <button
              onClick={() => {
                setCache({});
                setCacheTimestamp(0);
                setActivityLogs([]);
                setOffset(1);
                setHasMore(true);
                fetchActivityLogs(1);
              }}
              className="px-3 py-1 text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md transition-colors"
              title="Refresh data (clear cache)"
            >
              Refresh
            </button>
            <button
              onClick={loadMore}
              className="px-3 py-1 text-xs bg-green-100 hover:bg-green-200 text-green-700 rounded-md transition-colors"
              title="Test loadMore function"
              disabled={loading || !hasMore}
            >
              Test Load More
            </button>
            <button
              onClick={() => {
                // Add some dummy data to test infinite scroll
                const dummyData = Array.from({ length: 20 }, (_, i) => ({
                  id: `dummy-${Date.now()}-${i}`,
                  action: "Test Action",
                  description: `Dummy description ${i}`,
                  dateTime: new Date().toISOString(),
                  details: { 
                    method: "GET", 
                    httpStatus: 200,
                    ipAddress: `192.168.1.${i + 1}`,
                    duration: `${Math.floor(Math.random() * 1000)}ms`
                  }
                }));
                setActivityLogs(prev => [...prev, ...dummyData]);
                setHasMore(true);
              }}
              className="px-3 py-1 text-xs bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-md transition-colors"
              title="Add dummy data for testing"
            >
              Add Test Data
            </button>
            <button
              onClick={() => {
                // Add initial data to test infinite scroll
                const initialData = Array.from({ length: 100 }, (_, i) => ({
                  id: `initial-${i}`,
                  action: "Initial Action",
                  description: `Initial description ${i}`,
                  dateTime: new Date().toISOString(),
                  details: { 
                    method: "GET", 
                    httpStatus: 200,
                    ipAddress: `10.0.0.${i + 1}`,
                    duration: `${Math.floor(Math.random() * 2000)}ms`
                  }
                }));
                setActivityLogs(initialData);
                setHasMore(true);
                setOffset(2); // Next page to load
                console.log('Added initial data, should now be able to scroll');
              }}
              className="px-3 py-1 text-xs bg-indigo-100 hover:bg-indigo-200 text-indigo-700 rounded-md transition-colors"
              title="Add initial data for scroll testing"
            >
              Add Initial Data
            </button>
            <button
              onClick={() => {
                // Simulate scroll to bottom to trigger infinite scroll
                const scrollableDiv = document.getElementById('scrollableDiv');
                if (scrollableDiv) {
                  scrollableDiv.scrollTop = scrollableDiv.scrollHeight;
                  console.log('Manually scrolled to bottom');
                }
              }}
              className="px-3 py-1 text-xs bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-md transition-colors"
              title="Simulate scroll to bottom"
            >
              Scroll to Bottom
            </button>
            <button
              onClick={() => {
                // Test if the scrollable div exists and has content
                const scrollableDiv = document.getElementById('scrollableDiv');
                if (scrollableDiv) {
                  console.log('Scrollable div found:', {
                    scrollHeight: scrollableDiv.scrollHeight,
                    clientHeight: scrollableDiv.clientHeight,
                    scrollTop: scrollableDiv.scrollTop,
                    hasContent: scrollableDiv.children.length > 0
                  });
                } else {
                  console.log('Scrollable div not found');
                }
              }}
              className="px-3 py-1 text-xs bg-red-100 hover:bg-red-200 text-red-700 rounded-md transition-colors"
              title="Debug scrollable div"
            >
              Debug Scroll
            </button>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 text-2xl font-bold"
            >
              ×
            </button>
          </div> */}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 relative">
            <div className="text-blue-600 text-sm font-medium">API Calls</div>
            <div className="text-2xl font-bold text-blue-800">{pagination.counts.apiCalls}</div>
            {cache[userId] && (Date.now() - cacheTimestamp) < CACHE_DURATION && (
              <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full" title="Data cached"></div>
            )}
          </div>
          <div className="bg-green-50 p-4 rounded-lg border border-green-200 relative">
            <div className="text-green-600 text-sm font-medium">Payment Transactions</div>
            <div className="text-2xl font-bold text-green-800">{pagination.counts.paymentTransactions}</div>
            {cache[userId] && (Date.now() - cacheTimestamp) < CACHE_DURATION && (
              <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full" title="Data cached"></div>
            )}
          </div>
          <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 relative">
            <div className="text-purple-600 text-sm font-medium">Call Batches</div>
            <div className="text-2xl font-bold text-purple-800">{pagination.counts.callBatches}</div>
            {cache[userId] && (Date.now() - cacheTimestamp) < CACHE_DURATION && (
              <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full" title="Data cached"></div>
            )}
          </div>
          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 relative">
            <div className="text-orange-600 text-sm font-medium">Unique IPs</div>
            <div className="text-2xl font-bold text-orange-800">
              {(() => {
                const uniqueIPs = new Set();
                activityLogs.forEach(log => {
                  const ip = log.details?.ipAddress || log.details?.meta?.ip;
                  if (ip) uniqueIPs.add(ip);
                });
                return uniqueIPs.size;
              })()}
            </div>
            {cache[userId] && (Date.now() - cacheTimestamp) < CACHE_DURATION && (
              <div className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full" title="Data cached"></div>
            )}
          </div>
        </div>

        {/* Activity Logs Table with Infinite Scroll */}
        {loading && activityLogs.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <div className="flex justify-center">
              <CircularProgress size={50} sx={{ color: "#7902DF" }} />
            </div>
            <p className="text-center mt-4 text-gray-600">Loading activity logs...</p>
            <p className="text-center mt-2 text-sm text-gray-500">This may take a few moments...</p>
          </div>
        ) : activityLogs.length === 0 && !loading ? (
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            <p className="text-center text-gray-600">No activity logs found for this user.</p>
            <p className="text-center mt-2 text-sm text-gray-500">Try refreshing or check the console for errors.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="max-h-[60vh] overflow-y-auto" id="scrollableDiv">
              <InfiniteScroll
                dataLength={activityLogs.length}
                next={loadMore}
                hasMore={hasMore}
                loader={
                  <div className="w-full flex justify-center py-4">
                    <CircularProgress size={30} sx={{ color: "#7902DF" }} />
                  </div>
                }
                endMessage={
                  <div className="text-center py-4 text-gray-500">
                    {activityLogs.length > 0 ? "You've reached the end of the activity logs." : "No activity logs found."}
                  </div>
                }
                scrollableTarget="scrollableDiv"
                style={{ overflow: 'visible' }}
                onScroll={() => console.log('InfiniteScroll onScroll triggered')}
                scrollThreshold={0.8}
                onEndReached={() => console.log('InfiniteScroll onEndReached triggered')}
                onEndReachedThreshold={0.8}
              >
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0 z-10">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Action
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date & Time
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        IP Address
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Details
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {activityLogs.map((log, index) => (
                      <tr key={`${log.id}-${index}`} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-lg mr-2">{getActivityTypeIcon(log.action)}</span>
                            <span className="text-sm font-medium text-gray-900">{log.action}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{log.description}</div>
                        </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {GetFormattedDateString(log.dateTime)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {log.details?.ipAddress || log.details?.meta?.ip ? (
                              <span 
                                className="bg-gray-100 px-2 py-1 rounded text-xs font-mono"
                                title={`IP Address: ${log.details?.ipAddress || log.details?.meta?.ip}`}
                              >
                                {log.details?.ipAddress || log.details?.meta?.ip}
                              </span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">
                            {log.details && (
                              <div className="space-y-1">
                                {log.details.method && (
                                  <div className="flex items-center space-x-2">
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                                      {log.details.method}
                                    </span>
                                    {log.details.httpStatus && (
                                      <span className={`text-xs px-2 py-1 rounded ${getStatusColor(log.details.httpStatus)}`}>
                                        {log.details.httpStatus}
                                    </span>
                                    )}
                                  </div>
                                )}
                                {log.details.duration && (
                                  <div className="text-xs text-gray-500">
                                    Duration: {log.details.duration}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </InfiniteScroll>
            </div>
          </div>
        )}

        {/* Activity Logs Info */}
        <div className="text-center mt-4 text-sm text-gray-600">
          {activityLogs.length > 0 && (
            <>
              Showing {activityLogs.length} of {pagination.totalItems} total activity logs
              {cache[userId] && (Date.now() - cacheTimestamp) < CACHE_DURATION && (
                <span className="ml-2 text-green-600">(Cached)</span>
              )}
            </>
          )}
        </div>
      </Box>
    </Modal>
  );
}

export default UserActivityLogs;
