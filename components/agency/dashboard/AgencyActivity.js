import { CircularProgress } from '@mui/material'
import axios from 'axios'
import { Calendar, PhoneCall, Star, TrendingUp, User } from 'lucide-react'
import Image from 'next/image'
import React from 'react'
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

import TopVoicesModal from '@/components/admin/dashboard/TopVoicesModal'
import UsersWithPipelines from '@/components/admin/dashboard/UsersWIthPipelines'
import UsersWithAgnets from '@/components/admin/dashboard/UsersWithAgents'
import UsersWithCalender from '@/components/admin/dashboard/UsersWithCalenders'
import UsersWithLeads from '@/components/admin/dashboard/UsersWithLeads'
import UsersWithTeam from '@/components/admin/dashboard/UsersWithTeam'
import UsersWithUniqueNumbers from '@/components/admin/dashboard/UsersWithUniqueNumbersModal'
import UsersWithPlan from '@/components/admin/dashboard/UsersWithPlan'
import Apis from '@/components/apis/Apis'
import { FindVoice } from '@/components/createagent/Voices'
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

import { AuthToken } from '../plan/AuthDetails'
import AgencyDashboardDefaultUI from './AgencyDashboardDefaultUI'

// import { stat } from "fs";

const data = [
  { name: 'Jan', users: 4000 },
  { name: 'Feb', users: 4500 },
  { name: 'Mar', users: 5000 },
  { name: 'Apr', users: 5200 },
  { name: 'May', users: 6000 },
]

