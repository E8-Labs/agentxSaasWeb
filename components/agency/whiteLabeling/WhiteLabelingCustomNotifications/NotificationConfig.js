import React, { useEffect, useState } from 'react'

import { getAllNotificationCustomizations } from '@/services/notificationServices/NotificationCustomizationService'

import LabelingHeader from '../LabelingHeader'
import StandardNot from './StandardNot'
import TrialPeriodNot from './TrialPeriodNot'

const NotificationConfig = () => {
  const [selectedNotificationTab, setSelectedNotificationTab] = useState(1)
  const [notificationsData, setNotificationsData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch notification customizations on component mount
  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await getAllNotificationCustomizations()
      if (response.success) {
        setNotificationsData(response.data)
      }
    } catch (err) {
      console.error('Error fetching notifications:', err)
      setError('Failed to load notifications. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const notificationTabs = [
    { id: 1, title: 'Standard' },
    { id: 3, title: 'Post Trial Period' },
    { id: 4, title: 'Gamification' },
  ]

  return (
    <div>
      {/* Banner Section */}
      <LabelingHeader
        img={'/agencyIcons/Notification.png'}
        title={'Configure your notifications '}
        description={
          'Customize your notification preferences to control how clients experience the platform.'
        }
      />

      {/* Notification tabs */}
      <div className="w-full border-b flex flex-row items-center">
        {notificationTabs.map((item) => {
          return (
            <button
              key={item.id}
              className={`outline-none ${selectedNotificationTab === item.id && 'border-b-4 border-brand-primary'} h-[45px] px-4`}
              onClick={() => {
                setSelectedNotificationTab(item.id)
              }}
            >
              {item.title}
            </button>
          )
        })}
      </div>

      <div className="w-full flex flex-row justify-center pt-8">
        <div className="w-8/12 px-3 py-4 bg-white rounded-2xl shadow-[0px_11px_39.3px_0px_rgba(0,0,0,0.06)] flex flex-col items-center gap-4 overflow-hidden">
          {/* Loading State */}
          {loading && (
            <div className="w-full flex justify-center items-center py-8">
              <div className="text-gray-500">Loading notifications...</div>
            </div>
          )}

          {/* Error State */}
          {error && !loading && (
            <div className="w-full flex justify-center items-center py-8">
              <div className="text-red-500">{error}</div>
            </div>
          )}

          {/* Content */}
          {!loading && !error && (
            <div className="w-full">
              {selectedNotificationTab === 1 && (
                <StandardNot
                  notificationsData={notificationsData}
                  onRefresh={fetchNotifications}
                  category="Standard"
                />
              )}
              {selectedNotificationTab === 2 && (
                <TrialPeriodNot notificationsListArray={'TrialPeriod'} />
              )}
              {selectedNotificationTab === 3 && (
                <TrialPeriodNot notificationsListArray={'PostTrialPeriod'} />
              )}
              {selectedNotificationTab === 4 && (
                <StandardNot
                  notificationsData={notificationsData}
                  onRefresh={fetchNotifications}
                  category="Gamification"
                />
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default NotificationConfig
