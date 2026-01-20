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
    <div className="flex w-full items-center flex-row justify-start">
      <div className="py-6 w-full">
        <div
          className="px-10 flex flex-row items-cetner justify-between w-full"
          style={{ fontSize: 24, fontWeight: '600' }}
        >
          Analytics
          <div className="flex flex-row items-center gap-2">
            <NotficationsDrawer />
          </div>
        </div>
        {/* Tabs for navigation */}
        <Tabs value={activeTab} onValueChange={handleTabChange} className="mb-6 w-full">
          <TabsList className="flex flex-row items-center justify-center gap-4 border-b pb-2 w-full pl-10 bg-transparent outline-none focus:outline-none">
            <TabsTrigger value="user-activity" className="outline-none">
              User Activity
            </TabsTrigger>
            {/* <TabsTrigger value="engagement">Engagement</TabsTrigger> */}
            <TabsTrigger value="revenue" className="outline-none">
              Revenue
            </TabsTrigger>
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
