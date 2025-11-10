import React from "react";
import { useState } from "react";
import { useEffect } from "react";
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
import { User, TrendingUp, PhoneCall, Calendar, Star } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { FindVoice } from "@/components/createagent/Voices";
import UsersWithUniqueNumbers from "@/components/admin/dashboard/UsersWithUniqueNumbersModal";
import UsersWithAgnets from "@/components/admin/dashboard/UsersWithAgents";
import UsersWithPipelines from "@/components/admin/dashboard/UsersWIthPipelines";
import UsersWithTeam from "@/components/admin/dashboard/UsersWithTeam";
import UsersWithLeads from "@/components/admin/dashboard/UsersWithLeads";
import UsersWithCalender from "@/components/admin/dashboard/UsersWithCalenders";
import TopVoicesModal from "@/components/admin/dashboard/TopVoicesModal";
import { AuthToken } from "../plan/AuthDetails";
import Apis from "@/components/apis/Apis";
import axios from "axios";
import Image from "next/image";
import AgencyDashboardDefaultUI from "./AgencyDashboardDefaultUI";
import { CircularProgress } from "@mui/material";
  // import { stat } from "fs";

const data = [
  { name: "Jan", users: 4000 },
  { name: "Feb", users: 4500 },
  { name: "Mar", users: 5000 },
  { name: "Apr", users: 5200 },
  { name: "May", users: 6000 },
];

