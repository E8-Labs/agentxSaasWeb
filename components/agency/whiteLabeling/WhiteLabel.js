import NotficationsDrawer from '@/components/notofications/NotficationsDrawer';
import React, { useState } from 'react'
import BrandConfig from './BrandConfig';
import DomainConfig from './DomainConfig';
import EmailConfig from './EmailConfig';
import NotificationConfig from './NotificationConfig';
import TutorialConfig from './TutorialConfig';
import SupportWidgetConfig from './SupportWidgetConfig';

const WhiteLabel = () => {

    const [selectedWhiteLabelTabs, setSelectedWhiteLabelTabs] = useState(1);

    const WhiteLabelTabs = [
        { id: 1, title: "Brand Config" },
        { id: 2, title: "Domain Config" },
        { id: 3, title: "Email Config" },
        { id: 4, title: "Notification Settings" },
        { id: 5, title: "Tutorial Videos" },
        { id: 6, title: "Support widget" },
    ];

    return (
        <div className="w-full h-[100svh]">
            <div className="w-full flex flex-row items-center justify-between px-5 py-5 border-b h-[10svh]">
                <div style={styles.semiBoldHeading}>
                    White Label
                </div>
                <div className="flex flex-row items-center gap-2">
                    <NotficationsDrawer />
                </div>
            </div>
            <div className="flex flex-row items-start h-[90svh]">
                <div className="w-3/12 px-4 pt-4 h-full border-r flex flex-col">
                    {
                        WhiteLabelTabs.map((item) => {
                            return (
                                <button
                                    key={item.id}
                                    className={`${selectedWhiteLabelTabs === item.id ? "text-purple border-purple bg-purple-100 rounded-lg" : "text-black"} outline-none text-start h-[48px] px-2`}
                                    onClick={() => { setSelectedWhiteLabelTabs(item.id) }}
                                    style={styles.regular}
                                >
                                    {item.title}
                                </button>
                            )
                        })
                    }
                </div>
                <div className="w-9/12 h-full px-4 pt-4 overflow-auto scrollbar-hidden">
                    {selectedWhiteLabelTabs === 1 && (
                        <div className="w-full h-full">
                            <BrandConfig />
                        </div>
                    )}
                    {selectedWhiteLabelTabs === 2 && (
                        <div className="w-full h-full">
                            <DomainConfig />
                        </div>
                    )}
                    {selectedWhiteLabelTabs === 3 && (
                        <div className="w-full h-full">
                            <EmailConfig />
                        </div>
                    )}
                    {selectedWhiteLabelTabs === 4 && (
                        <div className="w-full h-full">
                            <NotificationConfig />
                        </div>
                    )}
                    {selectedWhiteLabelTabs === 5 && (
                        <div className="w-full h-full">
                            <TutorialConfig />
                        </div>
                    )}
                    {selectedWhiteLabelTabs === 6 && (
                        <div className="w-full h-full">
                            <SupportWidgetConfig />
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default WhiteLabel;



const styles = {
    semiBoldHeading: {
        fontSize: 22,
        fontWeight: "600"
    },
    regular: {
        fontSize: 15,
        fontWeight: "500"
    },
}
