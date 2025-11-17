"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Plus, Trash2, Eye, X } from "lucide-react";
import PromoCodeModal from "./PromoCodeModal";
import axios from "axios";
import Apis from "@/components/apis/Apis";
import { CircularProgress } from "@mui/material";
import moment from "moment";

const AdminPromoCodes = () => {
  const [promoCodes, setPromoCodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPromoCode, setEditingPromoCode] = useState(null);
  const [selectedPromoCode, setSelectedPromoCode] = useState(null);
  const [showUsageModal, setShowUsageModal] = useState(false);
  const [usageData, setUsageData] = useState(null);
  const [usageLoading, setUsageLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [totalPages, setTotalPages] = useState(1);
  const [filters, setFilters] = useState({
    isActive: null,
    promoType: null,
  });

  // Get auth token
  const getAuthToken = () => {
    const localData = localStorage.getItem("User");
    return localData ? JSON.parse(localData).token : null;
  };

  // Fetch promo codes
  const fetchPromoCodes = async () => {
    try {
      setLoading(true);
      const authToken = getAuthToken();
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });

      if (filters.isActive !== null) {
        params.append("isActive", filters.isActive.toString());
      }
      if (filters.promoType) {
        params.append("promoType", filters.promoType);
      }

      const response = await axios.get(`${Apis.getPromoCodes}?${params.toString()}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data?.status) {
        // Handle different response structures
        const data = response.data.data;
        if (Array.isArray(data)) {
          setPromoCodes(data);
        } else if (data?.promoCodes) {
          setPromoCodes(data.promoCodes);
          if (data.totalPages) {
            setTotalPages(data.totalPages);
          }
        } else {
          setPromoCodes([]);
        }
      }
    } catch (error) {
      console.error("Error fetching promo codes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromoCodes();
  }, [page, filters]);

  const handleEdit = (promoCode) => {
    setEditingPromoCode(promoCode);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingPromoCode(null);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingPromoCode(null);
    fetchPromoCodes();
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this promo code?")) {
      return;
    }

    try {
      const authToken = getAuthToken();
      await axios.delete(`${Apis.deletePromoCode}/${id}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });
      fetchPromoCodes();
    } catch (error) {
      console.error("Error deleting promo code:", error);
      alert("Error deleting promo code. Please try again.");
    }
  };

  const handleViewUsage = async (promoCode) => {
    setSelectedPromoCode(promoCode);
    setShowUsageModal(true);
    setUsageLoading(true);
    setUsageData(null);

    try {
      const authToken = getAuthToken();
      const response = await axios.get(`${Apis.getPromoCodeUsage}/${promoCode.id}/usage`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
      });

      if (response.data?.status) {
        setUsageData(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching usage data:", error);
    } finally {
      setUsageLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "N/A";
    return moment(date).format("MMM DD, YYYY");
  };

  const getDiscountDisplay = (promoCode) => {
    if (promoCode.promoType === "minutes") {
      return `${promoCode.redeemableMinutes || 0} minutes`;
    }
    if (promoCode.promoType === "discount") {
      if (promoCode.discountType === "percentage") {
        return `${promoCode.discountValue}% off`;
      } else if (promoCode.discountType === "flat_amount") {
        return `$${promoCode.discountValue} off`;
      }
    }
    return "N/A";
  };

  const getDurationDisplay = (promoCode) => {
    if (promoCode.promoType === "discount") {
      if (!promoCode.discountDurationMonths || promoCode.discountDurationMonths === 0) {
        return "One-time";
      }
      return `${promoCode.discountDurationMonths} months`;
    }
    return "N/A";
  };

  if (loading && promoCodes.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <CircularProgress size={45} />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 h-full overflow-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Promo Codes</h1>
        <Button onClick={handleAdd} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Add New Promo Code
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <select
          value={filters.isActive ?? ""}
          onChange={(e) =>
            setFilters({
              ...filters,
              isActive: e.target.value === "" ? null : e.target.value === "true",
            })
          }
          className="px-4 py-2 border rounded-md"
        >
          <option value="">All Status</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
        <select
          value={filters.promoType ?? ""}
          onChange={(e) =>
            setFilters({
              ...filters,
              promoType: e.target.value === "" ? null : e.target.value,
            })
          }
          className="px-4 py-2 border rounded-md"
        >
          <option value="">All Types</option>
          <option value="discount">Discount</option>
          <option value="minutes">Minutes</option>
        </select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Promo Codes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Discount/Value</TableHead>
                  <TableHead>Duration</TableHead>
                  <TableHead>Redemptions</TableHead>
                  <TableHead>Expiration</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promoCodes.length > 0 ? (
                  promoCodes.map((promoCode) => (
                    <TableRow key={promoCode.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center space-x-2">
                          <span>{promoCode.code}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            promoCode.promoType === "discount"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-green-100 text-green-800"
                          }
                        >
                          {promoCode.promoType === "discount" ? "Discount" : "Minutes"}
                        </Badge>
                      </TableCell>
                      <TableCell>{getDiscountDisplay(promoCode)}</TableCell>
                      <TableCell>{getDurationDisplay(promoCode)}</TableCell>
                      <TableCell>
                        {promoCode.currentRedemptions || 0} / {promoCode.maxRedemptions || "∞"}
                      </TableCell>
                      <TableCell>{formatDate(promoCode.expirationDate)}</TableCell>
                      <TableCell>
                        <Badge variant={promoCode.isActive ? "default" : "secondary"}>
                          {promoCode.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(promoCode.createdAt)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(promoCode)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewUsage(promoCode)}
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(promoCode.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-gray-500">
                      No promo codes found
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {showModal && (
        <PromoCodeModal
          promoCode={editingPromoCode}
          onClose={handleModalClose}
        />
      )}

      {/* Usage Modal */}
      {showUsageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-xl font-semibold">
                Usage Details - {selectedPromoCode?.code}
              </h2>
              <Button variant="ghost" onClick={() => setShowUsageModal(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="p-6">
              {usageLoading ? (
                <div className="flex justify-center py-8">
                  <CircularProgress size={35} />
                </div>
              ) : usageData ? (
                <div className="space-y-6">
                  {/* Summary */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Total Redemptions</p>
                          <p className="text-2xl font-bold">
                            {usageData.summary?.totalRedemptions || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Total Discount Given</p>
                          <p className="text-2xl font-bold">
                            ${(usageData.summary?.totalDiscountGiven || 0).toFixed(2)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Active Subscriptions</p>
                          <p className="text-2xl font-bold">
                            {usageData.summary?.activeSubscriptions || 0}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Expired Subscriptions</p>
                          <p className="text-2xl font-bold">
                            {usageData.summary?.expiredSubscriptions || 0}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Active Tracking */}
                  {usageData.activeTracking && usageData.activeTracking.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Active Subscriptions</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>User</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Discount</TableHead>
                              <TableHead>Months Remaining</TableHead>
                              <TableHead>Total Discount Given</TableHead>
                              <TableHead>Next Charge Date</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {usageData.activeTracking.map((tracking) => (
                              <TableRow key={tracking.id}>
                                <TableCell>{tracking.userName || "N/A"}</TableCell>
                                <TableCell>{tracking.userEmail || "N/A"}</TableCell>
                                <TableCell>
                                  {tracking.discountType === "percentage"
                                    ? `${tracking.discountValue}%`
                                    : `$${tracking.discountValue}`}
                                </TableCell>
                                <TableCell>{tracking.monthsRemaining || 0}</TableCell>
                                <TableCell>${(tracking.totalDiscountGiven || 0).toFixed(2)}</TableCell>
                                <TableCell>
                                  {formatDate(tracking.nextChargeDate)}
                                </TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  )}

                  {/* Redemptions History */}
                  {usageData.redemptions && usageData.redemptions.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Redemption History</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead>User</TableHead>
                              <TableHead>Email</TableHead>
                              <TableHead>Type</TableHead>
                              <TableHead>Discount Applied</TableHead>
                              <TableHead>Redeemed At</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {usageData.redemptions.map((redemption, index) => (
                              <TableRow key={index}>
                                <TableCell>{redemption.userName || "N/A"}</TableCell>
                                <TableCell>{redemption.userEmail || "N/A"}</TableCell>
                                <TableCell>{redemption.redemptionType || "N/A"}</TableCell>
                                <TableCell>
                                  ${(redemption.discountApplied || 0).toFixed(2)}
                                </TableCell>
                                <TableCell>{formatDate(redemption.redeemedAt)}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  No usage data available
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPromoCodes;