function AgencyActivity({ user, selectedAgency }) {
  const [stats, setStats] = useState(null)
  const [showAllVoices, setShowAllVoices] = useState(false)
  const [showAllUsersWithUniqueNumbers, setShowAllUsersWithUniqueNumbers] =
    useState(false)
  const [showAllUsersWithAgents, setShowAllUsersWithAgents] = useState(false)
  const [showAllUsersWithTeam, setShowAllUsersWithTeam] = useState(false)
  const [showAllUsersWithLeads, setShowAllUsersWithLeads] = useState(false)
  const [showAllUsersWithPipelines, setShowAllUsersWithPipelines] =
    useState(false)
  const [showAllUsersWithCalender, setShowAllUsersWithCalender] =
    useState(false)
  const [showUsersWithPlan, setShowUsersWithPlan] = useState(false)
  const [selectedPlanName, setSelectedPlanName] = useState(null)

  const [plans, setPlans] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Example usage:
    if (user) {
      // console.log('trying to get states 2',)

      //console.log;
      fetchAdminStats()
    }
  }, [user])

  const fetchAdminStats = async () => {
    setLoading(true)
    try {
      const token = user.token // Extract JWT token
      // console.log('trying to get states',token)
      let ApiPath = Apis.adminStats
      let seperator = '?'
      if (selectedAgency) {
        ApiPath = ApiPath + seperator + `userId=${selectedAgency.id}`
        seperator = '&'
      }

      const response = await axios.get(ApiPath, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data) {
        let data = response.data.data
        setStats(data)
      } else {
        console.error('Failed to fetch admin stats:', data.error)
      }
    } catch (error) {
      console.error('Error fetching admin stats:', error)
    } finally {
      setLoading(false)
    }
  }

  //All bottom cards >2 agents, >1 pipelines etc
  function GetStatView(title, percentage, count, icon) {
    return (
      <Card className="cursor-pointer bg-transparent shadow-none rounded-none border border-[#EFEFEF] py-4 px-3 flex flex-col items-center w-[250px] min-w-[250px] hover:bg-black/[0.02] transition-colors">
        <TopVoicesModal
          topVoices={stats?.topVoices || []}
          open={showAllVoices}
          onClose={() => {
            setShowAllVoices(false)
          }}
        />
        <UsersWithUniqueNumbers
          user={user}
          open={showAllUsersWithUniqueNumbers}
          onClose={() => {
            setShowAllUsersWithUniqueNumbers(false)
          }}
          from="agency"
        />
        <div className="cursor-pointer flex flex-row items-start w-full gap-2">
          <img
            src={`${icon}`}
            alt="Icon"
            className="cursor-pointer w-12 h-12 flex-shrink-0 object-contain"
          />
          <div className="cursor-pointer flex flex-col flex-1 min-w-0 items-start gap-1">
            <p className="cursor-pointer font-semibold mt-2 mb-1 text-sm">{title}</p>
            {/* Show both count and percentage when both are valid (including count=0) */}
            {(typeof count === 'number' ||
              (count !== '' && count !== null && count !== undefined)) &&
              percentage !== '' &&
              percentage !== null &&
              percentage !== undefined && (
                <div className="cursor-pointer flex flex-col items-start">
                  <div
className="cursor-pointer font-medium text-2xl"
                  style={{
                    fontFamily: 'Inter',
                    fontSize: 24,
                    fontWeight: 500,
                  }}
                >
                  {count}
                  </div>
                  <p className="cursor-pointer text-gray-500 text-sm font-light">
                    {percentage}%
                  </p>
                </div>
              )}
            {/* Show single value (count or percentage) when only one exists */}
            {(!(
              typeof count === 'number' ||
              (count !== '' && count !== null && count !== undefined)
            ) ||
              !(
                percentage !== '' &&
                percentage !== null &&
                percentage !== undefined
              )) && (
              <div className="cursor-pointer flex flex-col items-start">
                <h2
                  className="cursor-pointer font-medium text-2xl"
                  style={{
                    fontFamily: 'Inter',
                    fontSize: 24,
                    fontWeight: 500,
                  }}
                >
                  {typeof count === 'number' ||
                  (count !== '' && count !== null && count !== undefined)
                    ? count
                    : percentage}
                  {!(
                    typeof count === 'number' ||
                    (count !== '' && count !== null && count !== undefined)
                  )
                    ? '%'
                    : ''}
                </h2>
                {(typeof count === 'number' ||
                  (count !== '' && count !== null && count !== undefined)) &&
                  percentage !== '' &&
                  percentage !== null &&
                  percentage !== undefined && (
<p className="cursor-pointer text-gray-500 text-sm">
                    {percentage}%
                  </p>
                  )}
              </div>
            )}
          </div>
        </div>
      </Card>
    )
  }

  return loading ? (
    <div className="flex flex-col justify-center items-center h-[90svh]">
      <CircularProgress size={45} />
    </div>
  ) : stats?.totalUsers > 0 ? (
    <div
      className="flex flex-col justify-start items-start h-[90svh] gap-3 pb-8 max-w-[1300px] w-full mx-auto m-3"
      style={{ overflow: 'auto', scrollbarWidth: 'none' }}
    >
      {/*  Stats  */}
      {/* <span className=" flex flex-row gap-2">
        <h1 className=" text-3xl font-regular mb-4">AgentX User</h1>
        <h1 className=" text-3xl font-regular mb-4 text-[#00000047]">Stat</h1>
      </span> */}
      {/*  Subscriptions  */}
      {stats?.totalUsers && stats?.usersOnPlans ? (
        <SubscriptionsStatsComponent
          stats={stats}
          onViewPlan={(planName) => {
            setSelectedPlanName(planName)
            setShowUsersWithPlan(true)
          }}
        />
      ) : (
        <div className="w-[96%] mt-4">
          <Image
            alt="placeholder"
            src="/agencyIcons/placeholderBox2.png"
            width={1200}
            height={120}
            style={{ width: '100%', height: 'auto' }}
          />
        </div>
      )}

      {/* Users with Plan Modal */}
      <UsersWithPlan
        user={user}
        open={showUsersWithPlan}
        planName={selectedPlanName}
        onClose={() => {
          setShowUsersWithPlan(false)
          setSelectedPlanName(null)
        }}
        from="agency"
        selectedAgency={selectedAgency}
      />

      {/*  DAU MAU  */}
      <div
        className="cursor-pointer grid gap-3 grid-cols-4 md:grid-cols-4 lg:grid-cols-4 px-8 py-4 rounded-lg w-[96%] text-left text-black/80 border-2 border-[hsl(var(--brand-primary))] relative overflow-hidden z-10"
        style={{
          backgroundColor: 'hsl(var(--brand-primary) / 0.05)',
          boxShadow: '0 4px 20px hsl(var(--brand-primary) / 0.15)',
        }}
      >
        {/* Animated SVG pattern background */}
        <div className="absolute inset-0 overflow-hidden rounded-lg pointer-events-none" aria-hidden>
          <svg className="absolute inset-0 w-full h-full opacity-[0.08]" style={{ animation: 'agentationPatternMove 20s linear infinite' }} xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="agentation-dot-pattern" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
                <circle cx="2" cy="2" r="0.5" fill="hsl(var(--brand-primary))" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#agentation-dot-pattern)" />
          </svg>
        </div>
        {/* Top Metrics */}
        <Card className="cursor-pointer flex flex-col items-start text-left border-none shadow-none min-w-0 w-full bg-transparent text-black/80 gap-3 relative z-0">
          <CardHeader className="p-0">
            <CardTitle className="text-[14px] font-medium">Daily Active Users</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <h2 className="cursor-pointer text-2xl font-semibold text-black/80">
              {stats?.activeUsers?.DAU?.count || '-'}
            </h2>
          </CardContent>
          <CardContent className="p-0">
            <h2 className="cursor-pointer text-[14px] font-normal text-black/70">
              {stats?.activeUsers?.DAU?.percentage || 0}%
            </h2>
          </CardContent>
        </Card>

        <Card className="cursor-pointer flex flex-col items-start text-left border-none shadow-none min-w-0 w-full bg-transparent text-black/80 gap-3 relative z-0">
          <CardHeader className="p-0">
            <CardTitle className="text-[14px] font-medium">Avg Weekly Sign Ups</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <h2 className="cursor-pointer text-2xl font-semibold text-black/80">
              {stats?.weeklySignups}
            </h2>
            {/* <Progress value={27} /> */}
          </CardContent>
          <CardContent className="p-0">
            <h2 className="cursor-pointer text-[14px] font-normal text-black/70">
              {stats?.weeklySignupsPercentage || 0}%
            </h2>
          </CardContent>
        </Card>

        <Card className="cursor-pointer flex flex-col items-start text-left border-none shadow-none min-w-0 w-full bg-transparent text-black/80 gap-3 relative z-0">
          <CardHeader className="p-0">
            <CardTitle className="text-[14px] font-medium">Monthly Active Users</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <h2 className="cursor-pointer text-2xl font-semibold text-black/80">
              {stats?.activeUsers?.MAU?.count || '-'}
            </h2>
          </CardContent>
          <CardContent className="p-0">
            <h2 className="cursor-pointer text-[14px] font-normal text-black/70">
              {stats?.activeUsers.MAU.percentage || 0}%
            </h2>
          </CardContent>
        </Card>

        <Card className="cursor-pointer flex flex-col items-start text-left border-none shadow-none min-w-0 w-full bg-transparent text-black/80 gap-3 relative z-0">
          <CardHeader className="p-0">
            <CardTitle className="text-[14px] font-medium">Session Length</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <h2 className="cursor-pointer text-2xl font-semibold text-black/80">
              {stats?.avgSessionDuration || '0 min'}
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
          setShowAllUsersWithAgents(false)
        }}
        from="agency"
      />

      <UsersWithPipelines
        user={user}
        open={showAllUsersWithPipelines}
        onClose={() => {
          setShowAllUsersWithPipelines(false)
        }}
        from="agency"
      />

      <UsersWithTeam
        user={user}
        open={showAllUsersWithTeam}
        onClose={() => {
          setShowAllUsersWithTeam(false)
        }}
        from="agency"
      />

      <UsersWithLeads
        user={user}
        open={showAllUsersWithLeads}
        onClose={() => {
          setShowAllUsersWithLeads(false)
        }}
        from="agency"
      />

      <UsersWithCalender
        user={user}
        open={showAllUsersWithCalender}
        onClose={() => {
          setShowAllUsersWithCalender(false)
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
            setShowAllVoices(true)
          }}
          onViewUniqueNumbers={() => {
            if (stats?.uniquePhoneUsers.count > 0) {
              setShowAllUsersWithUniqueNumbers(true)
            }
          }}
          from="agency"
        />
      </div>
      {/* </div> */}

      <div className=" grid gap-[-1px] grid-cols-5 md:grid-cols-5 lg:grid-cols-5 rounded-lg w-[96%]">
        {/* Top Metrics */}
        <button
          onClick={() => {
            if (stats?.agentUsers.count > 0) {
              setShowAllUsersWithAgents(true)
            }
          }}
        >
          {GetStatView(
            '> 2 agents',
            stats?.agentUsers.percentage,
            stats?.agentUsers.count,
            '/mt2agentsicon.png',
          )}
        </button>

        <button
          onClick={() => {
            if (stats?.pipelineUsers.count > 0) {
              setShowAllUsersWithPipelines(true)
            }
          }}
        >
          {GetStatView(
            '> 1 pipeline',
            stats?.pipelineUsers.percentage,
            stats?.pipelineUsers.count,
            '/mt1pipelineicon.png',
          )}
        </button>

        <button
          onClick={() => {
            if (stats?.leadsUsers.count > 0) {
              setShowAllUsersWithLeads(true)
            }
          }}
        >
          {GetStatView(
            'Uploaded Leads',
            stats?.leadsUsers.percentage,
            stats?.leadsUsers.count,
            '/uploadleadsicon.png',
          )}
        </button>

        <button
          onClick={() => {
            if (stats?.teamsUsers.count > 0) {
              setShowAllUsersWithTeam(true)
            }
          }}
        >
          {GetStatView(
            'Invited Teams',
            stats?.teamsUsers.percentage,
            stats?.teamsUsers.count,
            '/invtedteamsiocn.png',
          )}
        </button>

        <button
          onClick={() => {
            if (stats?.calendarUsers.count > 0) {
              setShowAllUsersWithCalender(true)
            }
          }}
        >
          {GetStatView(
            'Added calendar',
            stats?.calendarUsers.percentage,
            stats?.calendarUsers.count,
            '/addedtocalendaricon.png',
          )}
        </button>

        {GetStatView(
          'Call Success Rate',
          stats?.callSuccessRate,
          '',
          '/callsuccessicon.png',
        )}

        {GetStatView(
          'Average Call Per User',
          '',
          stats?.avgCallsPerUser,

          '/avgcallicon.png',
        )}
      </div>
    </div>
  ) : (
    <AgencyDashboardDefaultUI
      title={'User Activity'}
      description={
        'Your user activity metrics will appear once you have account activities'
      }
    />
  )
}

