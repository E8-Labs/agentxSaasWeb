import { Switch, Tooltip } from '@mui/material'
import DOMPurify from 'dompurify'
import Image from 'next/image'
import React, { useEffect, useMemo, useState } from 'react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  createOrUpdateNotificationCustomization,
  deleteNotificationCustomization,
  setNotificationEnabled,
  toggleNotificationCustomization,
  toggleNotificationEnabled,
} from '@/services/notificationServices/NotificationCustomizationService'

import EditEmailNotification from './EditEmailNotification'
import EditPushNotification from './EditPushNotification'
import { StandardNotificationsList } from './WhiteLabelNotificationExtras'

const StandardNot = ({
  notificationsData = [],
  onRefresh,
  category = 'Standard',
  selectedAgency,
}) => {
  const [isEditPushModalOpen, setIsEditPushModalOpen] = useState(false)
  const [isEditEmailModalOpen, setIsEditEmailModalOpen] = useState(false)
  const [selectedNotification, setSelectedNotification] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(null)
  const [toggling, setToggling] = useState(null)
  const [togglingEnabled, setTogglingEnabled] = useState(null)
  const notificationRefs = React.useRef({})

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

  // Helper function to check if notification has actual content customizations
  const hasActualCustomizations = (item) => {
    if (!item.customization) return false
    
    const customization = item.customization
    const metadata = item.metadata
    
    // Check if any custom field differs from default
    const hasCustomPushTitle = customization.customPushTitle && 
      customization.customPushTitle !== metadata?.defaultPushTitle
    const hasCustomPushBody = customization.customPushBody && 
      customization.customPushBody !== metadata?.defaultPushBody
    const hasCustomEmailSubject = customization.customEmailSubject && 
      customization.customEmailSubject !== metadata?.defaultEmailSubject
    const hasCustomEmailBody = customization.customEmailBody && 
      customization.customEmailBody !== metadata?.defaultEmailBody
    const hasCustomCTA = customization.customEmailCTA && 
      customization.customEmailCTA !== metadata?.defaultEmailCTA
    
    // Return true if any content field is actually customized
    return hasCustomPushTitle || hasCustomPushBody || hasCustomEmailSubject || 
           hasCustomEmailBody || hasCustomCTA
  }

  // Transform API data to match the expected UI format
  const transformedNotifications = useMemo(() => {
    if (!notificationsData || notificationsData.length === 0) {
      return StandardNotificationsList // Fallback to hardcoded data
    }

    // Filter notifications by category
    return notificationsData
      .filter((item) => item.metadata?.category === category)
      .map((item, index) => {
        // Check if there are actual content customizations (not just toggle changes)
        const hasContentCustomizations = hasActualCustomizations(item)
        
        return {
          id: index + 1,
          notificationType: item.notificationType,
          title: item.metadata?.name || 'Notification',
          description: item.metadata?.description || '',
          tootTip: item.metadata?.description || '',
          // App Notification (Push) fields
          appNotficationTitle:
            item.customization?.customPushTitle ||
            item.metadata?.defaultPushTitle ||
            '',
          appNotficationBody:
            item.customization?.customPushBody ||
            item.metadata?.defaultPushBody ||
            '',
          appNotficationCTA:
            item.customization?.customEmailCTA ||
            item.metadata?.defaultEmailCTA ||
            '',
          // Email Template fields
          emailNotficationTitle:
            item.customization?.customEmailSubject ||
            item.metadata?.defaultEmailSubject ||
            '',
          emailNotficationBody:
            item.customization?.customEmailBody ||
            item.metadata?.defaultEmailBody ||
            '',
          emailNotficationCTA:
            item.customization?.customEmailCTA ||
            item.metadata?.defaultEmailCTA ||
            '',
          // Legacy fields for backward compatibility
          subject:
            item.customization?.customEmailSubject ||
            item.metadata?.defaultEmailSubject ||
            '',
          subjectDescription:
            item.customization?.customEmailBody ||
            item.metadata?.defaultEmailBody ||
            '',
          CTA:
            item.customization?.customEmailCTA ||
            item.metadata?.defaultEmailCTA ||
            '',
          isActive: item.isActive,
          isCustomized: hasContentCustomizations, // Only true if content is actually customized
          isNotificationEnabled: item.isNotificationEnabled ?? true, // Default to true
          availableVariables: item.metadata?.availableVariables || [],
          supportsCTA: item.metadata?.supportsCTA || false,
          // Store original item for reference
          originalItem: item,
        }
      })
  }, [notificationsData, category])

  const handleEditPushClick = (notification) => {
    setSelectedNotification(notification)
    setIsEditPushModalOpen(true)
  }

  const handleEditEmailClick = (notification) => {
    setSelectedNotification(notification)
    setIsEditEmailModalOpen(true)
  }

  const handleSavePushNotification = async (updatedData) => {
    try {
      setSaving(true)

      // Store the notification type to scroll to after refresh
      const notificationType = selectedNotification.actualNotificationType ||
        selectedNotification.notificationType

      // Prepare data for API with push notification fields
      // Only include fields that are explicitly provided (not undefined)
      // Allow null and empty strings to clear fields, but don't send undefined fields
      const apiData = {
        isActive: true,
      }

      if (updatedData.pushTitle !== undefined) {
        apiData.customPushTitle = updatedData.pushTitle || null
      }

      if (updatedData.pushBody !== undefined) {
        apiData.customPushBody = updatedData.pushBody || null
      }

      if (updatedData.cta !== undefined) {
        apiData.customEmailCTA = updatedData.cta || null
      }

      // Call API to save customization
      const userId = selectedAgency?.id || undefined
      await createOrUpdateNotificationCustomization(
        notificationType,
        apiData,
        userId,
      )

      console.log('Push notification saved successfully')

      // Refresh the data
      if (onRefresh) {
        await onRefresh()
      }

      // Scroll to the notification after refresh
      setTimeout(() => {
        const notificationElement = notificationRefs.current[notificationType]
        if (notificationElement) {
          notificationElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 100)
    } catch (error) {
      console.error('Error saving push notification:', error)
      alert('Failed to save push notification. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleSaveEmailNotification = async (updatedData) => {
    try {
      setSaving(true)

      // Store the notification type to scroll to after refresh
      const notificationType = selectedNotification.actualNotificationType ||
        selectedNotification.notificationType

      // Prepare data for API with email fields
      // Only include fields that are explicitly provided (not undefined)
      // Allow null and empty strings to clear fields, but don't send undefined fields
      const apiData = {
        isActive: true,
      }

      if (updatedData.emailSubject !== undefined) {
        apiData.customEmailSubject = updatedData.emailSubject || null
      }

      if (updatedData.emailBody !== undefined) {
        apiData.customEmailBody = updatedData.emailBody || null
      }

      if (updatedData.cta !== undefined) {
        apiData.customEmailCTA = updatedData.cta || null
      }

      // Call API to save customization
      const userId = selectedAgency?.id || undefined
      await createOrUpdateNotificationCustomization(
        notificationType,
        apiData,
        userId,
      )

      console.log('Email notification saved successfully')

      // Refresh the data
      if (onRefresh) {
        await onRefresh()
      }

      // Scroll to the notification after refresh
      setTimeout(() => {
        const notificationElement = notificationRefs.current[notificationType]
        if (notificationElement) {
          notificationElement.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      }, 100)
    } catch (error) {
      console.error('Error saving email notification:', error)
      alert('Failed to save email notification. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const handleClosePushModal = () => {
    setIsEditPushModalOpen(false)
    setSelectedNotification(null)
  }

  const handleCloseEmailModal = () => {
    setIsEditEmailModalOpen(false)
    setSelectedNotification(null)
  }

  const handleDelete = async (notification) => {
    if (
      !confirm(
        'Are you sure you want to revert this notification to defaults? This action cannot be undone.',
      )
    ) {
      return
    }

    try {
      setDeleting(notification.notificationType)

      const userId = selectedAgency?.id || undefined
      await deleteNotificationCustomization(notification.notificationType, userId)

      console.log('Notification customization deleted successfully')

      // Refresh the data
      if (onRefresh) {
        await onRefresh()
      }
    } catch (error) {
      console.error('Error deleting notification customization:', error)
      alert('Failed to delete notification customization. Please try again.')
    } finally {
      setDeleting(null)
    }
  }

  const handleToggle = async (notification) => {
    try {
      setToggling(notification.notificationType)

      const userId = selectedAgency?.id || undefined
      await toggleNotificationCustomization(notification.notificationType, userId)

      console.log('Notification toggled successfully')

      // Refresh the data
      if (onRefresh) {
        await onRefresh()
      }
    } catch (error) {
      console.error('Error toggling notification:', error)
      alert('Failed to toggle notification. Please try again.')
    } finally {
      setToggling(null)
    }
  }

  const handleToggleEnabled = async (notification) => {
    try {
      setTogglingEnabled(notification.notificationType)

      const userId = selectedAgency?.id || undefined
      await toggleNotificationEnabled(notification.notificationType, userId)

      console.log('Notification enabled status toggled successfully')

      // Refresh the data
      if (onRefresh) {
        await onRefresh()
      }
    } catch (error) {
      console.error('Error toggling notification enabled status:', error)
      alert('Failed to toggle notification enabled status. Please try again.')
    } finally {
      setTogglingEnabled(null)
    }
  }

  return (
    <>
      {saving && (
        <div className="w-full flex justify-center items-center py-4">
          <div className="text-brand-primary">Saving...</div>
        </div>
      )}
      {transformedNotifications.map((item) => {
        return (
          <div 
            key={item.id} 
            ref={(el) => {
              if (el) {
                notificationRefs.current[item.notificationType] = el
              }
            }}
            className="w-full border-b px-4 pb-4 mb-4"
          >
            <div className="flex flex-row items-center justify-between mb-2">
              <div style={styles.semiBoldHeading}>
                {item.title || 'Team member Invite email'}
              </div>
              <div className="flex items-center gap-3">
                {/* Enable/Disable Toggle Switch */}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-600">
                    {item.isNotificationEnabled ? 'Enabled' : 'Disabled'}
                  </span>
                  <Tooltip
                    title={
                      item.isNotificationEnabled
                        ? 'Disable this notification for subaccounts'
                        : 'Enable this notification for subaccounts'
                    }
                    placement="top"
                  >
                    <Switch
                      checked={item.isNotificationEnabled ?? true}
                      onChange={() => handleToggleEnabled(item)}
                      disabled={togglingEnabled === item.notificationType}
                      color="primary"
                      size="small"
                    />
                  </Tooltip>
                </div>

                {/* Delete Button - Only show if notification is enabled and customized */}
                {item.isCustomized && item.isNotificationEnabled && (
                  <button
                    onClick={() => handleDelete(item)}
                    disabled={deleting === item.notificationType}
                    className="text-red-500 hover:text-red-700 text-xs px-2 py-1 border border-red-300 rounded hover:bg-red-50 disabled:opacity-50"
                    title="Revert to defaults"
                  >
                    {deleting === item.notificationType
                      ? 'Deleting...'
                      : 'Revert'}
                  </button>
                )}
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
                        className="outline-none border-none relative"
                        style={styles.smallRegular}
                        onClick={() => handleEditPushClick(item)}
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
                    {item.supportsCTA && item.appNotficationCTA && (
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
                      className="text-brand-primary"
                      style={{
                        fontSize: 18,
                        fontWeight: 600,
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
                          className="outline-none border-none relative"
                          style={styles.smallRegular}
                          onClick={() => handleEditEmailClick(item)}
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
                      {item.supportsCTA && item.emailNotficationCTA && (
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

      {/* Edit Push Notification Modal */}
      <EditPushNotification
        isOpen={isEditPushModalOpen}
        onClose={handleClosePushModal}
        notificationData={selectedNotification}
        onSave={handleSavePushNotification}
      />

      {/* Edit Email Notification Modal */}
      <EditEmailNotification
        isOpen={isEditEmailModalOpen}
        onClose={handleCloseEmailModal}
        notificationData={selectedNotification}
        onSave={handleSaveEmailNotification}
      />
    </>
  )
}

export default StandardNot

const styles = {
  semiBoldHeading: { fontSize: 16, fontWeight: '600' },
  mediumRegular: { fontSize: 16, fontWeight: '400' },
  smallRegular: { fontSize: 12, fontWeight: '400' },
  inputs: { fontSize: '15px', fontWeight: '500', color: '#000000' },
}
