import React from 'react'
import Image from 'next/image'

import UnlockPremiunFeatures from '../globalExtras/UnlockPremiunFeatures'

export const KycCategory = {
  CategoryNeeds: 'need',
  CategoryMotivation: 'motivation',
  CategoryUrgency: 'urgency',
}

export const SnackMessageTitles = {
  ErrorTitlePhoneRequiredLeadImport: 'Phone number required',
  ErrorMessagePhoneRequiredLeadImport: "Can't upload leads without a phone",
  ErrorTitleFirstNameRequiredLeadImport: 'First Name required',
  ErrorMessageFirstNameRequiredLeadImport:
    "Can't upload leads without a First Name",
}

export const BatchStatus = {
  // Pending: "Pending",
  Scheduled: 'Scheduled',
  Active: 'Active',
  Paused: 'Paused',
  PausedForNonPayment: 'PausedForNonPayment',
  PausedForUpdateCadence: 'PausedForUpdateCadence',
  PausedForNoPhoneNumber: 'PausedForNoPhoneNumber',
  Completed: 'Completed', // the rest of the cadence for that
}

export const stagesDropdown = [
  {
    id: 1,
    title: 'Rename',
    img: '/assets/editPen.png',
  },
  {
    id: 2,
    title: 'Color',
    img: '',
  },
  {
    id: 1,
    title: 'Configure',
    img: '',
  },
  {
    id: 3,
    title: 'Delete',
    img: '',
  },
]

/** Communication styles for Message Settings – Style modal (value stored in backend). */
export const COMMUNICATION_STYLES = [
  { value: 'formal', label: 'Formal Tone', example: "Dear Mr./Mrs. [Client's last name], we are pleased to present to you a curated list of properties that align impeccably with your stated preferences." },
  { value: 'informal', label: 'Informal Tone', example: "Hey [Client's first name]! Got some cool places for you to check out. Let's catch up and go through them!" },
  { value: 'friendly', label: 'Friendly Tone', example: "Hello [Client's name]! It's wonderful to see you again. I have some lovely options that I'm eager to share with you!" },
  { value: 'serious', label: 'Serious Tone', example: 'We need to discuss the recent market fluctuations and its implications on our strategy.' },
  { value: 'optimistic', label: 'Optimistic Tone', example: "Despite the competitive market, I'm confident we'll find your dream home soon!" },
  { value: 'assertive', label: 'Assertive Tone', example: "We should act quickly and place an offer on this property before it's off the market." },
  { value: 'passive', label: 'Passive Tone', example: "Perhaps, if you think it's suitable, we might explore" },
]

/** Tailoring Communication – options (value stored in backend). */
export const TAILORING_COMMUNICATION_OPTIONS = [
  { value: 'adjust_formality', label: 'I adjust my formality level.' },
  { value: 'adapt_enthusiasm', label: 'I adapt my enthusiasm and energy level.' },
  { value: 'modify_complexity', label: 'I modify my language complexity.' },
  { value: 'stay_consistent', label: "I don't change my style; I stay consistent." },
  { value: 'client_preferences', label: "I adjust based on client's expressed preferences." },
]

/** Sentence Structure – options (value stored in backend). */
export const SENTENCE_STRUCTURE_OPTIONS = [
  { value: 'short_concise', label: 'Short and concise sentences.' },
  { value: 'elaborate_detailed', label: 'Elaborate and detailed explanations.' },
  { value: 'balanced_mix', label: 'A balanced mix of both, depending on the situation.' },
  { value: 'match_client', label: "I adapt my sentence structure to match the client's preference." },
  { value: 'vary_by_complexity', label: "I vary my approach based on the complexity of the information." },
]

/** Expressing Enthusiasm – options (value stored in backend). */
export const EXPRESSING_ENTHUSIASM_OPTIONS = [
  { value: 'upbeat_tone', label: 'Upbeat Tone', bestFor: 'infectious enthusiasm', example: 'I show excitement through my voice and positive energy.' },
  { value: 'highlighting_benefits', label: 'Highlighting Standout Benefits', bestFor: 'value-focused conversations', example: "I get excited by calling out what makes something special." },
  { value: 'expressive_language', label: 'Expressive Language', bestFor: 'high-energy communication', example: 'I use exclamations or energetic phrasing to show excitement.' },
  { value: 'personal_relevance', label: 'Personal Relevance', bestFor: 'personal connection', example: 'I connect the topic to what matters to them.' },
  { value: 'descriptive_storytelling', label: 'Descriptive Storytelling', bestFor: 'immersive conversations', example: "I paint a vivid picture so they can imagine the experience." },
]

