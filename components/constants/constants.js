import React from 'react';
import UnlockPremiunFeatures from '../globalExtras/UnlockPremiunFeatures';

export const KycCategory = {
  CategoryNeeds: "need",
  CategoryMotivation: "motivation",
  CategoryUrgency: "urgency",
};

export const SnackMessageTitles = {
  ErrorTitlePhoneRequiredLeadImport: "Phone number required",
  ErrorMessagePhoneRequiredLeadImport: "Can't upload leads without a phone",
  ErrorTitleFirstNameRequiredLeadImport: "First Name required",
  ErrorMessageFirstNameRequiredLeadImport:
    "Can't upload leads without a First Name",
};

export const BatchStatus = {
  // Pending: "Pending",
  Scheduled: "Scheduled",
  Active: "Active",
  Paused: "Paused",
  PausedForNonPayment: "PausedForNonPayment",
  PausedForUpdateCadence: "PausedForUpdateCadence",
  PausedForNoPhoneNumber: "PausedForNoPhoneNumber",
  Completed: "Completed", // the rest of the cadence for that
};


export const stagesDropdown = [
  {
    id: 1,
    title: "Rename",
    img: "/assets/editPen.png",
  },
  {
    id: 2,
    title: "Color",
    img: "",
  },
  {
    id: 1,
    title: "Configure",
    img: "",
  },
  {
    id: 3,
    title: "Delete",
    img: ""
  }
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

  if (typeof window === "undefined") {
    console.log("Running on server, window is not available");
    return; // stop here during SSR
  }

  const localData = localStorage.getItem("User");
  console.log("Current path is:", window.location.pathname);
  let currentPath = window.location.pathname;

  if (localData) {
    let d = JSON.parse(localData);
    console.log("Test log triggered");

    if (d.user.userType === "admin") {
      if (currentPath !== "/admin") {
        window.location.href = "/admin";
      }
    } else if (d.user.userRole === "Agency" || d.user.agencyTeamMember === true) {
      if (currentPath !== "/agency/dashboard") {
        window.location.href = "/agency/dashboard";
      }
    } else if (d.user.userRole === "AgencySubAccount") {
      if (currentPath !== "/dashboard") {
        window.location.href = "/dashboard";
      }
    } else {
      if (currentPath !== "/dashboard") {
        window.location.href = "/dashboard";
      }
    }
  }
};


export const copyAgencyOnboardingLink = async ({
  setLinkCopied,
  reduxUser = null,
}) => {
  try {
    const d = localStorage.getItem("User");
    if (!d) {
      console.error("User data not found in localStorage");
      return;
    }

    const Data = JSON.parse(d);
    const authToken = Data.token;
    const agencyUuid = Data.user?.agencyUuid;

    if (!agencyUuid) {
      console.error("Agency UUID not found");
      return;
    }

    // Default base path (assignx.ai)
    const defaultBasePath =
      process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === "Production"
        ? "https://app.assignx.ai/"
        : "http://dev.assignx.ai/";

    // First, check if custom domain exists in reduxUser (synchronous check)
    let basePath = defaultBasePath;
    let customDomain = null;

    if (reduxUser?.agencyBranding?.customDomain) {
      customDomain = reduxUser.agencyBranding.customDomain;
      basePath = `https://${customDomain}/`;
      console.log("✅ Found custom domain in user profile:", customDomain);
    } else {
      console.log("ℹ️ No custom domain in profile, using default base path:", basePath);
    }

    // Generate the onboarding link immediately (using domain from reduxUser or default)
    const UUIDLink = basePath + `onboarding/${agencyUuid}`;
    console.log("🔗 Generated onboarding link:", UUIDLink);

    // Copy to clipboard IMMEDIATELY (synchronously) to preserve user gesture context
    const copySuccess = copyWithFallback(UUIDLink);
    
    if (copySuccess) {
      setLinkCopied(true);
    } else {
      // If fallback fails, try async clipboard API as last resort
      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(UUIDLink);
          console.log("✅ Copied to clipboard using Clipboard API");
          setLinkCopied(true);
        }
      } catch (clipboardError) {
        console.error("All clipboard methods failed:", clipboardError);
        // Still show success to user - they can manually copy if needed
        setLinkCopied(true);
      }
    }

    // Now do async operations in background (check for custom domain from API and update stored link)
    // This doesn't block the copy operation
    (async () => {
      try {
        // If we didn't have custom domain in reduxUser, try to get it from API
        if (!customDomain) {
          try {
            const axios = (await import("axios")).default;
            const Apis = (await import("@/components/apis/Apis")).default;
            const response = await axios.get(Apis.getAgencyBranding, {
              headers: {
                Authorization: `Bearer ${authToken}`,
                "Content-Type": "application/json",
              },
            });

            if (response?.data?.status === true && response?.data?.data?.domains) {
              const verifiedDomain = response.data.data.domains.find(
                (domain) =>
                  domain.type === "web" &&
                  (domain.status === "active" || domain.status === "verified")
              );
              if (verifiedDomain) {
                customDomain = verifiedDomain.domain;
                console.log("✅ Found custom domain from branding API (for future use):", customDomain);
              }
            }
          } catch (apiError) {
            console.warn("Could not fetch custom domain from branding API:", apiError);
          }

          // If still not found, try the domain status API
          if (!customDomain) {
            try {
              const axios = (await import("axios")).default;
              const Apis = (await import("@/components/apis/Apis")).default;
              const domainResponse = await axios.get(Apis.getDomainStatus, {
                headers: {
                  Authorization: `Bearer ${authToken}`,
                  "Content-Type": "application/json",
                },
              });

              if (
                domainResponse?.data?.status === true &&
                domainResponse?.data?.data?.domain &&
                (domainResponse?.data?.data?.status === "active" ||
                  domainResponse?.data?.data?.status === "verified")
              ) {
                customDomain = domainResponse.data.data.domain;
                console.log("✅ Found custom domain from domain status API (for future use):", customDomain);
              }
            } catch (domainError) {
              console.warn("Could not fetch custom domain from domain status API:", domainError);
            }
          }

          // If we found a custom domain from API, regenerate the link with it
          if (customDomain) {
            const updatedLink = `https://${customDomain}/onboarding/${agencyUuid}`;
            console.log("🔄 Updating stored link with custom domain:", updatedLink);
            // Store the updated link
            const { UpdateProfile } = await import("@/components/apis/UpdateProfile");
            await UpdateProfile({
              agencyOnboardingLink: updatedLink,
            });
            console.log("✅ Stored updated onboarding link in user profile");
            return;
          }
        }

        // Store the link in the user table
        const { UpdateProfile } = await import("@/components/apis/UpdateProfile");
        await UpdateProfile({
          agencyOnboardingLink: UUIDLink,
        });
        console.log("✅ Stored onboarding link in user profile");
      } catch (updateError) {
        console.error("Failed to store onboarding link:", updateError);
      }
    })();

    // Reset the "Link Copied" state after 2 seconds
    setTimeout(() => {
      setLinkCopied(false);
    }, 2000);
  } catch (err) {
    console.error("Error in copyAgencyOnboardingLink:", err);
    setLinkCopied(false);
  }
}

