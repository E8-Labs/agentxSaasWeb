import Integrations from '@/components/agency/integrations/Integrations';
import ConnectStripe from '@/components/agency/stripe/ConnectStripe';
import { copyAgencyOnboardingLink } from '@/components/constants/constants';
import NotficationsDrawer from '@/components/notofications/NotficationsDrawer';
import React, { useState } from 'react';
import UPSell from '../integrations/UPSell';
import AgencySupportAndWidget from '../integrations/AgencySupportAndWidget';

function AgencyIntegrations({ selectedAgency }) {

    const [currentTab, setCurrentTab] = useState(1);
    const [linkCopied, setLinkCopied] = useState(false);

    const tabs = [
        {
            id: 1,
            tab: "Twilio"
        },
        {
            id: 2,
            tab: "Stripe"
        },
        {
            id: 3,
            tab: "UpSell"
        },
        {
            id: 4,
            tab: "Support Widget"
        },
    ]

    //handle switch tab
    const handleTabSelection = (tab) => {
        setCurrentTab(tab);
    }

    return (
        <div
            className='flex flex-col items-center w-full h-[100svh] overflow-hidden'
            // style={{
            //     backgroundImage: "url('/agencyIcons/DreamySilkWaves.png')",
            //     backgroundSize: "cover",
            //     backgroundPosition: "center",
            //     height: "100svh",
            //     width: "100%"
            // }}
        >
            <div className='flex w-full flex-row items-center justify-between px-5 py-5 border-b'>

                <div style={{
                    fontSize: 22, fontWeight: '700'
                }}>
                    Integrations
                </div>

                <div className="flex flex-row items-center gap-2">
                    <NotficationsDrawer />
                </div>
            </div>

            <div className='w-full flex flex-row justify-center items-center'>
                <div className="w-full flex flex-row items-center justify-between pt-6 px-4">
                    {/*
                        <div className="flex flex-row items-center gap-4">
                            <button
                                className={`${currentTab === 1 ? "border-purple" : "border-black"} border rounded-full px-4 py-1 outline-none`}
                                onClick={() => { handleTabSelection(1) }}
                            >
                                Twilio
                            </button>
                            <button
                                className={`${currentTab === 2 ? "border-purple" : "border-black"} border rounded-full px-4 py-1 outline-none`}
                                onClick={() => { handleTabSelection(2) }}
                            >
                                Stripe
                            </button>
                        </div>
                    */}
                    <div className='flex flex-row items-center gap-2'>
                        {
                            tabs.map((tab) => (
                                <button
                                    key={tab.id}
                                    className={`${currentTab === tab.id ? "text-purple border-b-2 border-purple" : "text-black"} outline-none px-4`}
                                    onClick={() => { handleTabSelection(tab.id) }}
                                >
                                    {tab.tab}
                                </button>
                            ))
                        }
                    </div>
                    <button
                        className="bg-[#845EEE45] border-none outline-none rounded-2xl px-2 py-1"
                        style={{ fontSize: 15, fontWeight: "500", whiteSpace: 'nowrap' }}
                        onClick={() => {
                            copyAgencyOnboardingLink({ setLinkCopied })
                        }}>
                        {linkCopied ? "Link Copied" : "Copy Link"}
                    </button>
                </div>
            </div>

            {
                currentTab === 1 ? (
                    <Integrations selectedAgency={selectedAgency} />
                ) : currentTab === 2 ? (
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
                ) : currentTab === 3 ? (
                    <div className='w-7/12'>
                        <UPSell />
                    </div>
                ) : currentTab === 4 ? (
                    <div className='w-full'>
                        <AgencySupportAndWidget />
                    </div>
                ) : "No Tab Selected"
            }

        </div>
    )
}

export default AgencyIntegrations