export default AgencyActivity

function VoicesComponent({
  stats,
  voiceIds = [
    { id: 'JVFlaC5njBD4JVXTPOyq', users: 231 },
    { id: 'PFIFGOLGFTh5WCxNE7aV', users: 408 },
    { id: 'SqVGDZffOHdbKuvIy7MP', users: 89 },
  ],
  onViewAll,
  onViewUniqueNumbers,
}) {
  function GetVoiceCard(index = 0) {
    const voice = voiceIds?.[index]

    if (!voice || !voice.voiceId) return null

    let color = 'bg-green-500/80'
    if (index == 1) {
      color = 'bg-purple-500/80'
    }
    if (index == 2) {
      color = 'bg-pink-500/80'
    }
    return (
      <Card className="cursor-pointer h-[192px] border-white relative border border-white shadow-[0px_4px_31.5px_0px_rgba(121,2,223,0.04)] rounded-2xl p-6 flex flex-col items-center text-center bg-white/60 overflow-hidden">
        <div
          className={`cursor-pointer absolute top-0 left-1/2 transform -translate-x-1/2 w-28 h-20 ${color} rounded-full blur-2xl`}
        />
        <div className="cursor-pointer relative w-20 h-20 mb-4">
          <div className="cursor-pointer -top-[15px] absolute left-1/2 transform -translate-x-1/2 inset-0 bg-white/40 w-12 h-12 rounded-full backdrop-blur-md" />
          <Avatar className="cursor-pointer w-11 h-11 absolute left-1/2 transform -translate-x-1/2 top-1/3 transform -translate-y-1/3">
            <AvatarImage
              src={FindVoice(voiceIds[index].voiceId).img}
              alt="User"
            />
          </Avatar>
        </div>
        <h2 className="cursor-pointer mt-4 text-black text-base font-medium leading-snug">
          {FindVoice(voiceIds[index].voiceId).name}
        </h2>
        <p className="cursor-pointer mt-4 text-black opacity-60 text-sm font-medium leading-tight">
          {voiceIds[index].count} agents
        </p>
      </Card>
    )
  }

  return (
    <div className=" grid gap-3 grid-cols-6 md:grid-cols-6 lg:grid-cols-6  bg-white pt-2 rounded-lg ">
      <Card className="cursor-pointer border-none flex flex-col items-center justify-center shadow-none w-[150px] min-w-[150px]">
        <CardContent>
          <h2 className="cursor-pointer text-base font-medium">Top</h2>
        </CardContent>
        <CardContent>
          <h1 className="cursor-pointer text-4xl font-regular">3</h1>
        </CardContent>
        <CardContent>
          <h2 className="cursor-pointer text-sm font-regular">Voices</h2>
        </CardContent>
      </Card>

      {GetVoiceCard(0)}
      {GetVoiceCard(1)}
      {GetVoiceCard(2)}
      <Card className="cursor-pointer cursor-pointer border-white bg-white60 flex flex-col items-center justify-center  w-[11vw] shadow-[0px_4px_31.5px_0px_rgba(121,2,223,0.04)]">
        <CardContent
          onClick={() => {
            //console.log;

            onViewAll()
          }}
        >
          <h2
            className="cursor-pointer text-lg font-regular"
            style={{ fontFamily: 'Inter' }}
          >
            View All
          </h2>
        </CardContent>
      </Card>

      <Card
        className="cursor-pointer border-none shadow-none rounded-lg p-2 flex flex-col items-center w-[13vw]"
        onClick={() => {
          onViewUniqueNumbers()
        }}
      >
        <div className="cursor-pointer flex flex-col gap-2 w-full mb-2">
          <img
            src="/invtedteamsiocn.png"
            alt="Icon"
            className="cursor-pointer w-[52px] h-[52px] -ml-2 -mt-3 object-contain"
          />
          <p className="cursor-pointer text-[14px] font-semibold mt-0 mb-0">Unique numbers</p>
        </div>
        <div className="cursor-pointer flex flex-col mr-2 items-start w-full">
          <h2 className="cursor-pointer text-4xl font-light">
            {/* {stats?.uniquePhoneUsers.count} */}
          </h2>
          <p className="cursor-pointer text-gray-500 text-[14px]">
            {stats?.uniquePhoneUsers.percentage}%
          </p>
        </div>
      </Card>
    </div>
  )
}