// Helper function for fallback clipboard copy method (synchronous)
function copyWithFallback(text) {
  try {
    const textArea = document.createElement("textarea");
    textArea.value = text;
    textArea.style.position = "fixed";
    textArea.style.left = "-999999px";
    textArea.style.top = "-999999px";
    textArea.style.opacity = "0";
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    if (successful) {
      console.log("✅ Copied to clipboard using execCommand");
      return true;
    } else {
      console.error("execCommand copy failed");
      return false;
    }
  } catch (fallbackError) {
    console.error("Fallback copy method failed:", fallbackError);
    return false;
  }
}


export const getUserLocalData = () => {
  let data = localStorage.getItem("User")
  if (data) {
    let u = JSON.parse(data)

    return u
  }
}


export const UpgradeTag = ({ onClick, className = "", reduxUser, setReduxUser, requestFeature = false }) => {
  console.log("request feature in upgrade tag is", requestFeature)
  return (
    <div
      className={`bg-[#7902df10] items-center gap-2 p-2 rounded-lg text-purple text-[12px] cursor-pointer hover:bg-[#7902df20] transition-colors ${className}`}
      onClick={onClick}
    >
      {requestFeature ? "Request Feature" : "Upgrade"}
    </div >
  )
}

// Wrapper component that handles upgrade modal functionality
export const UpgradeTagWithModal = ({ className = "", reduxUser, setReduxUser, externalTrigger = false, onModalClose, requestFeature = false,}) => {
  const [showUpgradeModal, setShowUpgradeModal] = React.useState(false);
  const [showUnlockPremiumFeaturesPopup, setShowUnlockPremiumFeaturesPopup] = React.useState(false);
    // Import necessary components dynamically to avoid circular dependencies
  const getProfileDetails = require("@/components/apis/GetProfile").default;
  const UpgradePlan = require("@/components/userPlans/UpgradePlan").default;


  // Function to refresh user data after plan upgrade
  const refreshUserData = async () => {
    try {
      console.log('🔄 [UPGRADE-TAG] Refreshing user data after plan upgrade...');
      const profileResponse = await getProfileDetails();

      if (profileResponse?.data?.status === true) {
        const freshUserData = profileResponse.data.data;
        const localData = JSON.parse(localStorage.getItem("User") || '{}');

        console.log('🔄 [UPGRADE-TAG] Fresh user data received after upgrade');

        // Update Redux with fresh data
        const updatedUserData = {
          token: localData.token,
          user: freshUserData
        };

        setReduxUser(updatedUserData);
        localStorage.setItem("User", JSON.stringify(updatedUserData));

        return true;
      }
      return false;
    } catch (error) {
      console.error('🔴 [UPGRADE-TAG] Error refreshing user data:', error);
      return false;
    }
  };

  // Handle external trigger to open modal
  React.useEffect(() => {
    if (externalTrigger) {
      setShowUpgradeModal(true);
    }
  }, [externalTrigger]);

  const handleUpgradeClick = () => {
    if (requestFeature) {
      handleRequestFeature();
    } else {
      setShowUpgradeModal(true);
    }
  };

  const handleRequestFeature = () => {

    console.log("requestFeature is true")
    setShowUnlockPremiumFeaturesPopup(true);
  };

  const handleModalClose = async (upgradeResult) => {
    setShowUpgradeModal(false);

    // Call external callback if provided
    if (onModalClose) {
      onModalClose();
    }

    // If upgrade was successful, refresh user data
    if (upgradeResult) {
      console.log('🎉 [UPGRADE-TAG] Upgrade successful, refreshing user data...');
      await refreshUserData();
    }
  };

  return (
    <>
      <UpgradeTag
        onClick={handleUpgradeClick}
        className={className}
        requestFeature={requestFeature}
      />
      <UnlockPremiunFeatures
        title={"Enable Live Transfer"}
        open={showUnlockPremiumFeaturesPopup}
        handleClose={() => {
          setShowUnlockPremiumFeaturesPopup(false)
        }}
      />

      <UpgradePlan
        open={showUpgradeModal}
        handleClose={handleModalClose}
        plan={null}
        currentFullPlan={reduxUser?.user?.plan}
        setSelectedPlan={() => {
          console.log("setSelectedPlan is called")
        }}
      />
    </>
  );
};
