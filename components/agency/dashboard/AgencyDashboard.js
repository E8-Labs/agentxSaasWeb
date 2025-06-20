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
import { useState } from "react";
import { useEffect } from "react";
import { PersistanceKeys } from "@/constants/Constants";
import AgencyActivity from "./AgencyActivity";
import AgencySubscriptions from "./AgencySubscriptions";

export default function AgencyDashboard() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    console.log('check 1',)
    let userData = localStorage.getItem("User");
    if (userData) {
      let user = JSON.parse(userData);
      console.log('userdata', user)

      setUser(user);
    } else {
      console.log("no data found")
    }
  }, []);

  return (
    <div className="flex w-full items-center flex-row justify-start">
      <div className="py-6">
        <div
          className="pl-10"
          style={{ fontSize: 24, fontWeight: "600" }}
        >
          Analytics
        </div>
        {/* Tabs for navigation */}
        <Tabs defaultValue="user-activity" className="mb-6 w-full">
          <TabsList className="flex flex-row items-center justify-start gap-4 border-b pb-2 w-full pl-10 bg-transparent">
            <TabsTrigger value="user-activity">User Activity</TabsTrigger>
            {/* <TabsTrigger value="engagement">Engagement</TabsTrigger> */}
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
          </TabsList>

          <TabsContent value="user-activity">
            <AgencyActivity user={user} />
          </TabsContent>
          {/* <TabsContent value="engagement">
            <AgenyEngagements />
          </TabsContent> */}

          <TabsContent value="subscription">
            <AgencySubscriptions />
          </TabsContent>
        </Tabs>
        
      </div>
    </div>
  );
}