function SubscriptionsStatsComponent({ stats, plans, onViewPlan }) {
  const scrollContainerRef = React.useRef(null)
  const [showLeftArrow, setShowLeftArrow] = React.useState(false)
  const [showRightArrow, setShowRightArrow] = React.useState(true)

  const checkScrollButtons = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setShowLeftArrow(scrollLeft > 0)
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  React.useEffect(() => {
    checkScrollButtons()
    const container = scrollContainerRef.current
    if (container) {
      container.addEventListener('scroll', checkScrollButtons)
      // Check on resize
      window.addEventListener('resize', checkScrollButtons)
      return () => {
        container.removeEventListener('scroll', checkScrollButtons)
        window.removeEventListener('resize', checkScrollButtons)
      }
    }
  }, [stats?.usersOnPlans])

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300 // Scroll by 300px
      const currentScroll = scrollContainerRef.current.scrollLeft
      const newScroll =
        direction === 'right'
          ? currentScroll + scrollAmount
          : currentScroll - scrollAmount

      scrollContainerRef.current.scrollTo({
        left: newScroll,
        behavior: 'smooth',
      })
    }
  }

  return (
    <>
      <style jsx>{`
        .plans-scroll-container::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div className="relative bg-transparent rounded-lg w-[96%]">
        {/* Left Arrow Button */}
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white hover:bg-gray-100 rounded-full shadow-lg border border-gray-200 active:scale-[0.95] transition-transform"
            style={{ transform: 'translateY(-50%)' }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M15 18L9 12L15 6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        )}

        {/* Scrollable Container */}
        <div
          ref={scrollContainerRef}
          className="plans-scroll-container flex gap-3 overflow-x-auto py-3"
          style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none',
          }}
          onScroll={checkScrollButtons}
        >
        {/* Total Users Card */}
        {stats?.totalUsers ? (
          <Card className="cursor-pointer rounded-lg border border-[#EDEDED] shadow-none flex-shrink-0 w-[250px] min-w-[250px] px-4 py-3 flex flex-col gap-2">
            <CardHeader className="p-0">
              <CardTitle>Total Users</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <h2 className="cursor-pointer text-[32px] font-semibold mt-3">
                {stats?.totalUsers}
              </h2>
            </CardContent>
          </Card>
        ) : (
          <div className="flex-shrink-0">
            <Image
              alt="placeholder"
              src="/agencyIcons/placeholderBox.png"
              width={200}
              height={120}
            />
          </div>
        )}

        {/* Plan Cards */}
        {stats?.usersOnPlans ? (
          Object.entries(stats.usersOnPlans).map(([planName, data]) => (
            <Card
              key={planName}
              className="cursor-pointer rounded-lg border border-[#EDEDED] shadow-none flex-shrink-0 w-[250px] min-w-[250px] px-4 py-3 flex flex-col gap-2"
            >
              <CardHeader className="p-0 w-full flex flex-row items-baseline justify-between pb-2">
                <CardTitle className="text-sm font-semibold truncate flex-1 pr-2 leading-tight text-black/80">
                  {planName}
                </CardTitle>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    if (onViewPlan) {
                      onViewPlan(planName)
                    }
                  }}
                  className="text-sm text-black/80 font-semibold cursor-pointer no-underline flex-shrink-0 leading-tight px-3 py-1.5 rounded-lg bg-[#EAEAEA] border-0 active:scale-[0.95] transition-transform"
                >
                  View
                </button>
              </CardHeader>
              <div className="flex flex-col gap-1">
                <CardContent className="p-0">
<h2 className="cursor-pointer text-2xl font-medium">
                  {data.count}
                </h2>
                </CardContent>
                <CardContent className="p-0">
                  <p className="cursor-pointer text-sm font-regular text-gray-500">
                    {data.percentage}%
                  </p>
                </CardContent>
              </div>
            </Card>
          ))
        ) : (
          <div className="flex-shrink-0">
            <Image
              alt="placeholder"
              src="/agencyIcons/placeholderBox.png"
              width={320}
              height={120}
            />
          </div>
        )}
      </div>

      {/* Right Arrow Button */}
      {showRightArrow && (
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center bg-white hover:bg-gray-100 rounded-full shadow-lg border border-gray-200 active:scale-[0.95] transition-transform"
          style={{ transform: 'translateY(-50%)' }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M9 18L15 12L9 6"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      )}
      </div>
    </>
  )
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
