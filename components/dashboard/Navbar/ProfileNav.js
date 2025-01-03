"use client"
import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { Alert, Box, CircularProgress, Fade, Link, Modal, Snackbar } from '@mui/material';
import getProfileDetails from '@/components/apis/GetProfile';
import Apis from '@/components/apis/Apis';
import axios from 'axios';
import AgentSelectSnackMessage, { SnackbarTypes } from '../leads/AgentSelectSnackMessage';


const ProfileNav = () => {

  const router = useRouter();
  const pathname = usePathname();

  const [showPlansPopup, setShowPlansPopup] = useState(false);
  const [userDetails, setUserDetails] = useState(null);
  const [subscribePlanLoader, setSubscribePlanLoader] = useState(false);

  const [togglePlan, setTogglePlan] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  //snack messages variables
  const [successSnack, setSuccessSnack] = useState(null);
  const [showsuccessSnack, setShowSuccessSnack] = useState(null);
  const [errorSnack, setErrorSnack] = useState(null);
  const [showerrorSnack, setShowErrorSnack] = useState(null);

  const plans = [
    {
      id: 1,
      mints: 30,
      calls: 25,
      details: "Perfect for getting started! Free for the first 30 mins then $45 to continue.",
      originalPrice: "45",
      discountPrice: "0",
      planStatus: "Free"
    },
    {
      id: 2,
      mints: 120,
      calls: "1k",
      details: "Perfect for neighborhood updates and engagement.",
      originalPrice: "165",
      discountPrice: "99",
      planStatus: "40%"
    },
    {
      id: 3,
      mints: 360,
      calls: "3k",
      details: "Great for 2-3 listing appointments in your territory.",
      originalPrice: "540",
      discountPrice: "370",
      planStatus: "50%"
    },
    {
      id: 4,
      mints: 720,
      calls: "10k",
      details: "Great for teams and reaching new GCI goals. ",
      originalPrice: "1200",
      discountPrice: "480",
      planStatus: "60%"
    },
  ]

  useEffect(() => {
    getProfile();
    const data = localStorage.getItem("User");
    if (data) {
      const LocalData = JSON.parse(data);
      setUserDetails(LocalData);
    }
  }, [])

  const links = [
    {
      id: 1,
      name: 'Dashboard',
      href: '/dashboard',
      selected: '/svgIcons/selectdDashboardIcon.svg',
      uneselected: '/svgIcons/unSelectedDashboardIcon.svg'
    },
    {
      id: 2,
      name: 'My Agents',
      href: '/dashboard/myAgentX',
      selected: '/svgIcons/selectedAgentXIcon.svg',
      uneselected: '/svgIcons/agentXIcon.svg'
    }, {
      id: 3,
      name: 'Leads',
      href: '/dashboard/leads',
      selected: '/svgIcons/selectedLeadsIcon.svg',
      uneselected: '/svgIcons/unSelectedLeadsIcon.svg'
    }, {
      id: 4,
      name: 'Pipeline',
      href: '/dashboard/pipeline',
      selected: '/svgIcons/selectedPiplineIcon.svg',
      uneselected: '/svgIcons/unSelectedPipelineIcon.svg'
    }, {
      id: 5,
      name: 'Call Log',
      href: '/dashboard/callLog',
      selected: '/svgIcons/selectedCallIcon.svg',
      uneselected: '/svgIcons/unSelectedCallIcon.svg'
    }, {
      id: 6,
      name: 'Integration',
      href: '/dashboard/integration',
      selected: '/svgIcons/selectedIntegration.svg',
      uneselected: '/svgIcons/unSelectedIntegrationIcon.svg'
    }, {
      id: 7,
      name: 'Team',
      href: '/dashboard/team',
      selected: '/svgIcons/selectedTeam.svg',
      uneselected: '/svgIcons/unSelectedTeamIcon.svg'
    },
    // {
    //   id: 8,
    //   name: 'My Account',
    //   href: '/dashboard/myAccount',
    //   selected: '/assets/selectedTeamIcon.png',
    //   uneselected: '/assets/unSelectedTeamIcon.png'
    // },
  ]

  //function to getprofile
  const getProfile = async () => {
    try {

      let response = await getProfileDetails();

      console.log("Data recieved from get profile api", response);

      let Data = response?.data?.data

      if (response) {
        if (Data?.plan && Data?.plan?.status === "active") {
          setShowPlansPopup(false);
        }
        else {
          setShowPlansPopup(true);
        }
      }

    } catch (error) {
      console.error("Error occured in api is error", error);
    }
  }

  const handleOnClick = (e, href) => {

    if (!userDetails.user.plan) {
      getProfile();
    }

    e.preventDefault();
    router.push(href);
  }


  //function to subsscribe plan


  //function to select plan
  const handleTogglePlanClick = (item) => {
    setTogglePlan(item.id);
    setSelectedPlan(prevId => (prevId === item ? null : item));
  }

  const handleSubscribePlan = async () => {
    try {

      let planType = null;

      // console.log("Selected plan is:", togglePlan);

      if (togglePlan === 1) {
        planType = "Plan30"
      } else if (togglePlan === 2) {
        planType = "Plan120"
      } else if (togglePlan === 3) {
        planType = "Plan360"
      } else if (togglePlan === 4) {
        planType = "Plan720"
      }

      console.log("Current plan is", planType)

      setSubscribePlanLoader(true);
      let AuthToken = null;
      let localDetails = null
      const localData = localStorage.getItem("User");
      if (localData) {
        const LocalDetails = JSON.parse(localData);
        localDetails = LocalDetails
        AuthToken = LocalDetails.token;
      }

      console.log("Authtoken is", AuthToken);

      const ApiData = {
        plan: planType
      }

      console.log("Api data is", ApiData);

      const ApiPath = Apis.subscribePlan;
      console.log("Apipath is", ApiPath);

      // return

      const response = await axios.post(ApiPath, ApiData, {
        headers: {
          "Authorization": "Bearer " + AuthToken,
          "Content-Type": "application/json"
        }
      });

      if (response) {
        console.log("Response of subscribe plan api is", response);
        if (response.data.status === true) {
          localDetails.user.plan = response.data.data
          console.log("Data updated is", localDetails);
          await getProfileDetails();
          // localStorage.setItem("User", JSON.stringify(localDetails));
          setSuccessSnack(response.data.message);
          setShowSuccessSnack(true)
          setShowPlansPopup(false);
        } else if (response.data.status === false) {
          setErrorSnack(response.data.message);
          setShowErrorSnack(true)
        }
      }

    } catch (error) {
      console.error("Error occured in api is:", error);
    } finally {
      setSubscribePlanLoader(false);
    }
  }


  const styles = {
    paymentModal: {
      height: "auto",
      bgcolor: "transparent",
      // p: 2,
      mx: "auto",
      my: "50vh",
      transform: "translateY(-50%)",
      borderRadius: 2,
      border: "none",
      outline: "none",
    },
    cardStyles: {
      fontSize: "14", fontWeight: "500", border: "1px solid #00000020"
    },
    pricingBox: {
      position: 'relative',
      // padding: '10px',
      borderRadius: '10px',
      // backgroundColor: '#f9f9ff',
      display: 'inline-block',
      width: '100%',
    },
    triangleLabel: {
      position: 'absolute',
      top: '0',
      right: '0',
      width: '0',
      height: '0',
      borderTop: '50px solid #7902DF', // Increased height again for more padding
      borderLeft: '50px solid transparent',
    },
    labelText: {
      position: 'absolute',
      top: '10px', // Adjusted to keep the text centered within the larger triangle
      right: '5px',
      color: 'white',
      fontSize: '10px',
      fontWeight: 'bold',
      transform: 'rotate(45deg)',
    },
    content: {
      textAlign: 'left',
      paddingTop: '10px',
    },
    originalPrice: {
      textDecoration: 'line-through',
      color: '#7902DF65',
      fontSize: 18,
      fontWeight: "600"
    },
    discountedPrice: {
      color: '#000000',
      fontWeight: 'bold',
      fontSize: 18,
      marginLeft: '10px',
    },
  }


  return (
    <div>
      <AgentSelectSnackMessage isVisible={showsuccessSnack} hide={() => setShowSuccessSnack(false)} message={successSnack} type={SnackbarTypes.Success} />
      <AgentSelectSnackMessage isVisible={showerrorSnack} hide={() => setShowErrorSnack(false)} message={errorSnack} type={SnackbarTypes.Error} />
      <div className='w-full pt-10 flex flex-col items-center'
        style={{ height: '90vh', overflow: 'auto', scrollbarWidth: 'none', msOverflowStyle: 'none', }}
      >
        <div className='w-full flex flex-row gap-3 items-center justify-center'>
          <div className='w-9/12'>
            <Image src={"/assets/agentX.png"} alt='profile'
              height={23} width={98} objectFit='contain'
            />
          </div>
        </div>

        <div className='w-full mt-8 flex flex-col items-center gap-3'>
          {
            links.map((item) => (
              <div key={item.id} className='w-9/12 flex flex-col gap-3 '>
                <Link sx={{ cursor: 'pointer', textDecoration: 'none', }} onClick={(e) => handleOnClick(e, item.href)}
                >
                  <div className='w-full flex flex-row gap-2 items-center py-2 rounded-full'
                    style={{}}
                  >
                    <Image src={pathname === item.href ? item.selected : item.uneselected}
                      height={24} width={24} alt='icon'
                    />
                    <div className={pathname === item.href ? "text-purple" : "text-black"} style={{
                      fontSize: 15, fontWeight: 500, //color: pathname === item.href ? "#402FFF" : 'black'
                    }}>
                      {item.name}
                    </div>
                  </div>
                </Link>

              </div>
            ))
          }
        </div>
      </div>

      <div
        className='w-full flex flex-row items-start justify-center h-[10%]'
        style={{

        }}>
        <button
          onClick={() => { router.push("/dashboard/myAccount") }}
          className='w-9/12 border border-[#00000015] rounded-[10px] flex flex-row items-start gap-3 px-4 py-2 truncate outline-none text-start'
          style={{ textOverflow: "ellipsis" }}>
          <div className='h-[32px] flex-shrink-0 w-[32px] rounded-full bg-black text-white flex flex-row items-center justify-center'>
            {userDetails?.user?.name.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <div className='truncate' style={{ fontSize: 15, fontWeight: "500", color: "", width: "100px" }}>
              {userDetails?.user?.name}
            </div>
            <div className='truncate w-[100px]' style={{ fontSize: 15, fontWeight: "500", color: "#15151560", textOverflow: "ellipsis" }}>
              {userDetails?.user?.email}
            </div>
          </div>
        </button>
      </div>


      <div>
        <Modal
          open={showPlansPopup}
          // open={true}
          closeAfterTransition
          BackdropProps={{
            timeout: 100,
            sx: {
              backgroundColor: "#00000020",
              // //backdropFilter: "blur(20px)",
            },
          }}
        >
          <Box className="lg:w-8/12 sm:w-full w-full" sx={styles.paymentModal}>
            <div className="flex flex-row justify-center w-full">
              <div
                className="sm:w-7/12 w-full"
                style={{
                  backgroundColor: "#ffffff",
                  padding: 20,
                  borderRadius: "13px",
                }}
              >
                {/* <div className='flex flex-row justify-end'>
                  <button onClick={() => setShowPlansPopup(false)}>
                    <Image src={"/assets/crossIcon.png"} height={40} width={40} alt='*' />
                  </button>
                </div> */}


                {
                  plans.map((item, index) => (
                    <button key={item.id} className='w-full mt-4' onClick={(e) => handleTogglePlanClick(item)}>
                      <div className='px-4 py-1 pb-4'
                        style={{
                          ...styles.pricingBox,
                          border: item.id === togglePlan ? '2px solid #7902DF' : '1px solid #15151520',
                          backgroundColor: item.id === togglePlan ? "#402FFF05" : ""
                        }}>
                        <div style={{ ...styles.triangleLabel, borderTopRightRadius: "7px" }}></div>
                        <span style={styles.labelText}>
                          {item.planStatus}
                        </span>
                        <div className='flex flex-row items-start gap-3' style={styles.content}>
                          <div className='mt-1'>
                            <div>
                              {
                                item.id === togglePlan ?
                                  <Image src={"/assets/checkMark.png"} height={24} width={24} alt='*' /> :
                                  <Image src={"/assets/unCheck.png"} height={24} width={24} alt='*' />
                              }
                            </div>
                          </div>
                          <div className='w-full'>
                            <div style={{ color: "#151515", fontSize: 20, fontWeight: "600" }}>
                              {item.mints}mins | Approx {item.calls} Calls
                            </div>
                            <div className='flex flex-row items-center justify-between'>
                              <div className='mt-2' style={{ color: "#15151590", fontSize: 12, width: "80%", fontWeight: "600" }}>
                                {item.details}
                              </div>
                              <div className='flex flex-row items-center'>
                                <div style={styles.originalPrice}>${item.originalPrice}</div>
                                <div style={styles.discountedPrice}>${item.discountPrice}</div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))
                }

                <div>
                  {
                    subscribePlanLoader ? (
                      <div>
                        <CircularProgress size={30} />
                      </div>
                    ) : (
                      <div>
                        <button
                          disabled={!togglePlan}
                          className='w-full flex flex-row items-center justify-center h-[50px] bg-purple rounded-lg text-white mt-6'
                          style={{
                            fontSize: 16.8, fontWeight: '600',
                            backgroundColor: togglePlan ? "" : "#00000020",
                            color: togglePlan ? "" : "#000000",
                          }}
                          onClick={handleSubscribePlan}
                        >
                          Subscribe Plan
                        </button>
                      </div>
                    )
                  }

                </div>

                <div className='w-full mt-4 flex flex-row items-center justify-center'>
                  <button
                    onClick={() => {
                      localStorage.clear();
                      // localStorage.removeItem("User");
                      // localStorage.removeItem("localAgentDetails");
                      if (typeof document !== "undefined") {
                        document.cookie = "User=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                      }
                      router.push("/");
                    }}
                    className='text-red bg-[#FF4E4E40] font-[600] text-lg px-4 py-1 rounded-full'
                  >
                    Log out
                  </button>
                </div>

              </div>
            </div>
          </Box>
        </Modal>
      </div>
    </div >
  );
}

export default ProfileNav;