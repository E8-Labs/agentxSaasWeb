import React from 'react';

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


export const copyAgencyOnboardingLink = ({
  setLinkCopied,

}) => {
  // console.log("Agency uuid link copied trigering")
  const d = localStorage.getItem("User");
  const BasePath =
    process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === "Production"
      ? "https://app.assignx.ai/" //"https://www.blindcircle.com/agentx/"
      : "http://dev.assignx.ai/";
      // ? "https://app.assignx.ai/" //"https://www.blindcircle.com/agentx/"
      // : "https://agentx-git-test-salman-majid-alis-projects.vercel.app/";
  // console.log("Agency uuid link copied check 2", d)
  if (d) {
    console.log("Agency uuid link copied check 3")
    const Data = JSON.parse(d);
    // console.log("Agency uuid link copied check 4")
    const UUIDLink = BasePath + `onboarding/${Data.user.agencyUuid}`
    // console.log("Agency uuid link copied check 5")
    console.log("Agency uuid link copied is", UUIDLink);
    navigator.clipboard.writeText(UUIDLink)
      .then(() => {
        setLinkCopied(true);
      })
      .catch(err => {
        console.error("Failed to copy: ", err);
      });
    const timer = setTimeout(() => {
      setLinkCopied(false)
    }, 500);
    return () => clearTimeout(timer);
  }
}


export const getUserLocalData = () =>{
  let data = localStorage.getItem("User")
  if(data){
    let u = JSON.parse(data)

    return  u
  }
}


export const UpgradeTag = ({ onClick, className = "",reduxUser,setReduxUser }) => {
  return (
    <div 
      className={`bg-[#7902df10] items-center gap-2 p-2 rounded-lg text-purple text-[12px] cursor-pointer hover:bg-[#7902df20] transition-colors ${className}`}
      onClick={onClick}
    >
      Upgrade
    </div >
  )
}

// Wrapper component that handles upgrade modal functionality
export const UpgradeTagWithModal = ({ className = "",reduxUser,setReduxUser, externalTrigger = false, onModalClose }) => {
  const [showUpgradeModal, setShowUpgradeModal] = React.useState(false);
  
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
    setShowUpgradeModal(true);
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
      />
      
      <UpgradePlan
        open={showUpgradeModal}
        handleClose={handleModalClose}
        plan={null}
        currentFullPlan={reduxUser?.user?.plan}
        setSelectedPlan={()=>{
          console.log("setSelectedPlan is called")
         }}
      />
    </>
  );
};
