'use client'

import { CircularProgress } from '@mui/material'
import axios from 'axios'
import { X } from 'lucide-react'
import React, { useEffect, useMemo, useState } from 'react'
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
} from 'recharts'

import Apis from '@/components/apis/Apis'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

const PromoCodeModal = ({ promoCode, onClose }) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    code: '',
    promoType: 'discount', // "discount" or "minutes"
    discountType: 'percentage', // "percentage" or "flat_amount"
    discountValue: 0,
    discountDurationMonths: null, // null or 0 for one-time, > 0 for recurring
    redeemableMinutes: 0, // For minutes type
    applicableUserTypes: [],
    applicablePlans: [],
    applicableBillingCycles: [],
    maxRedemptions: null,
    expirationDate: '',
    isActive: true,
    appliesToSubscriptionsOnly: true,
  })

  const userTypes = ['Agency', 'AgencySubAccount', 'AgentX', 'All']
  const plans = ['Starter', 'Growth', 'Scale', 'Free', 'All']
  const billingCycles = ['monthly', 'quarterly', 'yearly', 'All']

  useEffect(() => {
    if (promoCode) {
      setFormData({
        code: promoCode.code || '',
        promoType: promoCode.promoType || 'discount',
        discountType: promoCode.discountType || 'percentage',
        discountValue: promoCode.discountValue || 0,
        discountDurationMonths: promoCode.discountDurationMonths ?? null,
        redeemableMinutes: promoCode.redeemableMinutes || 0,
        applicableUserTypes: promoCode.applicableUserTypes || [],
        applicablePlans: promoCode.applicablePlans || [],
        applicableBillingCycles: promoCode.applicableBillingCycles || [],
        maxRedemptions: promoCode.maxRedemptions || null,
        expirationDate: promoCode.expirationDate
          ? new Date(promoCode.expirationDate).toISOString().split('T')[0]
          : '',
        isActive: promoCode.isActive !== undefined ? promoCode.isActive : true,
        appliesToSubscriptionsOnly:
          promoCode.appliesToSubscriptionsOnly !== undefined
            ? promoCode.appliesToSubscriptionsOnly
            : true,
      })
    }
  }, [promoCode])

  // Chart data for recurring discounts
  const recurringDiscountData = useMemo(() => {
    if (
      !formData.discountDurationMonths ||
      formData.discountDurationMonths <= 0
    ) {
      return []
    }
    const months = formData.discountDurationMonths
    return Array.from({ length: months }, (_, i) => ({
      month: `Month ${i + 1}`,
      discount: formData.discountValue,
    }))
  }, [formData.discountDurationMonths, formData.discountValue])

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleArrayChange = (field, value, checked) => {
    setFormData((prev) => {
      const currentArray = prev[field] || []
      if (checked) {
        return {
          ...prev,
          [field]: [...currentArray, value],
        }
      } else {
        return {
          ...prev,
          [field]: currentArray.filter((item) => item !== value),
        }
      }
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const authToken = localStorage.getItem('User')
        ? JSON.parse(localStorage.getItem('User')).token
        : null

      // Prepare payload
      const payload = {
        code: formData.code,
        promoType: formData.promoType,
        applicableUserTypes: formData.applicableUserTypes,
        applicablePlans: formData.applicablePlans,
        applicableBillingCycles: formData.applicableBillingCycles,
        maxRedemptions: formData.maxRedemptions || null,
        expirationDate: formData.expirationDate || null,
        isActive: formData.isActive,
        appliesToSubscriptionsOnly: formData.appliesToSubscriptionsOnly,
      }

      if (formData.promoType === 'discount') {
        payload.discountType = formData.discountType
        payload.discountValue = parseFloat(formData.discountValue)
        payload.discountDurationMonths =
          formData.discountDurationMonths === '' ||
          formData.discountDurationMonths === null
            ? null
            : parseInt(formData.discountDurationMonths)
      } else if (formData.promoType === 'minutes') {
        payload.redeemableMinutes = parseInt(formData.redeemableMinutes)
      }

      const url = promoCode
        ? `${Apis.updatePromoCode}/${promoCode.id}`
        : Apis.createPromoCode

      const method = promoCode ? 'PUT' : 'POST'

      const response = await axios({
        method,
        url,
        data: payload,
        headers: {
          Authorization: `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      })

      if (response.data?.status) {
        onClose()
      } else {
        alert(response.data?.message || 'Error saving promo code')
      }
    } catch (error) {
      console.error('Error saving promo code:', error)
      alert(
        error.response?.data?.message ||
          'Error saving promo code. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold">
            {promoCode ? 'Edit Promo Code' : 'Create New Promo Code'}
          </h2>
          <Button variant="ghost" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="code">Promo Code *</Label>
                  <Input
                    id="code"
                    value={formData.code}
                    onChange={(e) =>
                      handleInputChange('code', e.target.value.toUpperCase())
                    }
                    placeholder="SUMMER20"
                    required
                    disabled={!!promoCode}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {promoCode
                      ? 'Code cannot be changed after creation'
                      : 'Enter unique promo code'}
                  </p>
                </div>
                <div>
                  <Label htmlFor="promoType">Promo Type *</Label>
                  <Select
                    value={formData.promoType}
                    onValueChange={(value) =>
                      handleInputChange('promoType', value)
                    }
                    disabled={!!promoCode}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="discount">
                        Subscription Discount
                      </SelectItem>
                      <SelectItem value="minutes">Free Minutes</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 mt-1">
                    {promoCode ? 'Type cannot be changed after creation' : ''}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxRedemptions">Max Redemptions</Label>
                  <Input
                    id="maxRedemptions"
                    type="number"
                    value={formData.maxRedemptions || ''}
                    onChange={(e) =>
                      handleInputChange(
                        'maxRedemptions',
                        e.target.value === '' ? null : parseInt(e.target.value),
                      )
                    }
                    placeholder="Leave empty for unlimited"
                    min="1"
                  />
                </div>
                <div>
                  <Label htmlFor="expirationDate">Expiration Date</Label>
                  <Input
                    id="expirationDate"
                    type="date"
                    value={formData.expirationDate}
                    onChange={(e) =>
                      handleInputChange('expirationDate', e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) =>
                    handleInputChange('isActive', checked)
                  }
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
            </CardContent>
          </Card>

          {/* Discount Configuration */}
          {formData.promoType === 'discount' && (
            <Card>
              <CardHeader>
                <CardTitle>Discount Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="discountType">Discount Type *</Label>
                    <Select
                      value={formData.discountType}
                      onValueChange={(value) =>
                        handleInputChange('discountType', value)
                      }
                      disabled={!!promoCode}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="flat_amount">
                          Flat Amount ($)
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-xs text-gray-500 mt-1">
                      {promoCode ? 'Cannot be changed after creation' : ''}
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="discountValue">
                      Discount Value *{' '}
                      {formData.discountType === 'percentage' ? '(%)' : '($)'}
                    </Label>
                    <Input
                      id="discountValue"
                      type="number"
                      value={formData.discountValue}
                      onChange={(e) =>
                        handleInputChange(
                          'discountValue',
                          parseFloat(e.target.value),
                        )
                      }
                      placeholder={
                        formData.discountType === 'percentage' ? '20' : '50'
                      }
                      min="0"
                      step={
                        formData.discountType === 'percentage' ? '1' : '0.01'
                      }
                      required
                      disabled={!!promoCode}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="discountDurationMonths">
                    Discount Duration (Months)
                  </Label>
                  <Input
                    id="discountDurationMonths"
                    type="number"
                    value={formData.discountDurationMonths || ''}
                    onChange={(e) =>
                      handleInputChange(
                        'discountDurationMonths',
                        e.target.value === '' ? null : parseInt(e.target.value),
                      )
                    }
                    placeholder="Leave empty or 0 for one-time discount"
                    min="0"
                    disabled={!!promoCode}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Leave empty or 0 for one-time discount. Enter number of
                    months for recurring discount (e.g., 3 for 3 months).
                  </p>
                </div>

                {/* Discount Preview Chart */}
                {formData.discountValue > 0 && (
                  <div className="mt-6">
                    <Label className="text-base font-semibold mb-4 block">
                      Discount Preview
                    </Label>
                    <Card>
                      <CardContent className="pt-6">
                        <ChartContainer
                          config={{
                            discount: {
                              label:
                                formData.discountType === 'percentage'
                                  ? `Discount (%)`
                                  : `Discount ($)`,
                              color: 'hsl(var(--chart-1))',
                            },
                          }}
                          className="h-[250px] w-full"
                        >
                          {formData.discountDurationMonths &&
                          formData.discountDurationMonths > 0 ? (
                            // Recurring discount - show area chart over time
                            <AreaChart data={recurringDiscountData}>
                              <CartesianGrid
                                strokeDasharray="3 3"
                                className="stroke-muted"
                              />
                              <XAxis
                                dataKey="month"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickFormatter={(value) =>
                                  value.replace('Month ', 'M')
                                }
                              />
                              <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickFormatter={(value) =>
                                  formData.discountType === 'percentage'
                                    ? `${value}%`
                                    : `$${value}`
                                }
                              />
                              <ChartTooltip
                                content={
                                  <ChartTooltipContent
                                    formatter={(value) =>
                                      formData.discountType === 'percentage'
                                        ? `${value}%`
                                        : `$${value}`
                                    }
                                  />
                                }
                              />
                              <Area
                                type="monotone"
                                dataKey="discount"
                                stroke="hsl(var(--chart-1))"
                                fill="hsl(var(--chart-1))"
                                fillOpacity={0.2}
                                strokeWidth={2}
                              />
                            </AreaChart>
                          ) : (
                            // One-time discount - show bar chart
                            <BarChart
                              data={[
                                {
                                  type:
                                    formData.discountType === 'percentage'
                                      ? 'Discount (%)'
                                      : 'Discount ($)',
                                  value: formData.discountValue,
                                },
                              ]}
                            >
                              <CartesianGrid
                                strokeDasharray="3 3"
                                className="stroke-muted"
                                vertical={false}
                              />
                              <XAxis
                                dataKey="type"
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                              />
                              <YAxis
                                tickLine={false}
                                axisLine={false}
                                tickMargin={8}
                                tickFormatter={(value) =>
                                  formData.discountType === 'percentage'
                                    ? `${value}%`
                                    : `$${value}`
                                }
                              />
                              <ChartTooltip
                                content={
                                  <ChartTooltipContent
                                    formatter={(value) =>
                                      formData.discountType === 'percentage'
                                        ? `${value}%`
                                        : `$${value}`
                                    }
                                  />
                                }
                              />
                              <Bar
                                dataKey="value"
                                fill="hsl(var(--chart-1))"
                                radius={[8, 8, 0, 0]}
                              />
                            </BarChart>
                          )}
                        </ChartContainer>
                        <div className="mt-4 text-sm text-gray-600 text-center">
                          {formData.discountDurationMonths &&
                          formData.discountDurationMonths > 0 ? (
                            <p>
                              This discount will apply for{' '}
                              <span className="font-semibold">
                                {formData.discountDurationMonths} month
                                {formData.discountDurationMonths > 1 ? 's' : ''}
                              </span>
                            </p>
                          ) : (
                            <p>
                              This is a{' '}
                              <span className="font-semibold">one-time</span>{' '}
                              discount
                            </p>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                )}

                <div className="flex items-center space-x-2">
                  <Switch
                    id="appliesToSubscriptionsOnly"
                    checked={formData.appliesToSubscriptionsOnly}
                    onCheckedChange={(checked) =>
                      handleInputChange('appliesToSubscriptionsOnly', checked)
                    }
                  />
                  <Label htmlFor="appliesToSubscriptionsOnly">
                    Applies to Subscriptions Only
                  </Label>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Minutes Configuration */}
          {formData.promoType === 'minutes' && (
            <Card>
              <CardHeader>
                <CardTitle>Minutes Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="redeemableMinutes">
                    Redeemable Minutes *
                  </Label>
                  <Input
                    id="redeemableMinutes"
                    type="number"
                    value={formData.redeemableMinutes}
                    onChange={(e) =>
                      handleInputChange(
                        'redeemableMinutes',
                        parseInt(e.target.value),
                      )
                    }
                    placeholder="100"
                    min="1"
                    required
                    disabled={!!promoCode}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Targeting */}
          <Card>
            <CardHeader>
              <CardTitle>Targeting</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Applicable User Types</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {userTypes.map((type) => (
                    <label
                      key={type}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.applicableUserTypes.includes(type)}
                        onChange={(e) =>
                          handleArrayChange(
                            'applicableUserTypes',
                            type,
                            e.target.checked,
                          )
                        }
                        className="rounded"
                      />
                      <span className="text-sm">{type}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label>Applicable Plans</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {plans.map((plan) => (
                    <label
                      key={plan}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.applicablePlans.includes(plan)}
                        onChange={(e) =>
                          handleArrayChange(
                            'applicablePlans',
                            plan,
                            e.target.checked,
                          )
                        }
                        className="rounded"
                      />
                      <span className="text-sm">{plan}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label>Applicable Billing Cycles</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {billingCycles.map((cycle) => (
                    <label
                      key={cycle}
                      className="flex items-center space-x-2 cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={formData.applicableBillingCycles.includes(
                          cycle,
                        )}
                        onChange={(e) =>
                          handleArrayChange(
                            'applicableBillingCycles',
                            cycle,
                            e.target.checked,
                          )
                        }
                        className="rounded"
                      />
                      <span className="text-sm capitalize">{cycle}</span>
                    </label>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-purple-600 hover:bg-purple-700"
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <CircularProgress
                    size={16}
                    style={{ marginRight: 8, color: 'white' }}
                  />
                  <span>Saving...</span>
                </div>
              ) : promoCode ? (
                'Update Promo Code'
              ) : (
                'Create Promo Code'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default PromoCodeModal