/** Explaining Complex Concepts – options (value stored in backend). */
export const EXPLAINING_COMPLEX_CONCEPTS_OPTIONS = [
  { value: 'simplified_analogies', label: 'Simplified with Analogies', bestFor: 'quick understanding', example: "I like to explain it in everyday terms so it's easy to grasp." },
  { value: 'visual_illustrative', label: 'Visual or Illustrative', bestFor: 'visual learners', example: 'I prefer visuals or diagrams to make things clearer.' },
  { value: 'step_by_step', label: 'Step-by-Step Breakdown', bestFor: 'structured thinkers', example: 'I walk through it in a clear sequence so nothing is missed.' },
  { value: 'real_world_examples', label: 'Real-World Examples', bestFor: 'practical understanding', example: 'I use real scenarios or past experiences to make it relatable.' },
  { value: 'shared_resources', label: 'Shared Resources', bestFor: 'self-guided learners', example: 'I point people to helpful articles, videos, or guides for deeper clarity.' },
]

/** Giving updates – options (value stored in backend). */
export const GIVING_UPDATES_OPTIONS = [
  { value: 'direct_straightforward', label: 'Direct and Straightforward', example: "I want to be upfront—this didn't move forward as expected.", bestFor: 'clarity and decisiveness.' },
  { value: 'empathetic_reassuring', label: 'Empathetic and Reassuring', example: "I know this isn't easy to hear, and I want to walk you through what this means.", bestFor: 'trust and emotional awareness.' },
  { value: 'solution_oriented', label: 'Solution-Oriented', example: "This didn't go as planned, but here are a few ways we can move forward.", bestFor: 'momentum and problem-solving.' },
  { value: 'gradual_detailed', label: 'Gradual and Detailed', example: "Let's review what happened step by step so everything is clear.", bestFor: 'complex situations and transparency.' },
  { value: 'context_sensitive', label: 'Context-Sensitive', example: "This is important enough that I'd prefer to discuss it at the right time or in the right setting.", bestFor: 'high-stakes or sensitive conversations.' },
]

/** Handling Objections – options (value stored in backend). */
export const HANDLING_OBJECTIONS_OPTIONS = [
  { value: 'detailed_explanations', label: 'Provide Detailed Explanations' },
  { value: 'reassurance_solutions', label: 'Offer Reassurance and Solutions' },
  { value: 'redirect_positive', label: 'Redirect to Positive Aspects' },
  { value: 'acknowledge_validate', label: 'Acknowledge and Validate Concerns' },
  { value: 'compromises_alternatives', label: 'Seek Compromises and Alternatives' },
]

//check if this is user/agency/admin route them accordingly
// export const checkCurrentUserRole = () => {

//   const localData = localStorage.getItem("User");
//   console.log("Current path is:", window.location.pathname);
//   let currentPath = window.location.pathname;
//   if (localData) {
//     let d = JSON.parse(localData);
//     console.log("Test log trigered");

//     // set user type in global variable

//     if (d.user.userType == "admin") {
//       // router.push("/admin");
//       window.location.href = "/admin";
//     } else if (d.user.userRole == "Agency" || d.user.agencyTeamMember === true) {
//       // router.push("/agency/dashboard");
//       window.location.href = "/agency/dashboard";
//     } else if (d.user.userRole == "AgencySubAccount") {
//       // router.push("/subaccountInvite/subscribeSubAccountPlan");
//       window.location.href = "/dashboard";
//       // router.push("/dashboard");
//     } else {
//       window.location.href = "/dashboard";
//       // router.push("/dashboard");
//     }
//   }
// }

