import Integrations from '@/components/agency/integrations/Integrations';
import ConnectStripe from '@/components/agency/stripe/ConnectStripe';
import { copyAgencyOnboardingLink } from '@/components/constants/constants';
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
                    <NotficationsDrawer />
                </div>
            </div>

            <div className='w-full flex flex-row justify-center items-center'>
                <div className="w-11/12 flex flex-row items-center justify-between  pt-6">
                    <div className="flex flex-row items-center gap-4">
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