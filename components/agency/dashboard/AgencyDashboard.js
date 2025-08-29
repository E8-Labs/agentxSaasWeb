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
import NotficationsDrawer from "@/components/notofications/NotficationsDrawer";
import { copyAgencyOnboardingLink } from "@/components/constants/constants";

export default function AgencyDashboard({
  selectedAgency
}) {
  const [user, setUser] = useState(null);
  const [linkCopied, setLinkCopied] = useState(false);


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
          className="pl-10 flex flex-row items-cetner justify-between w-full"
          style={{ fontSize: 24, fontWeight: "600" }}
        >
          Analytics

          <div className="flex flex-row items-center gap-2">
            <button
              className="bg-[#845EEE45] border-none outline-none rounded-2xl px-2 py-1"
              style={{ fontSize: 15, fontWeight: "500", whiteSpace: 'nowrap' }}
              onClick={() => {
                copyAgencyOnboardingLink({setLinkCopied})
              }}>
              {linkCopied ? "Link Copied" : "Copy Link"}
            </button>
            <NotficationsDrawer />
          </div>
        </div>
        {/* Tabs for navigation */}
        <Tabs defaultValue="user-activity" className="mb-6 w-full">
          <TabsList className="flex flex-row items-center justify-start gap-4 border-b pb-2 w-full pl-10 bg-transparent">
            <TabsTrigger value="user-activity">User Activity</TabsTrigger>
            {/* <TabsTrigger value="engagement">Engagement</TabsTrigger> */}
            <TabsTrigger value="subscription">Subscription</TabsTrigger>
          </TabsList>

          <TabsContent value="user-activity">
            <AgencyActivity user={user} selectedAgency={selectedAgency} />
          </TabsContent>
          {/* <TabsContent value="engagement">
            <AgenyEngagements />
          </TabsContent> */}

          <TabsContent value="subscription">
            <AgencySubscriptions selectedAgency={selectedAgency} />
          </TabsContent>
        </Tabs>

      </div>
    </div>
  );
}
