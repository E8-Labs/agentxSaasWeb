"use client";
import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit, Plus, Trash2, Eye } from "lucide-react";
import PlanModal from "./PlanModal";
import { PlanApiService } from "@/utilities/PlanApiService";

const AgentXPlans = () => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);

  // Fetch AgentX plans
  const fetchPlans = async () => {
    try {
      setLoading(true);
      const data = await PlanApiService.getAgentXPlans();
      console.log('AgentX Plans API Response:', data);
      setPlans(data.data || []);
    } catch (error) {
      console.error('Error fetching plans:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingPlan(null);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingPlan(null);
    fetchPlans(); // Refresh the list
  };

  const formatPrice = (price) => {
    if (price === null || price === undefined || isNaN(price)) {
      return 'Free';
    }
    return `$${Number(price).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'N/A';
    return date.toLocaleDateString('en-US', {
      month: '2-digit',
      day: '2-digit',
      year: 'numeric'
    });
  };

  const getBillingCycleBadge = (cycle) => {
    const colors = {
      monthly: 'bg-blue-100 text-blue-800',
      quarterly: 'bg-green-100 text-green-800',
      yearly: 'bg-purple-100 text-purple-800'
    };
    return colors[cycle] || 'bg-gray-100 text-gray-800';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading plans...</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">AssignX Plans</h1>
        <Button onClick={handleAdd} className="bg-purple-600 hover:bg-purple-700">
          <Plus className="w-4 h-4 mr-2" />
          Add New Plan
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All AssignX Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Plan Name</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Billing Cycle</TableHead>
                  <TableHead>Status</TableHead>
                  {/* <TableHead>Tag</TableHead> */}
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {plans.map((plan) => {
                  console.log('Individual AgentX Plan:', plan);
                  return (
                  <TableRow key={plan.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center space-x-2">
                        <span>{plan.name || 'No Title'}</span>
                        {plan.isActive && (
                          <Badge variant="outline" className="text-green-600 border-green-600">
                            Active
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {plan.planDescription || 'No Description'}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-lg">
                          {formatPrice(plan.price || plan.totalPrice)}
                        </span>
                        {plan.originalPrice && plan.originalPrice !== (plan.price || plan.totalPrice) && (
                          <span className="text-sm text-gray-500 line-through">
                            {formatPrice(plan.originalPrice)}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getBillingCycleBadge(plan.billingCycle)}>
                        {plan.billingCycle?.charAt(0).toUpperCase() + plan.billingCycle?.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={plan.isActive ? "default" : "secondary"}>
                        {"Active"}
                      </Badge>
                    </TableCell>
                    {/* <TableCell>
                      {plan.tag ? (
                        <Badge variant="outline" className="bg-yellow-100 text-yellow-800">
                          {plan.tag}
                        </Badge>
                      ) : (
                        <span className="text-gray-400">No Tag</span>
                      )}
                    </TableCell> */}
                    <TableCell>
                        Sep 1, 2025
                      {/* {formatDate(plan.createdAt)} */}
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(plan)}
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            // Handle view details
                            console.log('View plan:', plan);
                          }}
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {showModal && (
        <PlanModal
          plan={editingPlan}
          onClose={handleModalClose}
          planType="agentx"
        />
      )}
    </div>
  );
};

export default AgentXPlans;
