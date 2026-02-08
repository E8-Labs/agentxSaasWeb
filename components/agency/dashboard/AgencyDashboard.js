'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

import { copyAgencyOnboardingLink } from '@/components/constants/constants'
import NotficationsDrawer from '@/components/notofications/NotficationsDrawer'
import { Avatar, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { PersistanceKeys } from '@/constants/Constants'

import AgencyActivity from './AgencyActivity'
import AgencyRevenueDashboard from './revenue/AgencyRevenueDashboard'

export default function AgencyDashboard({ selectedAgency }) {
  const [user, setUser] = useState(null)
  const [linkCopied, setLinkCopied] = useState(false)
  const searchParams = useSearchParams()
  const router = useRouter()

  // Get initial tab from URL or default to 'user-activity'
  const getInitialTab = () => {
    try {
      const tab = searchParams?.get('tab')
      return tab === 'revenue' ? 'revenue' : 'user-activity'
    } catch (e) {
      // Fallback if searchParams not available
      return 'user-activity'
    }
  }

  const [activeTab, setActiveTab] = useState(getInitialTab)

  // Sync tab with URL on mount and when searchParams change
  useEffect(() => {
    const tab = searchParams?.get('tab')
    if (tab === 'revenue') {
      setActiveTab('revenue')
    } else if (tab === null || tab === 'user-activity') {
      setActiveTab('user-activity')
    }
  }, [searchParams])

  useEffect(() => {
    let userData = localStorage.getItem('User')
    if (userData) {
      let user = JSON.parse(userData)

      setUser(user)
    } else {}
  }, [])

  // Handle tab change and update URL
  const handleTabChange = (value) => {
    setActiveTab(value)
    try {
      const params = new URLSearchParams(searchParams?.toString() || '')
      if (value === 'revenue') {
        params.set('tab', 'revenue')
      } else {
        params.delete('tab') // Remove tab param for user-activity (default)
      }
      const newUrl = params.toString() ? `?${params.toString()}` : window.location.pathname
      router.push(newUrl, { scroll: false })
    } catch (e) {
      console.error('Error updating URL:', e)
    }
  }

  return (
    <div className="flex w-full flex-row items-start justify-start">
      <div className="agency-dashboard-inner flex flex-1 min-w-0 w-full flex-col items-start pt-0 pb-6 bg-[#f9f9f9]">
        <div
          className="flex h-[60px] w-full flex-row items-center justify-between border-b border-black/10 px-4 bg-transparent"
          style={{ fontSize: 24, fontWeight: 600 }}
        >
          <span className="text-2xl font-semibold">Analytics</span>
          <div className="flex w-10 h-10 items-center justify-center rounded-lg hover:bg-[#f6f6f6] transition-colors">
            <NotficationsDrawer />
          </div>
        </div>
        {/* Tabs for navigation */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full bg-transparent">
          <TabsList className="flex h-10 flex-row items-center justify-center pb-2 w-full bg-transparent outline-none focus:outline-none">
            <div className="w-auto mx-auto p-1 flex flex-row items-center gap-2">
              <TabsTrigger value="user-activity" className="outline-none">
                User Activity
              </TabsTrigger>
              {/* <TabsTrigger value="engagement">Engagement</TabsTrigger> */}
              <TabsTrigger value="revenue" className="outline-none">
                Revenue
              </TabsTrigger>
            </div>
          </TabsList>

          <TabsContent value="user-activity">
            <AgencyActivity user={user} selectedAgency={selectedAgency} />
          </TabsContent>
          {/* <TabsContent value="engagement">
            <AgenyEngagements />
          </TabsContent> */}

          <TabsContent value="revenue">
            <AgencyRevenueDashboard selectedAgency={selectedAgency} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