export const checkCurrentUserRole = () => {
  if (typeof window === 'undefined') {
    return // stop here during SSR
  }

  const localData = localStorage.getItem('User')
  let currentPath = window.location.pathname

  if (localData) {
    let d = JSON.parse(localData)

    if (d.user.userType === 'admin') {
      if (currentPath !== '/admin') {
        window.location.href = '/admin'
      }
    } else if (
      d.user.userRole === 'Agency' ||
      d.user.agencyTeamMember === true
    ) {
      if (currentPath !== '/agency/dashboard') {
        window.location.href = '/agency/dashboard'
      }
    } else if (d.user.userRole === 'AgencySubAccount') {
      if (currentPath !== '/dashboard') {
        window.location.href = '/dashboard'
      }
    } else {
      if (currentPath !== '/dashboard') {
        window.location.href = '/dashboard'
      }
    }
  }
}

export const copyAgencyOnboardingLink = async ({
  setLinkCopied,
  targetUser = null,
  selectedAgency = null,
}) => {

  let reduxUser = null;
  if(targetUser) {
    reduxUser = targetUser;
  } 
  try {
    // console.log('reduxUser in copyAgencyOnboardingLink', reduxUser)
    // console.log('selectedAgency in copyAgencyOnboardingLink', selectedAgency)
    const d = localStorage.getItem('User')
    if (!d) {
      console.error('User data not found in localStorage')
      return
    }

    const Data = JSON.parse(d)
    const authToken = Data.token

    // Use selectedAgency UUID if provided (admin view), otherwise use current user's UUID
    const agencyUuid = selectedAgency?.agencyUuid || Data.user?.agencyUuid

    if (!agencyUuid) {
      console.error('Agency UUID not found')
      return
    }

    // Default base path (assignx.ai)
    const defaultBasePath =
      process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === 'Production'
        ? 'https://app.assignx.ai/'
        : 'http://dev.assignx.ai/'

    // First, check if custom domain exists in reduxUser (synchronous check)
    let basePath = defaultBasePath
    let customDomain = null
    let hasCustomDomain = false

    if (reduxUser?.agencyBranding?.customDomain) {
      customDomain = reduxUser.agencyBranding.customDomain
      basePath = `https://${customDomain}/`
      hasCustomDomain = true
    } else {}

    // console.log('basePath in copyAgencyOnboardingLink', basePath)
    // console.log('customDomain in copyAgencyOnboardingLink', customDomain)
    // console.log('hasCustomDomain in copyAgencyOnboardingLink', hasCustomDomain)

    // Generate the onboarding link immediately (using domain from reduxUser or default)
    // If custom domain is connected, don't include UUID. If no custom domain, include UUID.
    const onboardingPath = hasCustomDomain
      ? 'onboarding'
      : `onboarding/${agencyUuid}`
    const UUIDLink = basePath + onboardingPath

    // Copy to clipboard IMMEDIATELY (synchronously) to preserve user gesture context
    const copySuccess = copyWithFallback(UUIDLink)

    if (copySuccess) {
      setLinkCopied(true)
    } else {
      // If fallback fails, try async clipboard API as last resort
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(UUIDLink)
          setLinkCopied(true)
        }
      } catch (clipboardError) {
        console.error('All clipboard methods failed:', clipboardError)
        // Still show success to user - they can manually copy if needed
        setLinkCopied(true)
      }
    }

    // Now do async operations in background (check for custom domain from API and update stored link)
    // This doesn't block the copy operation
    ;(async () => {
        try {
          let finalCustomDomain = customDomain
          let finalHasCustomDomain = hasCustomDomain

          // If we didn't have custom domain in reduxUser, try to get it from API
          if (!finalCustomDomain) {
            try {
              const axios = (await import('axios')).default
              const Apis = (await import('@/components/apis/Apis')).default
              
              // Add userId parameter if selectedAgency is provided (admin view)
              let apiUrl = Apis.getAgencyBranding
              if (selectedAgency?.id) {
                apiUrl += `?userId=${selectedAgency.id}`
              }
              
              const response = await axios.get(apiUrl, {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                  'Content-Type': 'application/json',
                },
              })

              if (
                response?.data?.status === true &&
                response?.data?.data?.domains
              ) {
                const verifiedDomain = response.data.data.domains.find(
                  (domain) =>
                    domain.type === 'web' &&
                    (domain.status === 'active' || domain.status === 'verified'),
                )
                if (verifiedDomain) {
                  finalCustomDomain = verifiedDomain.domain
                  finalHasCustomDomain = true
                }
              }
            } catch (apiError) {
              console.warn(
                'Could not fetch custom domain from branding API:',
                apiError,
              )
            }

            // If still not found, try the domain status API
            if (!finalCustomDomain) {
              try {
                const axios = (await import('axios')).default
                const Apis = (await import('@/components/apis/Apis')).default
                
                // Add userId parameter if selectedAgency is provided (admin view)
                let domainApiUrl = Apis.getDomainStatus
                if (selectedAgency?.id) {
                  domainApiUrl += `?userId=${selectedAgency.id}`
                }
                
                const domainResponse = await axios.get(domainApiUrl, {
                  headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                  },
                })

                if (
                  domainResponse?.data?.status === true &&
                  domainResponse?.data?.data?.domain &&
                  (domainResponse?.data?.data?.status === 'active' ||
                    domainResponse?.data?.data?.status === 'verified')
                ) {
                  finalCustomDomain = domainResponse.data.data.domain
                  finalHasCustomDomain = true
                }
              } catch (domainError) {
                console.warn(
                  'Could not fetch custom domain from domain status API:',
                  domainError,
                )
              }
            }
          }

          // Generate the final link based on whether custom domain is connected
          // If custom domain is connected, don't include UUID. If no custom domain, include UUID.
          let finalLink
          if (finalHasCustomDomain && finalCustomDomain) {
            finalLink = `https://${finalCustomDomain}/onboarding`
          } else {
            finalLink = defaultBasePath + `onboarding/${agencyUuid}`
          }

          // Store the link in the user table
          const { UpdateProfile } = await import(
            '@/components/apis/UpdateProfile'
          )
          await UpdateProfile({
            agencyOnboardingLink: finalLink,
          })
        } catch (updateError) {
          console.error('Failed to store onboarding link:', updateError)
        }
      })()

    // Reset the "Link Copied" state after 2 seconds
    setTimeout(() => {
      setLinkCopied(false)
    }, 2000)
  } catch (err) {
    console.error('Error in copyAgencyOnboardingLink:', err)
    setLinkCopied(false)
  }
}

