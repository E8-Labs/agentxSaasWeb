"use client";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import NotficationsDrawer from "@/components/notofications/NotficationsDrawer";
// import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import InputAdornment from "@mui/material/InputAdornment";
import {
  MenuItem,
  FormControl,
  Select,
  Snackbar,
  Alert,
  CircularProgress,
  TextField,
} from "@mui/material";
import axios from "axios";
import Apis from "@/components/apis/Apis";
import { CaretDown, CaretUp, Copy } from "@phosphor-icons/react";
import CallWorthyReviewsPopup from "@/components/dashboard/leads/CallWorthyReviewsPopup";
import AgentSelectSnackMessage, {
  SnackbarTypes,
} from "@/components/dashboard/leads/AgentSelectSnackMessage";
import { Searchbar } from "@/components/general/MuiSearchBar";
const allIntegrations = [
  {
    title: "Mailchimp",
    url: "https://zapier.com/apps/mailchimp/integrations/myagentx",
    description:
      "Automatically nurture AgentX leads with targeted email campaigns in Mailchimp to stay top-of-mind.",
    icon: "/svgIcons/MailchimpIcon.svg",
  },
  {
    title: "ActiveCampaign",
    url: "https://zapier.com/apps/activecampaign/integrations/myagentx",
    description:
      "Send AgentX leads to ActiveCampaign to trigger automated email sequences and track engagement.",
    icon: "/svgIcons/ActiveCampaignIcon.svg",
  },
  {
    title: "ClickUp",
    url: "https://zapier.com/apps/clickup/integrations/myagentx",
    description:
      "Create follow-up tasks in ClickUp for AgentX leads to ensure no opportunity is missed.",
    icon: "/svgIcons/ClickUpIcon.svg",
  },
  {
    title: "Trello",
    url: "https://zapier.com/apps/trello/integrations/myagentx",
    description:
      "Organize AgentX leads into Trello boards for tracking follow-up actions and collaboration with your team.",
    icon: "/svgIcons/TrelloIcon.svg",
  },
  {
    title: "Asana",
    url: "https://zapier.com/apps/asana/integrations/myagentx",
    description:
      "Add tasks for AgentX lead follow-ups in Asana to keep your pipeline moving forward.",
    icon: "/svgIcons/AsanaIcon.svg",
  },
  {
    title: "Slack",
    url: "https://zapier.com/apps/slack/integrations/myagentx",
    description:
      "Receive instant updates in Slack when AgentX nurtures a lead or books an appointment.",
    icon: "/svgIcons/SlackIcon.svg",
  },
  {
    title: "Shopify",
    url: "https://zapier.com/apps/shopify/integrations/myagentx",
    description:
      "Sync Shopify customers to AgentX for personalized follow-ups and repeat business outreach.",
    icon: "/svgIcons/ShopifyIcon.svg",
  },
  {
    title: "Stripe",
    url: "https://zapier.com/apps/stripe/integrations/myagentx",
    description:
      "Automatically update AgentX lead profiles when payments are received through Stripe for nurturing upsell opportunities.",
    icon: "/svgIcons/StripeIcon.svg",
  },
  {
    title: "PayPal",
    url: "https://zapier.com/apps/paypal/integrations/myagentx",
    description:
      "Track PayPal transactions in AgentX and follow up with leads to build long-term relationships",
    icon: "/svgIcons/PayPalIcon.svg",
  },
  {
    title: "Google Sheets",
    url: "https://zapier.com/apps/google-sheets/integrations/myagentx",
    description:
      "Add new leads from Google Sheets to AgentX for AI-driven follow-ups and nurturing.",
    icon: "/svgIcons/GoogleSheetsIcon.svg",
  },
  {
    title: "Zoho",
    url: "https://zapier.com/apps/zoho-forms/integrations/myagentx",
    description:
      "Sync Zoho CRM leads with AgentX for automated follow-ups and timely engagement.",
    icon: "/svgIcons/ZohoIcon.svg",
  },
  {
    title: "FUB",
    url: "https://zapier.com/apps/follow-up-boss/integrations/myagentx",
    description:
      "Send FUB leads to AgentX to ensure consistent nurturing through AI-powered communication.",
    icon: "/svgIcons/FUBIcon.svg",
  },
  {
    title: "HubSpot",
    url: "https://zapier.com/apps/hubspot/integrations/myagentx",
    description:
      "Integrate HubSpot contacts with AgentX to automate follow-ups and streamline your pipeline.",
    icon: "/svgIcons/HubSpotIcon.svg",
  },
  {
    title: "Clio Grow",
    url: "https://zapier.com/apps/clio/integrations/myagentx",
    description:
      "Capture Clio Grow client leads and let AgentX handle the nurturing and scheduling.",
    icon: "/svgIcons/ClioGrowIcon.svg",
  },
  {
    title: "Close",
    url: "https://zapier.com/apps/close/integrations/myagentx",
    description:
      "Update Close opportunities with AgentX follow-up progress to streamline sales efforts.",
    icon: "/svgIcons/closeIcon.svg",
  },
  {
    title: "KV Core",
    url: "https://zapier.com/apps/kvcore/integrations/myagentx",
    description:
      "Send KV Core leads to AgentX to automate follow-ups and improve conversion rates.",
    icon: "/svgIcons/KVCoreIcon.svg",
  },
  {
    title: "Typeform",
    url: "https://zapier.com/apps/typeform/integrations/myagentx",
    description:
      "Capture Typeform responses as leads in AgentX for instant follow-up and nurturing.",
    icon: "/svgIcons/Typeform.svg",
  },
  {
    title: "JotForm",
    url: "https://zapier.com/apps/jotform/integrations/myagentx",
    description:
      "Add Jotform submissions to AgentX to kickstart AI-driven lead engagement and follow-up.",
    icon: "/svgIcons/JotformIcon.svg",
  },
  {
    title: "Facebook Ads (Instant form)",
    url: "https://zapier.com/apps/facebook-lead-ads/integrations/myagentx",
    description:
      "Sync Facebook leads to AgentX for immediate qualifying, follow-ups and lead nurturing. Speed to lead! ",
    icon: "/svgIcons/FacebookIcon.svg",
  },
  {
    title: "Wix forms",
    url: "https://zapier.com/apps/wix/integrations/myagentx",
    description:
      "Turn Wix form submissions into AgentX leads for automated nurturing and engagement.",
    icon: "/svgIcons/WixformsIcon.svg",
  },
  {
    title: "Calendly",
    url: "https://zapier.com/apps/calendly/integrations/myagentx",
    description:
      "Automatically update AgentX when appointments are scheduled in Calendly to ensure timely follow-ups.",
    icon: "/svgIcons/CalendlyIcon.svg",
  },
  {
    title: "Cal.com",
    url: "https://zapier.com/apps/calcom/integrations/myagentx",
    description:
      "Sync Cal.com bookings with AgentX for seamless scheduling and lead engagement.",
    icon: "/svgIcons/Cal.comIcon.svg",
  },
  {
    title: "GHL",
    url: "https://zapier.com/apps/leadconnector/integrations/myagentx",
    description:
      "Integrate with AgentX to streamline lead management, automate follow-ups, and boost conversions effortlessly.",
    icon: "/svgIcons/GHLIcon.svg",
  },
  {
    title: "Pipedrive",
    url: "https://zapier.com/apps/pipedrive/integrations/myagentx",
    description:
      "Connect Pipedrive with AgentX for seamless deal tracking and smart sales automation.",
    icon: "/svgIcons/PipedriveIcon.svg",
  },
  {
    title: "Salesforce",
    url: "https://zapier.com/apps/salesforce/integrations/myagentx",
    description:
      "Streamline Salesforce CRM with AgentX for effortless lead tracking and workflow automation.",
    icon: "/svgIcons/SalesforceIcon.svg",
  },
];
function Page() {
  const [showKeysBox, setshowKeysBox] = useState(false);
  const [myKeys, setMyKeys] = useState([]);
  const [keyLoader, setKeyLoader] = useState(false);
  const [genratekeyLoader, setGenrateeyLoader] = useState(false);
  const [genratekeyLoader2, setGenrateeyLoader2] = useState(false);
  const [showCopySnak, setShowCopySnak] = useState(null);

  //test

  const [showCallReviewPopup, setShowCallReviewPopup] = useState(false);

  const [isExpanded, setIsExpanded] = useState(false);

  const [search, setSearch] = useState("");
  const [integrations, setIntegrations] = useState(allIntegrations);

  useEffect(() => {
    getMyApiKeys();
  }, []);

  useEffect(() => {
    if (search) {
      let searched = allIntegrations.filter((item) =>
        item.title.toLowerCase().includes(search.toLowerCase())
      );
      setIntegrations(searched);
    } else {
      setIntegrations(allIntegrations);
    }
  }, [search]);

  const getMyApiKeys = async () => {
    // console.log("trying to get my api keys");
    try {
      const data = localStorage.getItem("User");
      setKeyLoader(true);
      let u = JSON.parse(data);
      // console.log("user data from local is", u.user);

      let path = Apis.myApiKeys;
      // console.log("path", path);

      const response = await axios.get(path, {
        headers: {
          Authorization: "Bearer " + u.token,
        },
      });

      if (response) {
        setKeyLoader(false);

        if (response.data.status) {
          // console.log("response of get my api keys is", response.data.data);
          setMyKeys(response.data.data);
        } else {
          // console.log("get my api keys api message is", response.data.message);
        }
      }
    } catch (e) {
      setKeyLoader(false);
      // console.log("error in get my api keys is", e);
    }
  };

  const genrateApiKey = async () => {
    try {
      const data = localStorage.getItem("User");

      let u = JSON.parse(data);
      // console.log("user data from local is", u.user);

      let apidata = {
        email: u.email,
        name: u.name,
        phone: u.phone,
        farm: u.farm,
        brokerage: u.brokerage,
        averageTransactionPerYear: u.averageTransactionPerYear,
        agentService: u.agentService,
        areaOfFocus: u.areaOfFocus,
        userType: u.userType,
      };

      // return

      const response = await axios.post(Apis.genrateApiKey, apidata, {
        headers: {
          Authorization: "Bearer " + u.token,
          "Content-Type": "application/json",
        },
      });

      if (response) {
        setGenrateeyLoader(false);
        setGenrateeyLoader2(false);

        if (response.data.status) {
          // console.log("response of genrate api keys is", response.data.data);
          setShowCopySnak("Api key generated successfully");
          setMyKeys((prevKeys) => [...prevKeys, response.data.data]);
        } else {
          // console.log(
          //   "get genrate api keys api message is",
          //   response.data.message
          // );
        }
      }
    } catch (e) {
      setGenrateeyLoader2(false);
      setGenrateeyLoader(false);

      // console.log("error in genrate api keys is", e);
    }
  };

  // const myKeys = [
  //   {
  //     "id": 2,
  //     "title": "",
  //     "key": "fdb24df38ca147894653815fba7a0170dbbb7a45262feef8083e7198b28170ac",
  //     "status": "active",
  //     "userId": 10,
  //     "createdAt": "2024-12-27T17:41:54.000Z",
  //     "updatedAt": "2024-12-27T17:41:54.000Z"
  //   }, {
  //     "id": 2,
  //     "title": "",
  //     "key": "fdb24df38ca147894653815fba7a0170dbbb7a45262feef8083e7198b28170ac",
  //     "status": "active",
  //     "userId": 10,
  //     "createdAt": "2024-12-27T17:41:54.000Z",
  //     "updatedAt": "2024-12-27T17:41:54.000Z"
  //   }, {
  //     "id": 2,
  //     "title": "",
  //     "key": "fdb24df38ca147894653815fba7a0170dbbb7a45262feef8083e7198b28170ac",
  //     "status": "active",
  //     "userId": 10,
  //     "createdAt": "2024-12-27T17:41:54.000Z",
  //     "updatedAt": "2024-12-27T17:41:54.000Z"
  //   }
  // ]

  // funtion for mask keys

  const maskId = (id) => {
    const maskedId = id.slice(0, -4).replace(/./g, "*") + id.slice(-4);
    // console.log("length of mask id is", maskedId.length);
    // console.log("length of id is", id);
    return maskedId;
  };

  return (
    <div className="w-full flex flex-col items-center">
      <AgentSelectSnackMessage
        isVisible={showCopySnak}
        hide={() => setShowCopySnak(null)}
        message={showCopySnak}
        type={SnackbarTypes.Success}
      />
      <div
        className=" w-full flex flex-row justify-between items-center py-4 mt-2 px-10"
        style={{ borderBottomWidth: 2, borderBottomColor: "#00000010" }}
      >
        <div style={{ fontSize: 24, fontWeight: "600" }}>Integration</div>
        <div className="flex flex-col">
          <NotficationsDrawer />
        </div>
      </div>
      {/* <div className='w-full flex flex-row items-center justify-end p-6'>
        {
          genratekeyLoader ? (
            <CircularProgress size={30} />
          ) : (
            <button
              onClick={() => {
                setGenrateeyLoader(true)
                genrateApiKey()
              }}
            >
              <div style={{ fontSize: 16, fontWeight: '500', color: '#7902df', textDecorationLine: 'underline' }}>
                Create New Api Key
              </div>
            </button>
          )
        }

      </div> */}
      <div
        className="w-full flex flex-col h-[80vh] mt-8"
        style={{ overflow: "auto", scrollbarWidth: "none" }}
      >
        <div className="w-full pl-5 pr-8">
          <div className="flex flex-row justify-between items-start">
            <Searchbar
              placeholder={"Search your favorite integrations"}
              value={search}
              setValue={(search) => {
                setSearch(search);
              }}
            />
            <div className="border w-4/12 p-3 ">
              <button
                className="w-full"
                onClick={() => {
                  setshowKeysBox(!showKeysBox);
                }}
              >
                <div className="flex flex-row items-center justify-between ">
                  <div>My Api Key</div>
                  {showKeysBox ? (
                    <CaretUp size={20} />
                  ) : (
                    <CaretDown size={20} />
                  )}
                </div>
              </button>

              {showKeysBox && (
                <>
                  {/* {
                    myKeys.map((item, index) => {

                      const maskId = (id) => {
                        const maskedId = id.slice(0, -4).replace(/./g, '*') + id.slice(-4);
                        console.log("length of mask id is", maskedId.length);
                        console.log("length of id is", id);
                        return maskedId;
                      }

                      return (
                        <button className='flex text-start flex-row items-center justify-between w-full mt-5' key={index}
                          onClick={() => {
                            navigator.clipboard
                              .writeText(item.key)
                              .then(() => setShowCopySnak(true))
                              .catch((err) =>
                                console.error("Failed to copy API key:", err)
                              );
                          }}
                        >
                          <div
                            className='w-[90%] truncate '
                            style={{
                              fontFamily: "'Courier New', monospace", // Monospace font
                              lineHeight: '1.5', // Line height for proper spacing
                              verticalAlign: 'middle', // Align text vertically
                              whiteSpace: 'nowrap', // Prevent wrapping of the text
                            }}
                          >
                            {maskId(item.key)}
                          </div>
                          <Copy size={20} color='#7920fd' />
                        </button>
                      )
                    })
                  } */}

                  {myKeys.length > 0 && (
                    <button
                      className="flex text-start flex-row items-center justify-between w-full mt-5"
                      onClick={() => {
                        navigator.clipboard
                          .writeText(myKeys[myKeys.length - 1].key)
                          .then(() =>
                            setShowCopySnak("Api key copied successfully")
                          )
                          .catch((err) =>
                            console.error("Failed to copy API key:", err)
                          );
                      }}
                    >
                      <div
                        className="w-[90%] truncate "
                        style={{
                          fontFamily: "'Courier New', monospace", // Monospace font
                          lineHeight: "1.5", // Line height for proper spacing
                          verticalAlign: "middle", // Align text vertically
                          whiteSpace: "nowrap", // Prevent wrapping of the text
                        }}
                      >
                        {/* {item.key} */}
                        {maskId(myKeys[myKeys.length - 1].key)}
                      </div>
                      <Copy size={20} color="#7920fd" />
                    </button>
                  )}

                  {genratekeyLoader2 ? (
                    <CircularProgress style={{ margin: 10 }} size={20} />
                  ) : (
                    <button
                      className="mt-5"
                      onClick={() => {
                        setGenrateeyLoader2(true);
                        genrateApiKey();
                      }}
                    >
                      <div
                        style={{
                          fontSize: 16,
                          fontWeight: "500",
                          color: "#7902df",
                          textDecorationLine: "underline",
                        }}
                      >
                        {myKeys.length > 0 ? "Refresh" : "Genrate New Api Key"}
                      </div>
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        </div>

        {/* <div className='pl-10 flex flex-col items-center w-7/12' style={{ alignSelf: 'flex-start' }}>
          <div className='w-full border p-3 flex flex-row items-center justify-between mt-5'>
            <div className='flex flex-row items-center gap-5'>
              <Image src={'/otherAssets/twiloImage.png'}
                height={47}
                width={47}
                alt='twilo'
              />
              <div className='flex flex-col gap-2'>
                <div style={{ fontSize: 15, fontWeight: '500', color: '#050A08' }}>
                  Twilio
                </div>

                <div style={{ fontSize: 11, fontWeight: '400', color: '#050A0860' }}>
                  Get a phone num from Twilio
                </div>
              </div>
            </div>

            <button className='px-4 py-2 bg-purple border rounded-lg'
              onClick={() => { setShowCallReviewPopup(true) }}
            >
              <div style={{ fontSize: 15, fontWeight: '500', color: '#fff' }}>
                Add
              </div>
            </button>

          </div>

          <div className='w-full border p-3 flex flex-row items-center justify-between mt-5'>
            <div className='flex flex-row items-center gap-5'>
              <Image src={'/otherAssets/calenderImage.png'}
                height={47}
                width={47}
                alt='calender'
              />
              <div className='flex flex-col gap-2'>
                <div style={{ fontSize: 15, fontWeight: '500', color: '#050A08' }}>
                  Calender
                </div>

                <div style={{ fontSize: 11, fontWeight: '400', color: '#050A0860' }}>
                  Connect to Cal.me, Calendly, smtp to google or apple calendar
                </div>
              </div>
            </div>

            <button className='px-4 py-2 bg-purple border rounded-lg'>
              <div style={{ fontSize: 15, fontWeight: '500', color: '#fff' }}>
                Add
              </div>
            </button>
          </div>

          <div className='w-full border p-3 flex flex-row items-center justify-between mt-5'>

            <div className='flex flex-row items-center gap-5'>
              <Image src={'/otherAssets/fubImage.png'}
                height={47}
                width={47}
                alt='fub'
              />
              <div className='flex flex-col gap-2'>
                <div style={{ fontSize: 15, fontWeight: '500', color: '#050A08' }}>
                  FUB
                </div>

                <div style={{ fontSize: 11, fontWeight: '400', color: '#050A0860' }}>
                  API Keys to send hot leads and booked meetings
                </div>
              </div>
            </div>

            <button className='px-4 py-2 bg-purple border rounded-lg'>
              <div style={{ fontSize: 15, fontWeight: '500', color: '#fff' }}>
                Add
              </div>
            </button>
          </div>
        </div> */}

        <div className="flex flex-row w-full flex-wrap gap-3 p-5">
          {integrations.map((integration, index) => (
            <div
              key={index}
              className="bg-white rounded-lg p-3 flex flex-row gap-3 items-start border"
            >
              <img
                src={integration.icon}
                alt={integration.title}
                className="w-12 h-12 object-contain"
              />
              <div className="flex flex-col gap-2">
                <div style={{ fontSize: "1vw", fontWeight: "500" }}>
                  {integration.title}
                </div>
                <div
                  style={{ fontSize: "1vw", fontWeight: "500" }}
                  className="flex-wrap text-gray-600 w-[20vw]"
                >
                  {integration.description}
                </div>
                <button
                  onClick={() => {
                    // if (integration.title === "GHL") {
                    //   setShowCopySnak("Comming soon");
                    //   return;
                    // }
                    if (typeof window !== "undefined") {
                      window.open(integration.url, "_blank");
                    }
                  }}
                  className="w-full bg-purple text-white px-4 py-2 rounded-md text-sm font-medium"
                >
                  Add
                </button>
              </div>
            </div>
          ))}
        </div>

        <div></div>
      </div>
    </div>
  );
}

export default Page;
