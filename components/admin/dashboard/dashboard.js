'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import AgentXStats from "./AgentXStats";
import { useState } from "react";
import { useEffect } from "react";
import { PersistanceKeys } from "@/constants/Constants";
import AdminSubscriptions from "./AdminSubscriptions";

export default function Dashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    let userData = localStorage.getItem(PersistanceKeys.LocalStorageUser);
    if (userData) {
      let user = JSON.parse(userData);
      setUser(user);
    }
  }, []);

  return (
    <div className="px-6">
      {/* Tabs for navigation */}
      <Tabs defaultValue="user-activity" className="mb-6">
        <TabsList className="flex gap-4 border-b pb-2 bg-transparent">
          <TabsTrigger value="user-activity">User Activity</TabsTrigger>
          <TabsTrigger value="engagement">Engagement</TabsTrigger>
          <TabsTrigger value="subscription">Subscription</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
        </TabsList>

        <TabsContent value="user-activity">
          <AgentXStats user={user} />
        </TabsContent>
        <TabsContent value="engagement">
          <div>Engagement</div>
        </TabsContent>

        <TabsContent value="subscription">
          <AdminSubscriptions />
        </TabsContent>
      </Tabs>
    </div>
  );
}