// Helper function for fallback clipboard copy method (synchronous)
function copyWithFallback(text) {
  try {
    const textArea = document.createElement('textarea')
    textArea.value = text
    textArea.style.position = 'fixed'
    textArea.style.left = '-999999px'
    textArea.style.top = '-999999px'
    textArea.style.opacity = '0'
    document.body.appendChild(textArea)
    textArea.focus()
    textArea.select()

    const successful = document.execCommand('copy')
    document.body.removeChild(textArea)

    if (successful) {
      return true
    } else {
      console.error('execCommand copy failed')
      return false
    }
  } catch (fallbackError) {
    console.error('Fallback copy method failed:', fallbackError)
    return false
  }
}

export const getUserLocalData = () => {
  let data = localStorage.getItem('User')
  if (data) {
    let u = JSON.parse(data)

    return u
  }
}

export const UpgradeTag = ({
  onClick,
  className = '',
  reduxUser,
  setReduxUser,
  requestFeature = false,
}) => {
  // Get brand color for styling
  const getBrandColor = () => {
    if (typeof window === 'undefined') {
      return '#7902df' // Default purple
    }
    const root = document.documentElement
    const brandColor = getComputedStyle(root).getPropertyValue('--brand-primary')?.trim()
    if (!brandColor || brandColor === '' || brandColor.length < 3) {
      return '#7902df' // Default purple
    }
    return `hsl(${brandColor})`
  }

  const brandColor = getBrandColor()

  return (
    <div
      data-upgrade-clickable
      className={`flex flex-row items-center gap-1.5 p-2 rounded-lg text-[16px] cursor-pointer transition-colors ${className}`}
      style={{
        color: brandColor,
      }}
      onClick={(e) => {
        e.stopPropagation()
        if (onClick) {
          onClick(e)
        }
      }}
      onMouseDown={(e) => {
        // Prevent dropdown from closing before click handler fires
        e.stopPropagation()
      }}
    >
      <div
        style={{
          width: 14,
          height: 14,
          backgroundColor: brandColor,
          WebkitMaskImage: `url(/svgIcons/king.svg)`,
          maskImage: `url(/svgIcons/king.svg)`,
          WebkitMaskSize: 'contain',
          maskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          maskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskPosition: 'center',
        }}
        className="flex-shrink-0"
      />
      <span style={{ color: brandColor, fontSize: '12px', fontWeight: 400 }}>
        {requestFeature ? 'Request' : 'Upgrade'}
      </span>
    </div>
  )
}

