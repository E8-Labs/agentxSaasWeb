import Apis from '@/components/apis/Apis';
import { CircularProgress } from '@mui/material';
import axios from 'axios';
import React, { useEffect, useState } from 'react';
import moment from 'moment';

function AdminTransactions() {
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [summary, setSummary] = useState({});
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    dateFilter: 'all',
    startDate: '',
    endDate: '',
    search: ''
  });

  const typeOptions = ['all', 'Xbar', 'Plan', 'Phone', 'Enrichment', 'DNC', 'Seat'];
  const statusOptions = ['all', 'pending', 'completed', 'failed', 'refunded'];
  const dateOptions = [
    { value: 'all', label: 'All Time' },
    { value: 'last7Days', label: 'Last 7 Days' },
    { value: 'last30Days', label: 'Last 30 Days' },
    { value: 'customRange', label: 'Custom Range' }
  ];

  useEffect(() => {
    getTransactions();
  }, [filters, page]);

  const getTransactions = async (resetData = false) => {
    try {
      setLoading(true);

      const localData = localStorage.getItem("User");
      const AuthToken = localData ? JSON.parse(localData).token : null;

      // Build query parameters
      const params = new URLSearchParams({
        page: resetData ? 1 : page,
        limit: 50,
        ...filters
      });

      // Remove empty values
      Object.keys(filters).forEach(key => {
        if (!filters[key] || filters[key] === 'all') {
          params.delete(key);
        }
      });

      const ApiPath = `${Apis.getAdminTransactions}?${params.toString()}`;

      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: `Bearer ${AuthToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data?.status && response.data?.data) {
        const newData = response.data.data.transactions;
        const newSummary = response.data.data.summary;
        
        console.log('Transactions response:', response.data);

        if (resetData) {
          setTransactions(newData);
          setPage(1);
        } else {
          setTransactions(prev => [...prev, ...newData]);
        }
        
        setSummary(newSummary);
        setHasMore(newData.length === 50);
      }
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPage(1);
    setTransactions([]);
  };

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-600';
      case 'pending': return 'text-yellow-600';
      case 'failed': return 'text-red-600';
      case 'refunded': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const getTypeColor = (type) => {
    switch (type) {
      case 'Plan': return 'bg-blue-100 text-blue-800';
      case 'Xbar': return 'bg-purple-100 text-purple-800';
      case 'Phone': return 'bg-green-100 text-green-800';
      case 'Enrichment': return 'bg-orange-100 text-orange-800';
      case 'DNC': return 'bg-red-100 text-red-800';
      case 'Seat': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="w-full items-start">
      <div className="py-4 px-10" style={{ fontSize: 24, fontWeight: "600" }}>
        Transactions
      </div>

      {/* Summary Cards */}
      {summary.totalTransactions > 0 && (
        <div className="px-10 mb-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 shadow">
              <div className="text-sm text-gray-600">Total Transactions</div>
              <div className="text-2xl font-bold">{summary.totalTransactions}</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow">
              <div className="text-sm text-gray-600">Total Amount</div>
              <div className="text-2xl font-bold text-green-600">{formatCurrency(summary.totalAmount)}</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow">
              <div className="text-sm text-gray-600">Agency Net</div>
              <div className="text-2xl font-bold text-blue-600">{formatCurrency(summary.totalAgencyNet)}</div>
            </div>
            <div className="bg-white rounded-lg p-4 shadow">
              <div className="text-sm text-gray-600">Platform Fees</div>
              <div className="text-2xl font-bold text-purple-600">{formatCurrency(summary.totalPlatformFees)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="px-10 mb-6">
        <div className="bg-white rounded-lg p-4 shadow">
          <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {/* Type Filter */}
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="border rounded-lg px-3 py-2"
            >
              {typeOptions.map(type => (
                <option key={type} value={type}>
                  {type === 'all' ? 'All Types' : type}
                </option>
              ))}
            </select>

            {/* Status Filter */}
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="border rounded-lg px-3 py-2"
            >
              {statusOptions.map(status => (
                <option key={status} value={status}>
                  {status === 'all' ? 'All Statuses' : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>

            {/* Date Filter */}
            <select
              value={filters.dateFilter}
              onChange={(e) => handleFilterChange('dateFilter', e.target.value)}
              className="border rounded-lg px-3 py-2"
            >
              {dateOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>

            {/* Custom Date Range */}
            {filters.dateFilter === 'customRange' && (
              <>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="border rounded-lg px-3 py-2"
                  placeholder="mm/dd/yyyy"
                  pattern="[0-9]{2}/[0-9]{2}/[0-9]{4}"
                />
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="border rounded-lg px-3 py-2"
                  placeholder="mm/dd/yyyy"
                  pattern="[0-9]{2}/[0-9]{2}/[0-9]{4}"
                />
              </>
            )}

            {/* Search */}
            <input
              type="text"
              placeholder="Search agency or subaccount..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="border rounded-lg px-3 py-2 col-span-2"
            />
          </div>
        </div>
      </div>

      {/* Table Header */}
      <div className="w-full flex flex-row mt-3 px-10 bg-gray-50 py-3">
        <div className="w-2/12"><div style={styles.header}>Agency Name</div></div>
        <div className="w-2/12"><div style={styles.header}>Subaccount Name</div></div>
        <div className="w-1/12"><div style={styles.header}>Amount</div></div>
        <div className="w-2/12"><div style={styles.header}>Product</div></div>
        <div className="w-1/12"><div style={styles.header}>Type</div></div>
        <div className="w-1/12"><div style={styles.header}>Stripe Fee</div></div>
        <div className="w-1/12"><div style={styles.header}>Collected</div></div>
        {/* <div className="w-1/12"><div style={styles.header}>Status</div></div> */}
        <div className="w-1/12"><div style={styles.header}>Date</div></div>
      </div>

      {/* Table Content */}
      <div className="h-[60vh] overflow-auto" id="transactionsScrollDiv">
        {transactions.length > 0 ? (
          transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="w-full flex flex-row items-center px-10 hover:bg-[#402FFF05] py-3 border-b"
            >
              <div className="w-2/12">
                <div 
                  style={styles.cellLink}
                  className="cursor-pointer hover:text-blue-600"
                  onClick={() => {
                    // TODO: Redirect to agency details
                    console.log('Navigate to agency:', transaction.agencyId);
                  }}
                >
                  {transaction.agencyName}
                </div>
              </div>

              <div className="w-2/12">
                <div 
                  style={styles.cellLink}
                  className="cursor-pointer hover:text-blue-600"
                  onClick={() => {
                    // TODO: Redirect to subaccount details
                    console.log('Navigate to subaccount:', transaction.subaccountId);
                  }}
                >
                  {transaction.subaccountName}
                </div>
              </div>

              <div className="w-1/12">
                <div style={styles.cell}>{formatCurrency(transaction.amountPaid)}</div>
              </div>

              <div className="w-2/12">
                <div style={styles.cell}>{transaction.productName}</div>
              </div>

              <div className="w-1/12">
                <span className={`px-2 py-1 rounded-full text-xs ${getTypeColor(transaction.type)}`}>
                  {transaction.type}
                </span>
              </div>

              <div className="w-1/12">
                <div style={styles.cell}>{formatCurrency(transaction.stripeFee)}</div>
              </div>

              <div className="w-1/12">
                <div style={styles.cell}>{formatCurrency(transaction.collected)}</div>
              </div>

              {/*<div className="w-1/12">
                <div className={`${styles.cell} ${getStatusColor(transaction.status)}`}>
                  {transaction.status.charAt(0).toUpperCase() + transaction.status.slice(1)}
                </div>
              </div>*/}

              <div className="w-1/12">
                <div style={styles.cell}>
                  {moment(transaction.date).format("MM/DD/YYYY")}
                </div>
              </div>
            </div>
          ))
        ) : (
          !loading && (
            <div className="text-center mt-8" style={{ fontWeight: "bold", fontSize: 20 }}>
              No transactions found
            </div>
          )
        )}

        {/* Load More Button */}
        {hasMore && transactions.length > 0 && (
          <div className="w-full flex justify-center py-4">
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
            >
              {loading ? <CircularProgress size={20} color="inherit" /> : 'Load More'}
            </button>
          </div>
        )}

        {/* Loading Indicator */}
        {loading && transactions.length === 0 && (
          <div className="w-full flex justify-center mt-8">
            <CircularProgress size={35} />
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminTransactions;

const styles = {
  header: {
    fontSize: 15,
    color: "#00000090",
    fontWeight: "600",
  },
  cell: {
    fontSize: 14,
    color: "#000000",
    fontWeight: "500",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  cellLink: {
    fontSize: 14,
    color: "#000000",
    fontWeight: "500",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    textDecoration: 'underline',
  },
};