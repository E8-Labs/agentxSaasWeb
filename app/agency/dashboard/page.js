'use client'

import { ErrorBoundary } from 'next/dist/client/components/error-boundary'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

import AdminDashboardCallLogs from '@/components/admin/CallLogs/AdminDashboardCallLogs'
import AdminAffiliates from '@/components/admin/affiliates/AdminAffiliates'
import Dashboard from '@/components/admin/dashboard/dashboard'
import AdminUsers from '@/components/admin/users/AdminUsers'
import PhoneVerificationCodesList from '@/components/admin/verificationCodesList/PhoneVerificationCodesList'
import AgencyDashboard from '@/components/agency/dashboard/AgencyDashboard'
import BackgroundVideo from '@/components/general/BackgroundVideo'
import ProtectedRoute from '@/components/permissions/ProtectedRoute'
import { PermissionProvider } from '@/contexts/PermissionContext'
import { logout } from '@/utilities/UserUtility'

function Page() {
  const router = useRouter()
  const manuBar = [
    {
      id: 1,
      name: 'Dashboard',
    },

    {
      id: 2,
      name: 'Call Logs',
    },
  ]

  const [selectedManu, setSelectedManu] = useState(manuBar[0])

  return (
    <PermissionProvider>
      <ProtectedRoute
        permissionKey="agency.dashboard.view"
        hideIfNoPermission={false}
        fallback={
          <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h2>Access Denied</h2>
            <p>You do not have permission to view the dashboard.</p>
          </div>
        }
      >
        <div className="w-full flex flex-col items-center h-[99svh] overflow-hidden ">
          <AgencyDashboard />
        </div>
      </ProtectedRoute>
    </PermissionProvider>
  )
}

export default Page

{
  /*<div className="w-full flex flex-col items-center h-[99svh] overflow-hidden ">
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            backgroundColor: "white",
            zIndex: -1, // Ensure the video stays behind content
          }}
        >
          {selectedManu.id === 1 && (
            <BackgroundVideo showImageOnly={true} imageUrl="/adminbg.png" />
          )}
        </div>

        <div className="flex w-[80vw] flex-row items-center justify-start gap-3 px-10 pt-2">
          {manuBar.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                if (item.name == "Logout") {
                  logout();
                  router.replace("/");
                } else {
                  setSelectedManu(item);
                }
              }}
              className={`flex flex-row items-center gap-3 p-2 items-center 
                      ${selectedManu.id == item.id &&
                "border-b-[2px] border-purple"
                }`}
            >
              <div
                style={{
                  fontSize: 16,
                  fontWeight: 500,
                  color: selectedManu.id == item.id ? "#7902df" : "#000",
                }}
              >
                {item.name}
              </div>
            </button>
          ))}
        </div>

        <div className="w-full items-center">
          {selectedManu.name === "Call Logs" ? (
            <AdminDashboardCallLogs />
          ) : (
            <div>
              <AgencyDashboard />
            </div>
          )}
        </div>
        </div>*/
}
