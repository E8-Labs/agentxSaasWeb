'use client'

import { useState } from 'react'
import { useEffect } from 'react'
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'

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

import AdminEngagments from './AdminEngagments'
import AdminSubscriptions from './AdminSubscriptions'
import AgentXStats from './AgentXStats'

export default function Dashboard() {
  const [user, setUser] = useState(null)

  useEffect(() => {
    let userData = localStorage.getItem(PersistanceKeys.LocalStorageUser)
    if (userData) {
      let user = JSON.parse(userData)
      setUser(user)
    }
  }, [])

  return (
    <div className="px-6">
      {/* Tabs for navigation */}
      <Tabs defaultValue="user-activity" className="mb-6">
        <TabsList className="flex gap-4 border-b pb-2 bg-transparent">
          <TabsTrigger value="user-activity">User Activity</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
        </TabsList>

        <TabsContent value="user-activity">
          <AgentXStats user={user} />
        </TabsContent>
        <TabsContent value="engagement">
          <AdminEngagments />
        </TabsContent>

        <TabsContent value="subscription">
          <AdminSubscriptions />
        </TabsContent>
      </Tabs>
    </div>
  )
}
