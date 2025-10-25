import React, { useState } from 'react'
import LabelingHeader from '../LabelingHeader'
import StandardNot from './StandardNot'
import TrialPeriodNot from './TrialPeriodNot'

const NotificationConfig = () => {

  const [selectedNotificationTab, setSelectedNotificationTab] = useState(1)

  const notificationTabs = [
    { id: 1, title: "Standard" },
    { id: 2, title: "Trial Period" },
    { id: 3, title: "Post Trial Period" },
    { id: 4, title: "Gamification" },
  ];

  return (
    <div>
      {/* Banner Section */}
      <LabelingHeader
        img={"/agencyIcons/notification.png"}
        title={"Notification Settings"}
        description={"Customize your notification preferences to control how clients experience the platform."}
      />

      {/* Notification tabs */}
      <div className="w-full border-b flex flex-row items-center">
        {
          notificationTabs.map((item) => {
            return (
              <button
                key={item.id}
                className={`outline-none ${selectedNotificationTab === item.id && "border-b-4 border-purple"} h-[45px] px-4`}
                onClick={() => { setSelectedNotificationTab(item.id) }}
              >
                {item.title}
              </button>
            )
          })
        }
      </div>

      <div className="w-full flex flex-row justify-center pt-8">
        <div className="w-8/12 px-3 py-4 bg-white rounded-2xl shadow-[0px_11px_39.3px_0px_rgba(0,0,0,0.06)] flex flex-col items-center gap-4 overflow-hidden">
          {/* Domain Title */}
          <div className="w-full">
            {
              selectedNotificationTab === 1 && (
                <StandardNot />
              )
            }
            {
              selectedNotificationTab === 2 && (
                <TrialPeriodNot notificationsListArray={"TrialPeriod"} />
              )
            }
            {
              selectedNotificationTab === 3 && (
                <TrialPeriodNot notificationsListArray={"PostTrialPeriod"} />
              )
            }
            {
              selectedNotificationTab === 4 && (
                <TrialPeriodNot notificationsListArray={"Gamification"} />
              )
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default NotificationConfig