function AgencyActivity({
  user,
  selectedAgency
}) {
  const [stats, setStats] = useState(null);
  const [showAllVoices, setShowAllVoices] = useState(false);
  const [showAllUsersWithUniqueNumbers, setShowAllUsersWithUniqueNumbers] =
    useState(false);
  const [showAllUsersWithAgents, setShowAllUsersWithAgents] = useState(false);
  const [showAllUsersWithTeam, setShowAllUsersWithTeam] = useState(false);
  const [showAllUsersWithLeads, setShowAllUsersWithLeads] = useState(false);
  const [showAllUsersWithPipelines, setShowAllUsersWithPipelines] =
    useState(false);
  const [showAllUsersWithCalender, setShowAllUsersWithCalender] =
    useState(false);

  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Example usage:
    if (user) {
      // console.log('trying to get states 2',)

      //console.log;
      fetchAdminStats();
    }
  }, [user]);

  const fetchAdminStats = async () => {
    setLoading(true);
    try {
      const token = user.token; // Extract JWT token
      console.log("Agency id passed is", selectedAgency);
      // console.log('trying to get states',token)
      let ApiPath = Apis.adminStats
      let seperator = "?"
      if (selectedAgency) {
        ApiPath = ApiPath + seperator + `userId=${selectedAgency.id}`
        seperator = "&"
      }

      console.log("Api path for get activity is", ApiPath);

      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data) {
        let data = response.data.data
        console.log(data)
        setStats(data);
        console.log('stats data is for activity tab is', data)
      } else {
        console.error("Failed to fetch admin stats:", data.error);
      }
    } catch (error) {
      console.error("Error fetching admin stats:", error);
    } finally {
      setLoading(false);
    }
  };

  //All bottom cards >2 agents, >1 pipelines etc
  function GetStatView(title, percentage, count, icon) {
    return (
      <Card className="cursor-pointer border-none shadow-none rounded-lg p-2 flex flex-col items-center   ">
        <TopVoicesModal
          topVoices={stats?.topVoices || []}
          open={showAllVoices}
          onClose={() => {
            setShowAllVoices(false);
          }}
        />
        <UsersWithUniqueNumbers
          user={user}
          open={showAllUsersWithUniqueNumbers}
          onClose={() => {
            setShowAllUsersWithUniqueNumbers(false);
          }}
          from="agency"
        />
        <div className="cursor-pointer flex items-start  justify-between w-full  mb-2">
          <img
            src={`${icon}`} //"/mt2agentsicon.png"
            alt="Icon"
            className="cursor-pointer h-20  -ml-2 -mt-3"
          />
          {/* Show both count and percentage when both are valid (including count=0) */}
          {((typeof count === 'number' || (count !== "" && count !== null && count !== undefined)) &&
            (percentage !== "" && percentage !== null && percentage !== undefined)) && (
              <div className="cursor-pointer flex flex-col mr-2 items-end">
                <div
                  className="cursor-pointer font-light"
                  style={{
                    fontFamily: "Inter",
                    fontSize: 23,
                    fontWeight: "bold",
                  }}
                >
                  {count}
                </div>
                <p className="cursor-pointer text-gray-500 text-lg font-light">
                  {percentage}%
                </p>
              </div>
            )}
          {/* Show single value (count or percentage) when only one exists */}
          {(!(typeof count === 'number' || (count !== "" && count !== null && count !== undefined)) ||
            !(percentage !== "" && percentage !== null && percentage !== undefined)) && (
              <div className="cursor-pointer flex flex-col mr-2 items-end">
                <h2
                  className="cursor-pointer font-light"
                  style={{
                    fontFamily: "Inter",
                    fontSize: 23,
                    fontWeight: "bold",
                  }}
                >
                  {(typeof count === 'number' || (count !== "" && count !== null && count !== undefined))
                    ? count
                    : percentage}
                  {!(typeof count === 'number' || (count !== "" && count !== null && count !== undefined)) ? "%" : ""}
                </h2>
                {/* Only show percentage below if we're showing count above */}
                {(typeof count === 'number' || (count !== "" && count !== null && count !== undefined)) &&
                  (percentage !== "" && percentage !== null && percentage !== undefined) && (
                    <p className="cursor-pointer text-gray-500 text-lg">
                      {percentage}%
                    </p>
                  )}
              </div>
            )}
        </div>

        <div className="cursor-pointer flex flex-row items-start w-full pl-3">
          <p className="cursor-pointer font-semibold mt-2 mb-2">{title}</p>
        </div>
      </Card>
    );
  }

  return (
    loading ? (
      <div className="flex flex-col justify-center items-center h-[90svh]">
        <CircularProgress size={45} />
      </div>
    ) : (
      stats?.totalUsers > 0 ? (
        <div
          className=" flex flex-col justify-start items-start pl-10 h-[90svh] gap-4 pb-8 "
          style={{ overflow: "auto", scrollbarWidth: "none" }}
        >
          {/*  Stats  */}
          {/* <span className=" flex flex-row gap-2">
        <h1 className=" text-3xl font-regular mb-4">AgentX User</h1>
        <h1 className=" text-3xl font-regular mb-4 text-[#00000047]">Stat</h1>
      </span> */}
          {/*  Subscriptions  */}
          {
            stats?.totalUsers && stats?.usersOnPlans ? (
              <SubscriptionsStatsComponent stats={stats} />
            ) : (
              <div className="w-[96%] mt-4">
                <Image
                  alt="placeholder"
                  src="/agencyIcons/placeholderBox2.png"
                  width={1200} height={120}
                  style={{ width: "100%", height: "auto" }}
                />
              </div>
            )
          }

          {/*  DAU MAU  */}
          <div
            className=" cursor-pointer grid gap-6 grid-cols-4 md:grid-cols-4 lg:grid-cols-4 px-8 rounded-lg w-[96%]"
            style={{
              backgroundImage: "url('/daustatback.svg')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          >
            {/* Top Metrics */}
            <Card className="cursor-pointer flex flex-col items-center text-center border-none shadow-none w-[18.5vw] bg-transparent text-white">
              <CardHeader>
                <CardTitle>Daily Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <h2 className="cursor-pointer text-2xl font-bold">
                  {stats?.activeUsers?.DAU?.count || '-'}
                </h2>
              </CardContent>
              <CardContent>
                <h2 className="cursor-pointer text-lg text-gray-300 font-bold">
                  {stats?.activeUsers?.DAU?.percentage || 0}%
                </h2>
              </CardContent>
            </Card>

            <Card className="cursor-pointer flex flex-col items-center text-center border-none shadow-none  w-[16vw] bg-transparent text-white">
              <CardHeader>
                <CardTitle>Avg Weekly Sign Ups</CardTitle>
              </CardHeader>
              <CardContent>
                <h2 className="cursor-pointer text-2xl font-bold">
                  {stats?.weeklySignups}
                </h2>
                {/* <Progress value={27} /> */}
              </CardContent>
              <CardContent>
                <h2 className="cursor-pointer text-lg text-gray-300 font-bold">
                  {stats?.weeklySignupsPercentage || 0}%
                </h2>
              </CardContent>
            </Card>

            <Card className="cursor-pointer flex flex-col items-center text-center border-none shadow-none w-[16vw] bg-transparent text-white">
              <CardHeader>
                <CardTitle>Monthly Active Users</CardTitle>
              </CardHeader>
              <CardContent>
                <h2 className="cursor-pointer text-2xl font-bold">
                  {stats?.activeUsers?.MAU?.count || '-'}
                </h2>
              </CardContent>
              <CardContent>
                <h2 className="cursor-pointer text-lg text-gray-300 font-bold">
                  {stats?.activeUsers.MAU.percentage || 0}%
                </h2>
              </CardContent>
            </Card>

            <Card className="cursor-pointer flex flex-col items-center text-center border-none shadow-none w-[16vw] bg-transparent text-white">
              <CardHeader>
                <CardTitle>Session Length</CardTitle>
              </CardHeader>
              <CardContent>
                <h2 className="cursor-pointer text-2xl font-bold">
                  {stats?.avgSessionDuration || "0 min"}
                </h2>
                {/* <Progress value={48} /> */}
              </CardContent>
            </Card>
          </div>

          {/* users lists components */}

          <UsersWithAgnets
            user={user}
            open={showAllUsersWithAgents}
            onClose={() => {
              setShowAllUsersWithAgents(false);
            }}
            from="agency"
          />

          <UsersWithPipelines
            user={user}
            open={showAllUsersWithPipelines}
            onClose={() => {
              setShowAllUsersWithPipelines(false);
            }}
            from="agency"
          />

          <UsersWithTeam
            user={user}
            open={showAllUsersWithTeam}
            onClose={() => {
              setShowAllUsersWithTeam(false);
            }}
            from="agency"
          />

          <UsersWithLeads
            user={user}
            open={showAllUsersWithLeads}
            onClose={() => {
              setShowAllUsersWithLeads(false);
            }}
            from="agency"
          />

          <UsersWithCalender
            user={user}
            open={showAllUsersWithCalender}
            onClose={() => {
              setShowAllUsersWithCalender(false);
            }}
            from="agency"
          />

          {/*  Voices  */}

          {/* <div className=" h-[15%] grid gap-6 grid-cols-3 md:grid-cols-3 lg:grid-cols-3 "> */}
          <div className="w-[96%] rounded-lg">
            <VoicesComponent
              stats={stats}
              voiceIds={stats?.topVoices}
              onViewAll={() => {
                setShowAllVoices(true);
              }}
              onViewUniqueNumbers={() => {
                setShowAllUsersWithUniqueNumbers(true);
              }}
              from="agency"
            />
          </div>
          {/* </div> */}

          <div className=" grid gap-3 grid-cols-5 md:grid-cols-5 lg:grid-cols-5  rounded-lg w-[96%]">
            {/* Top Metrics */}
            <button
              onClick={() => {
                setShowAllUsersWithAgents(true);
              }}
            >
              {GetStatView(
                "> 2 agents",
                stats?.agentUsers.percentage,
                stats?.agentUsers.count,
                "/mt2agentsicon.png"
              )}
            </button>

            <button
              onClick={() => {
                setShowAllUsersWithPipelines(true);
              }}
            >
              {GetStatView(
                "> 1 pipeline",
                stats?.pipelineUsers.percentage,
                stats?.pipelineUsers.count,
                "/mt1pipelineicon.png"
              )}
            </button>

            <button
              onClick={() => {
                setShowAllUsersWithLeads(true);
              }}
            >
              {GetStatView(
                "Uploaded Leads",
                stats?.leadsUsers.percentage,
                stats?.leadsUsers.count,
                "/uploadleadsicon.png"
              )}
            </button>

            <button
              onClick={() => {
                setShowAllUsersWithTeam(true);
              }}
            >
              {GetStatView(
                "Invited Teams",
                stats?.teamsUsers.percentage,
                stats?.teamsUsers.count,
                "/invtedteamsiocn.png"
              )}
            </button>

            <button
              onClick={() => {
                setShowAllUsersWithCalender(true);
              }}
            >
              {GetStatView(
                "Added calendar",
                stats?.calendarUsers.percentage,
                stats?.calendarUsers.count,
                "/addedtocalendaricon.png"
              )}
            </button>

            {GetStatView(
              "Call Success Rate",
              stats?.callSuccessRate,
              "",
              "/callsuccessicon.png"
            )}

            {GetStatView(
              "Average Call Per User",
              "",
              stats?.avgCallsPerUser,

              "/avgcallicon.png"
            )}


          </div>
        </div>
      ) : (
        <AgencyDashboardDefaultUI />
      )
    ));
}

export default AgencyActivity;

function VoicesComponent({
  stats,
  voiceIds = [
    { id: "JVFlaC5njBD4JVXTPOyq", users: 231 },
    { id: "PFIFGOLGFTh5WCxNE7aV", users: 408 },
    { id: "SqVGDZffOHdbKuvIy7MP", users: 89 },
  ],
  onViewAll,
  onViewUniqueNumbers,
}) {
  function GetVoiceCard(index = 0) {
    const voice = voiceIds?.[index];

    if (!voice || !voice.voiceId) return null;

    let color = "bg-green-500/80";
    if (index == 1) {
      color = "bg-purple-500/80";
    }
    if (index == 2) {
      color = "bg-pink-500/80";
    }
    return (
      <Card className="cursor-pointer  h-[160px] border-white relative  border border-white shadow-[0px_4px_31.5px_0px_rgba(121,2,223,0.04)] rounded-2xl p-6 flex flex-col items-center text-center bg-white/60 overflow-hidden">
        <div
          className={`cursor-pointer absolute top-0 left-1/2 transform -translate-x-1/2 w-28 h-20 ${color} rounded-full blur-2xl`}
        />
        <div className="cursor-pointer relative w-16 h-16 mb-4 ">
          <div className="cursor-pointer -top-[15px] absolute left-1/2 transform -translate-x-1/2 inset-0 bg-white/40 w-12 h-12 rounded-full backdrop-blur-md" />
          <Avatar className="cursor-pointer w-9 h-9 absolute  left-1/2 transform -translate-x-1/2 top-1/3 transform -translate-y-1/3">
            <AvatarImage
              src={FindVoice(voiceIds[index].voiceId).img}
              alt="User"
            />
          </Avatar>
        </div>
        <h2 className="cursor-pointer mt-4 text-black text-2xl font-medium leading-snug">
          {FindVoice(voiceIds[index].voiceId).name}
        </h2>
        <p className="cursor-pointer mt-4 text-black opacity-60 text-md font-medium leading-tight">
          {voiceIds[index].count} agents
        </p>
      </Card>
    );
  }

  return (
    <div className=" grid gap-3 grid-cols-6 md:grid-cols-6 lg:grid-cols-6  bg-white pt-2 rounded-lg ">
      <Card className="cursor-pointer border-none flex flex-col items-center justify-center shadow-none w-[13vw]">
        <CardContent>
          <h2 className="cursor-pointer text-2xl font-regular">Top</h2>
        </CardContent>
        <CardContent>
          <h1 className="cursor-pointer text-4xl font-regular">3</h1>
        </CardContent>
        <CardContent>
          <h2 className="cursor-pointer text-2xl font-regular">Voices</h2>
        </CardContent>
      </Card>

      {GetVoiceCard(0)}
      {GetVoiceCard(1)}
      {GetVoiceCard(2)}
      <Card className="cursor-pointer cursor-pointer border-white bg-white60 flex flex-col items-center justify-center  w-[11vw] shadow-[0px_4px_31.5px_0px_rgba(121,2,223,0.04)]">
        <CardContent
          onClick={() => {
            //console.log;

            onViewAll();
          }}
        >
          <h2
            className="cursor-pointer text-lg font-regular"
            style={{ fontFamily: "Inter" }}
          >
            View All
          </h2>
        </CardContent>
      </Card>

      <Card
        className="cursor-pointer border-none shadow-none rounded-lg p-2 flex flex-col items-center  w-[13vw]"
        onClick={() => {
          onViewUniqueNumbers();
        }}
      >
        <div className="cursor-pointer flex items-center justify-between w-full  mb-2">
          <img
            src="/invtedteamsiocn.png"
            alt="Icon"
            className="cursor-pointer h-20  -ml-2  -mt-3"
          />
          <div className="cursor-pointer flex flex-col mr-2 items-end">
            <h2 className="cursor-pointer text-4xl font-light">
              {/* {stats?.uniquePhoneUsers.count} */}
            </h2>
            <p className="cursor-pointer text-gray-500 text-lg">
              {stats?.uniquePhoneUsers.percentage}%
            </p>
          </div>
        </div>

        <div className="cursor-pointer flex flex-row items-start w-full pl-3">
          <p className="cursor-pointer font-bold mt-2 mb-2">Unique numbers</p>
        </div>
      </Card>
    </div>
  );
}

function SubscriptionsStatsComponent({ stats, plans }) {
  return (
    <div className="  grid gap-2 grid-cols-7 md:grid-cols-7 lg:grid-cols-7 bg-white pe-4 rounded-lg w-[96%]">
      {/* Top Metrics */}
      {
        stats?.totalUsers ?
          (
            <Card className="cursor-pointer border-none shadow-none w-[11vw]">
              <CardHeader>
                <CardTitle>Total Users</CardTitle>
              </CardHeader>
              <CardContent>
                <h2 className="cursor-pointer text-3xl font-bold">
                  {stats?.totalUsers}
                </h2>
              </CardContent>
            </Card>
          ) : (
            <div><Image alt="placeholder" src="/agencyIcons/placeholderBox.png" width={200} height={120} /></div>
          )
      }

      {stats?.usersOnPlans ?
        Object.entries(stats.usersOnPlans).map(([planName, data]) => (
          <Card key={planName} className="cursor-pointer border-none shadow-none w-[11vw]">
            <CardHeader className="w-full  ">
              <CardTitle>{planName}</CardTitle>
            </CardHeader>
            <CardContent>
              <h2 className="cursor-pointer text-2xl font-regular">
                {data.count}
              </h2>
            </CardContent>
            <CardContent>
              <p className="cursor-pointer text-lg font-regular text-gray-500">
                {data.percentage}%
              </p>
            </CardContent>
          </Card>
        )) : (
          <div><Image alt="placeholder" src="/agencyIcons/placeholderBox.png" width={320} height={120} /></div>
        )
      }





    </div>
  );
}



// {/* <Card className="cursor-pointer border-none shadow-none rounded-lg p-2 flex flex-col items-center  w-[14vw]">
//           <div className="cursor-pointer flex items-start  justify-between w-full  mb-2">
//             <img
//               src="/ratingicon.png"
//               alt="Icon"
//               className="cursor-pointer h-20  -ml-2 -mt-3"
//             />
//             <div className="cursor-pointer flex flex-col mr-2 items-end">
//               <h2 className="cursor-pointer text-4xl font-bold">879</h2>
//               <p className="cursor-pointer text-gray-500 text-lg">41.3%</p>
//             </div>
//           </div>

//           <div className="cursor-pointer flex flex-row items-start w-full pl-3">
//             <p className="cursor-pointer font-bold mt-2 mb-2">
//               Customer Feedback Score
//             </p>
//           </div>
//         </Card> */}