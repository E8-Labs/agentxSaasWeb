import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Apis from '@/components/apis/Apis';

const AdminUpcomingCharges = () => {
  const [charges, setCharges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    type: 'all',
    daysAhead: 30,
    limit: 100,
    offset: 0
  });
  const [summary, setSummary] = useState({
    total: 0,
    subscription_count: 0,
    low_balance_count: 0
  });

  const fetchUpcomingCharges = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const baseURL = Apis.getUpcomingPayments
      const params = new URLSearchParams({
        limit: filters.limit,
        offset: filters.offset,
        type: filters.type,
        days_ahead: filters.daysAhead
      });
      let AuthToken = null;
      const LocalData = localStorage.getItem("User");
      
      if (LocalData) {
        const UserDetails = JSON.parse(LocalData);
        AuthToken = UserDetails.token;
      }
      // console.log('token ', AuthToken)
      
      const response = await axios.get(`${baseURL}?${params}`, {
        headers: {
          'Authorization': `Bearer ${AuthToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.data.status) {
        setCharges(response.data.data || []);
        setSummary({
          total: response.data.total || 0,
          subscription_count: response.data.subscription_count || 0,
          low_balance_count: response.data.low_balance_count || 0
        });
      } else {
        setError('Failed to fetch upcoming charges');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data');
      console.error('Error fetching upcoming charges:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUpcomingCharges();
  }, [filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value, offset: 0 }));
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      default: return 'text-green-600 bg-green-100';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto h-full overflow-y-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Upcoming Charges</h1>
        <p className="text-gray-600">Monitor upcoming subscription renewals and low balance recharges</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-700">Total Upcoming</h3>
          <p className="text-2xl font-bold text-purple-600">{summary.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-700">Subscription Renewals</h3>
          <p className="text-2xl font-bold text-blue-600">{summary.subscription_count}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="text-lg font-semibold text-gray-700">Low Balance Users</h3>
          <p className="text-2xl font-bold text-orange-600">{summary.low_balance_count}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Filter Type</label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange('type', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="all">All</option>
              <option value="subscription">Subscription Only</option>
              <option value="low_balance">Low Balance Only</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Days Ahead</label>
            <select
              value={filters.daysAhead}
              onChange={(e) => handleFilterChange('daysAhead', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value={3}>3 Days</option>
              <option value={7}>7 Days</option>
              <option value={14}>14 Days</option>
              <option value={30}>30 Days</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Results per page</label>
            <select
              value={filters.limit}
              onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>
          <div className="flex items-end">
            <button
              onClick={() => fetchUpcomingCharges()}
              className="w-full px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* Charges Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto max-h-[60vh] overflow-y-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Charge Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Charge Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Days Until</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Urgency</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Minutes Available</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {charges.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500">
                    No upcoming charges found
                  </td>
                </tr>
              ) : (
                charges.map((charge, index) => (
                  <tr key={charge.id || index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{charge.name}</div>
                        <div className="text-sm text-gray-500">{charge.email}</div>
                        <div className="text-xs text-gray-400">{charge.userRole}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        charge.chargeType === 'subscription_renewal' 
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-orange-100 text-orange-800'
                      }`}>
                        {charge.chargeType === 'subscription_renewal' ? 'Subscription' : 'Low Balance'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(charge.nextChargeDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatAmount(charge.estimatedAmount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {charge.daysUntilCharge} days
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getUrgencyColor(charge.urgency)}`}>
                        {charge.urgency || 'normal'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {Math.round(charge.totalSecondsAvailable / 60)} min
                      {charge.smartRefill && (
                        <span className="ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Smart Refill
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {summary.total > filters.limit && (
        <div className="mt-6 flex justify-between items-center">
          <div className="text-sm text-gray-700">
            Showing {filters.offset + 1} to {Math.min(filters.offset + filters.limit, summary.total)} of {summary.total} results
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleFilterChange('offset', Math.max(0, filters.offset - filters.limit))}
              disabled={filters.offset === 0}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>
            <button
              onClick={() => handleFilterChange('offset', filters.offset + filters.limit)}
              disabled={filters.offset + filters.limit >= summary.total}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUpcomingCharges;