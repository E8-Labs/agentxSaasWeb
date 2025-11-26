import { Tooltip } from '@mui/material'
import DOMPurify from 'dompurify'
import Image from 'next/image'
import React, { useState } from 'react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'

import EditNotifications from './EditNotifications'
import {
  GamificationNotificationList,
  PostTrialPeriodNotificationsList,
  TrialPeriodNotificationsList,
} from './WhiteLabelNotificationExtras'

const TrialPeriodNot = ({ notificationsListArray }) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState(null)
  const [notificationsList, setNotificationsList] = useState(
    notificationsListArray === 'TrialPeriod'
      ? TrialPeriodNotificationsList
      : notificationsListArray === 'PostTrialPeriod'
        ? PostTrialPeriodNotificationsList
        : GamificationNotificationList,
  )

  // Sanitize HTML for safe rendering
  const sanitizeHTML = (html) => {
    if (typeof window === 'undefined') return html // Skip sanitization on server
    return DOMPurify.sanitize(html || '', {
      ALLOWED_TAGS: [
        'p',
        'br',
        'strong',
        'em',
        'u',
        'ol',
        'ul',
        'li',
        'a',
        'span',
        'h1',
        'h2',
        'h3',
        'h4',
        'h5',
        'h6',
      ],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'style', 'class'],
    })
  }

  const handleEditClick = (notification) => {
    // console.log("Selected notification is", notification)
    setSelectedNotification(notification)
    setIsEditModalOpen(true)
  }

  const handleSaveNotification = (updatedData) => {
    // Update the notifications list with the edited data
    setNotificationsList((prevList) =>
      prevList.map((item) => {
        if (item.id === selectedNotification.id) {
          // Check if we're editing App Notification or Email Template
          if (selectedNotification.notificationType === 'App Notification') {
            return {
              ...item,
              title: updatedData.title,
              appNotficationTitle: updatedData.subject,
              appNotficationBody: updatedData.description,
              appNotficationCTA: updatedData.cta,
            }
          } else if (
            selectedNotification.notificationType === 'Email Template'
          ) {
            return {
              ...item,
              title: updatedData.title,
              emailNotficationTitle: updatedData.subject,
              emailNotficationBody: updatedData.description,
              emailNotficationCTA: updatedData.cta,
            }
          }
        }
        return item
      }),
    )
    console.log('Updated notification data:', updatedData)
  }

  const handleCloseModal = () => {
    setIsEditModalOpen(false)
    setSelectedNotification(null)
  }

  return (
    <>
      {notificationsList.map((item) => {
        return (
          <div key={item.id} className="w-full border-b px-4 pb-4 mb-4">
            <div className="flex flex-row items-center justify-between mb-2">
              <div style={styles.semiBoldHeading}>
                {item.title || 'Notification'}
              </div>
            </div>
            <div className="flex flex-row items-center gap-2 mb-4">
              <Tooltip
                title={item.tootTip}
                placement="top"
                arrow
                componentsProps={{
                  tooltip: {
                    sx: {
                      backgroundColor: '#ffffff',
                      color: '#333',
                      fontSize: '14px',
                      padding: '10px 15px',
                      borderRadius: '8px',
                      boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.2)',
                    },
                  },
                  arrow: {
                    sx: {
                      color: '#ffffff',
                    },
                  },
                }}
              >
                <Image
                  src="/otherAssets/infoLightDark.png"
                  alt="info"
                  width={12}
                  height={12}
                  className="cursor-pointer rounded-full"
                />
              </Tooltip>
              <div style={styles.smallRegular}>
                {`${item.description || '{{ When email is sent }}'}`}
              </div>
            </div>

            {/* Accordion for App Notification and Email */}
            <Accordion
              type="multiple"
              defaultValue={[`app-${item.id}`, `email-${item.id}`]}
              className="w-full"
            >
              {/* App Notification Section */}
              <AccordionItem value={`app-${item.id}`}>
                <AccordionTrigger>
                  <h3
                    className="text-brand-primary"
                    style={{ fontSize: 18, fontWeight: 600 }}
                  >
                    App Notification
                  </h3>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="bg-[#F9F9F9] p-4 rounded-lg">
                    <div className="flex flex-row items-center justify-between mb-4">
                      <div>
                        <span style={styles.semiBoldHeading}>Title:</span>
                        <span className="ms-2" style={styles.smallRegular}>
                          {item.appNotficationTitle}
                        </span>
                      </div>
                      <button
                        className="outline-none border-none"
                        style={styles.smallRegular}
                        onClick={() =>
                          handleEditClick({
                            ...item,
                            notificationType: 'App Notification',
                            subject: item.appNotficationTitle,
                            subjectDescription: item.appNotficationBody,
                            CTA: item.appNotficationCTA,
                          })
                        }
                        title="Edit push notification"
                      >
                        <div
                          style={{
                            width: '16px',
                            height: '16px',
                            backgroundColor: 'hsl(var(--brand-primary))',
                            WebkitMaskImage: 'url(/agencyIcons/purplePen.png)',
                            maskImage: 'url(/agencyIcons/purplePen.png)',
                            WebkitMaskSize: 'contain',
                            maskSize: 'contain',
                            WebkitMaskRepeat: 'no-repeat',
                            maskRepeat: 'no-repeat',
                            WebkitMaskPosition: 'center',
                            maskPosition: 'center',
                          }}
                        />
                      </button>
                    </div>
                    <div className="mb-4">
                      <span style={styles.semiBoldHeading}>Body:</span>
                      <div style={styles.mediumRegular} className="mt-2">
                        {item.appNotficationBody}
                      </div>
                    </div>
                    {item.appNotficationCTA && (
                      <div>
                        <span style={styles.semiBoldHeading}>CTA:</span>
                        <span
                          className="ms-2 text-brand-primary underline"
                          style={styles.mediumRegular}
                        >
                          {item.appNotficationCTA}
                        </span>
                      </div>
                    )}
                  </div>
                </AccordionContent>
              </AccordionItem>

              {/* Email Template Section - Only show if notification has email template */}
              {(item.emailNotficationTitle || item.emailNotficationBody) && (
                <AccordionItem value={`email-${item.id}`}>
                  <AccordionTrigger>
                    <h3
                      style={{
                        fontSize: 18,
                        fontWeight: 600,
                        color: 'hsl(var(--brand-primary))',
                      }}
                    >
                      Email Notification
                    </h3>
                  </AccordionTrigger>
                  <AccordionContent>
                    <div className="bg-[#F9F9F9] p-4 rounded-lg">
                      <div className="flex flex-row items-center justify-between mb-4">
                        <div>
                          <span style={styles.semiBoldHeading}>Subject:</span>
                          <span className="ms-2" style={styles.smallRegular}>
                            {item.emailNotficationTitle}
                          </span>
                        </div>
                        <button
                          className="outline-none border-none"
                          style={styles.smallRegular}
                          onClick={() =>
                            handleEditClick({
                              ...item,
                              notificationType: 'Email Template',
                              subject: item.emailNotficationTitle,
                              subjectDescription: item.emailNotficationBody,
                              CTA: item.emailNotficationCTA,
                            })
                          }
                          title="Edit email notification"
                        >
                          <div
                            style={{
                              width: '16px',
                              height: '16px',
                              backgroundColor: 'hsl(var(--brand-primary))',
                              WebkitMaskImage: 'url(/agencyIcons/purplePen.png)',
                              maskImage: 'url(/agencyIcons/purplePen.png)',
                              WebkitMaskSize: 'contain',
                              maskSize: 'contain',
                              WebkitMaskRepeat: 'no-repeat',
                              maskRepeat: 'no-repeat',
                              WebkitMaskPosition: 'center',
                              maskPosition: 'center',
                            }}
                          />
                        </button>
                      </div>
                      <div className="mb-4">
                        <span style={styles.semiBoldHeading}>Body:</span>
                        <div
                          style={styles.mediumRegular}
                          className="mt-2"
                          dangerouslySetInnerHTML={{
                            __html: sanitizeHTML(item.emailNotficationBody),
                          }}
                        />
                      </div>
                      {item.emailNotficationCTA && (
                        <div>
                          <span style={styles.semiBoldHeading}>CTA:</span>
                          <span
                            className="ms-2 text-brand-primary underline"
                            style={styles.mediumRegular}
                          >
                            {item.emailNotficationCTA}
                          </span>
                        </div>
                      )}
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )}
            </Accordion>
          </div>
        )
      })}

      {/* Edit Notifications Modal */}
      <EditNotifications
        isOpen={isEditModalOpen}
        onClose={handleCloseModal}
        notificationData={selectedNotification}
        onSave={handleSaveNotification}
      />
    </>
  )
}

export default TrialPeriodNot

const styles = {
  semiBoldHeading: { fontSize: 16, fontWeight: '600' },
  mediumRegular: { fontSize: 16, fontWeight: '400' },
  smallRegular: { fontSize: 12, fontWeight: '400' },
  inputs: { fontSize: '15px', fontWeight: '500', color: '#000000' },
}
