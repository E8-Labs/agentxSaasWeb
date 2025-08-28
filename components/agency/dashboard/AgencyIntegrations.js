import Integrations from '@/components/agency/integrations/Integrations';
import ConnectStripe from '@/components/agency/stripe/ConnectStripe';
import NotficationsDrawer from '@/components/notofications/NotficationsDrawer';
import React, { useState } from 'react';

function AgencyIntegrations({ selectedAgency }) {

    const [currentTab, setCurrentTab] = useState(1);
    const [linkCopied, setLinkCopied] = useState(false);

    //handle switch tab
    const handleTabSelection = (tab) => {
        setCurrentTab(tab);
    }

    return (
        <div className='flex flex-col items-center w-full h-[100svh] overflow-hidden'>
            <div className='flex w-full flex-row items-center justify-between px-5 py-5 border-b'>

                <div style={{
                    fontSize: 22, fontWeight: '700'
                }}>
                    Integrations
                </div>

                <div className="flex flex-row items-center gap-2">
                    <button
                        className="bg-[#845EEE45] border-none outline-none rounded-2xl px-2 py-1"
                        style={{ fontSize: 15, fontWeight: "500" }}
                        onClick={() => {
                            // console.log("Agency uuid link copied trigering")
                            const d = localStorage.getItem("User");
                            const BasePath =
                                process.env.NEXT_PUBLIC_REACT_APP_ENVIRONMENT === "Production"
                                    ? "https://apimyagentx.com/agentx/" //"https://www.blindcircle.com/agentx/"
                                    : "https://apimyagentx.com/agentxtest/";
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
                        }}>
                        {linkCopied ? "Link Copied" : "Copy Link"}
                    </button>
                    <NotficationsDrawer />
                </div>
            </div>

            <div className='w-full flex flex-row justify-center items-start'>
                <div className="flex flex-row items-center gap-4 w-11/12 pt-6">
                    <button
                        className={`${currentTab === 1 ? "border-purple" : "border-black"} border rounded-full px-4 py-1 outline-none`}
                        onClick={() => { handleTabSelection(1) }}
                    >
                        Twillio
                    </button>
                    <button
                        className={`${currentTab === 2 ? "border-purple" : "border-black"} border rounded-full px-4 py-1 outline-none`}
                        onClick={() => { handleTabSelection(2) }}
                    >
                        Stripe
                    </button>
                </div>
            </div>

            {
                currentTab === 1 ? (
                    <Integrations selectedAgency={selectedAgency} />
                ) : (
                    <div className='pt-6 w-full overflow-auto'
                        style={{
                            msOverflowStyle: "none",   // IE and Edge
                            scrollbarWidth: "none"     // Firefox
                        }}>
                        <style jsx>{`
                            div::-webkit-scrollbar {
                              display: none; /* Chrome, Safari, Opera */
                            }
                          `}</style>
                        <ConnectStripe selectedAgency={selectedAgency} />
                    </div>
                )
            }

        </div>
    )
}

export default AgencyIntegrations