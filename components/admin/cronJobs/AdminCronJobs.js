import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { RefreshCw, Play, AlertTriangle, CheckCircle, Clock, XCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import Apis from '@/components/apis/Apis';

function AdminCronJobs({ isActive = true }) {
  const [cronJobs, setCronJobs] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [restarting, setRestarting] = useState({});

  useEffect(() => {
    fetchCronJobs();
    
    // Auto-refresh every 10 seconds when component is visible and active
    const interval = setInterval(() => {
      // Only refresh if the document is visible (user is on this tab) and component is active
      if (!document.hidden && isActive) {
        fetchCronJobs();
      }
    }, 10000);
    
    // Also refresh when user comes back to the tab
    const handleVisibilityChange = () => {
      if (!document.hidden && isActive) {
        fetchCronJobs();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isActive]);

  // Fetch data when component becomes active
  useEffect(() => {
    if (isActive) {
      fetchCronJobs();
    }
  }, [isActive]);

  const fetchCronJobs = async () => {
    // Don't fetch if component is not active
    if (!isActive) return;
    
    try {
      setRefreshing(true);
      const localData = localStorage.getItem("User");
      const AuthToken = localData ? JSON.parse(localData).token : null;

      if (!AuthToken) {
        toast({
          title: "Authentication Error",
          description: "Please log in again",
          variant: "destructive",
        });
        return;
      }

      const response = await axios.get(Apis.getCronStatus, {
        headers: {
          Authorization: `Bearer ${AuthToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data?.status && response.data?.data) {
        setCronJobs(response.data.data.jobs || []);
        setSummary(response.data.data.summary || null);
      }
    } catch (error) {
      console.error("Error fetching cron jobs:", error);
      toast({
        title: "Error",
        description: "Failed to fetch cron jobs data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const restartCronJob = async (processType, jobName) => {
    try {
      setRestarting(prev => ({ ...prev, [processType]: true }));
      
      const localData = localStorage.getItem("User");
      const AuthToken = localData ? JSON.parse(localData).token : null;

      const response = await axios.post(
        `${Apis.restartCronJob}/${processType}`,
        {
          reason: `Manual restart by admin for ${jobName}`
        },
        {
          headers: {
            Authorization: `Bearer ${AuthToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.data?.status) {
        toast({
          title: "Success",
          description: response.data.message || "Cron job restarted successfully",
        });
        // Refresh data after restart
        await fetchCronJobs();
      } else {
        throw new Error(response.data?.message || "Failed to restart cron job");
      }
    } catch (error) {
      console.error("Error restarting cron job:", error);
      toast({
        title: "Error",
        description: error.response?.data?.message || "Failed to restart cron job",
        variant: "destructive",
      });
    } finally {
      setRestarting(prev => ({ ...prev, [processType]: false }));
    }
  };

  const getStatusIcon = (status, healthStatus) => {
    if (status === 'running') {
      return <Clock className="h-4 w-4 text-blue-500" />;
    } else if (healthStatus === 'critical') {
      return <XCircle className="h-4 w-4 text-red-500" />;
    } else if (healthStatus === 'warning') {
      return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    } else {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
  };

  const getStatusBadge = (status, healthStatus) => {
    if (status === 'running') {
      return <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">Running</span>;
    } else if (healthStatus === 'critical') {
      return <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">Critical</span>;
    } else if (healthStatus === 'warning') {
      return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full">Warning</span>;
    } else {
      return <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">Healthy</span>;
    }
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  };

  const shouldShowRestartButton = (job) => {
    return job.healthStatus === 'critical' || 
           job.status === 'stuck' || 
           (job.elapsedTimeMinutes && job.elapsedTimeMinutes > 10);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading cron jobs...</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full overflow-hidden">
      {/* Summary Cards */}
      {summary && (
        <div className="w-full flex flex-row gap-4 px-10 py-4">
          <div className="flex-1 bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600">Total Jobs</div>
                <div className="text-2xl font-bold">{summary.totalJobs}</div>
              </div>
              <CheckCircle className="h-6 w-6 text-gray-400" />
            </div>
          </div>
          
          <div className="flex-1 bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600">Running</div>
                <div className="text-2xl font-bold text-blue-600">{summary.runningJobs}</div>
              </div>
              <Clock className="h-6 w-6 text-blue-500" />
            </div>
          </div>
          
          <div className="flex-1 bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600">Critical</div>
                <div className="text-2xl font-bold text-red-600">{summary.criticalJobs}</div>
              </div>
              <XCircle className="h-6 w-6 text-red-500" />
            </div>
          </div>
          
          <div className="flex-1 bg-white p-4 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-600">Healthy</div>
                <div className="text-2xl font-bold text-green-600">{summary.healthyJobs}</div>
              </div>
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
          </div>
        </div>
      )}

      {/* Header with Refresh Button */}
      <div className="w-full flex justify-between items-center px-10 py-4">
        <div className="flex items-center space-x-3">
          <h1 className="text-2xl font-bold">Cron Jobs Status</h1>
          {isActive && (
            <div className="flex items-center space-x-1 text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span>Auto-refreshing every 10s</span>
            </div>
          )}
        </div>
        <button 
          onClick={fetchCronJobs} 
          disabled={refreshing}
          className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Cron Jobs Table */}
      <div className="w-full px-10">
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          {/* Table Header */}
          <div className="w-full flex flex-row bg-gray-50 py-3 px-4">
            <div className="w-1/8"><div className="text-sm font-semibold text-gray-600">Status</div></div>
            <div className="w-1/6"><div className="text-sm font-semibold text-gray-600">Job Name</div></div>
            <div className="w-1/6"><div className="text-sm font-semibold text-gray-600">Process Type</div></div>
            <div className="w-1/6"><div className="text-sm font-semibold text-gray-600">Last Run</div></div>
            <div className="w-1/6"><div className="text-sm font-semibold text-gray-600">Next Run</div></div>
            <div className="w-1/12"><div className="text-sm font-semibold text-gray-600">Elapsed</div></div>
            <div className="w-1/4"><div className="text-sm font-semibold text-gray-600">Description</div></div>
            <div className="w-1/12"><div className="text-sm font-semibold text-gray-600">Actions</div></div>
          </div>

          {/* Table Content */}
          <div className="h-[60vh] overflow-auto">
            {cronJobs.map((job, index) => (
              <div key={index} className="w-full flex flex-row py-3 px-4 border-b border-gray-100 hover:bg-gray-50">
                <div className="w-1/8 flex items-center">
                  <div className="flex items-center space-x-2">
                    {getStatusIcon(job.status, job.healthStatus)}
                    {getStatusBadge(job.status, job.healthStatus)}
                  </div>
                </div>
                <div className="w-1/6 flex items-center">
                  <div className="text-sm font-medium">{job.name}</div>
                </div>
                <div className="w-1/6 flex items-center">
                  <div className="text-sm text-gray-600">{job.processType}</div>
                </div>
                <div className="w-1/6 flex items-center">
                  <div className="text-sm">{formatDateTime(job.lastRunTime)}</div>
                </div>
                <div className="w-1/6 flex items-center">
                  <div className="text-sm">{formatDateTime(job.nextExpectedRun)}</div>
                </div>
                <div className="w-1/12 flex items-center">
                  <div className="text-sm">
                    {job.elapsedTimeMinutes ? `${job.elapsedTimeMinutes} min` : 'N/A'}
                  </div>
                </div>
                <div className="w-1/4 flex items-center">
                  <div className="text-sm text-gray-600 truncate" title={job.description}>
                    {job.description}
                  </div>
                </div>
                <div className="w-1/12 flex items-center">
                  {shouldShowRestartButton(job) && (
                    <button
                      onClick={() => restartCronJob(job.processType, job.name)}
                      disabled={restarting[job.processType]}
                      className="flex items-center px-3 py-1 bg-red-50 hover:bg-red-100 text-red-600 text-xs rounded-lg disabled:opacity-50"
                    >
                      <Play className="h-3 w-3 mr-1" />
                      {restarting[job.processType] ? 'Restarting...' : 'Restart'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {cronJobs.length === 0 && !loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">No cron jobs found</p>
        </div>
      )}
    </div>
  );
}

export default AdminCronJobs;