// Wrapper component that handles upgrade modal functionality
export const UpgradeTagWithModal = ({
  className = '',
  reduxUser,
  setReduxUser,
  externalTrigger = false,
  onModalClose,
  requestFeature = false,
  selectedUser = null,
  hideTag = false, // New prop to hide the tag button
  featureTitle = 'Enable Live Transfer', // Title for the request feature modal
}) => {
  const [showUpgradeModal, setShowUpgradeModal] = React.useState(false)
  const [showUnlockPremiumFeaturesPopup, setShowUnlockPremiumFeaturesPopup] =
    React.useState(false)
  // Import necessary components dynamically to avoid circular dependencies
  const getProfileDetails = require('@/components/apis/GetProfile').default
  const UpgradePlan = require('@/components/userPlans/UpgradePlan').default

  // Determine 'from' prop: use selectedUser's role if provided (admin/agency viewing another user),
  // otherwise use logged-in user's role
  let from = ''
  if (selectedUser?.userRole === 'AgencySubAccount') {
    from = 'SubAccount'
  } else if (selectedUser?.userRole === 'Agency') {
    from = 'agency'
  } else if (reduxUser?.userRole === 'AgencySubAccount') {
    from = 'SubAccount'
  }

  // Function to refresh user data after plan upgrade
  const refreshUserData = async () => {
    try {
      const profileResponse = await getProfileDetails()

      if (profileResponse?.data?.status === true) {
        const freshUserData = profileResponse.data.data
        const localData = JSON.parse(localStorage.getItem('User') || '{}')

        // Update Redux with fresh data
        const updatedUserData = {
          token: localData.token,
          user: freshUserData,
        }

        setReduxUser(updatedUserData)
        localStorage.setItem('User', JSON.stringify(updatedUserData))

        return true
      }
      return false
    } catch (error) {
      console.error('🔴 [UPGRADE-TAG] Error refreshing user data:', error)
      return false
    }
  }

  // Handle external trigger to open modal
  const prevExternalTriggerRef = React.useRef(false)
  React.useEffect(() => {
    // Only trigger if externalTrigger changed from false to true
    if (externalTrigger && !prevExternalTriggerRef.current) {
      // Small delay to ensure dropdown has closed and UI is stable
      setTimeout(() => {
        if (requestFeature) {
          // If requestFeature is true, open the request feature modal
          setShowUnlockPremiumFeaturesPopup(true)
        } else {
          // Otherwise, open the upgrade modal
          setShowUpgradeModal(true)
        }
      }, 100)
    }
    prevExternalTriggerRef.current = externalTrigger
  }, [externalTrigger, requestFeature])

  const handleUpgradeClick = () => {
    if (requestFeature) {
      handleRequestFeature()
    } else {
      setShowUpgradeModal(true)
    }
  }

  const handleRequestFeature = () => {
    setShowUnlockPremiumFeaturesPopup(true)
  }

  const handleRequestFeatureModalClose = () => {
    setShowUnlockPremiumFeaturesPopup(false)
    // Call external callback if provided (this resets the external trigger)
    if (onModalClose) {
      onModalClose()
    }
  }

  const handleModalClose = async (upgradeResult) => {
    setShowUpgradeModal(false)

    // Call external callback if provided (this resets the external trigger)
    if (onModalClose) {
      onModalClose()
    }

    // If upgrade was successful, refresh user data
    if (upgradeResult) {
      await refreshUserData()
    }
  }

  return (
    <>
      {!hideTag && (
        <UpgradeTag
          onClick={handleUpgradeClick}
          className={className}
          requestFeature={requestFeature}
        />
      )}
      <UnlockPremiunFeatures
        title={featureTitle}
        open={showUnlockPremiumFeaturesPopup}
        handleClose={handleRequestFeatureModalClose}
      />
      <UpgradePlan
        open={showUpgradeModal}
        handleClose={handleModalClose}
        plan={null}
        currentFullPlan={reduxUser?.user?.plan}
        setSelectedPlan={() => {}}
        selectedUser={selectedUser}
        from={from}
      />
    </>
  );
}
