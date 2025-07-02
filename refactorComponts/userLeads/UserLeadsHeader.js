import React from 'react';
import { SnackbarTypes } from '@/components/dashboard/leads/AgentSelectSnackMessage';
import Image from 'next/image';
import { userLeadsStyles } from '@/components/globalsstyles/Stles';
import NotficationsDrawer from '@/components/notofications/NotficationsDrawer';

const UserLeadsHeader = ({
    selectedLeadsList,
    selectedAll,
    userLocalDetails,
    setAssignLeadModal,
    setSnackMessage,
    setShowSnackMessage,
    setMessageType
}) => {
    return (
        <div
            className="flex flex-row items-center justify-between w-full "
            // style={{ borderBottom: "1px solid #15151510" }}
        >
            <div style={{ fontWeight: "600", fontSize: 24 }}>Leads</div>
            <div className="flex fex-row items-center gap-6">
                <button
                    style={{
                        backgroundColor:
                            selectedLeadsList.length > 0 || selectedAll
                                ? "#7902DF"
                                : "",
                        color:
                            selectedLeadsList.length > 0 || selectedAll
                                ? "white"
                                : "#000000",
                    }}
                    className="flex flex-row items-center gap-4 h-[50px] rounded-lg bg-[#33333315] w-[189px] justify-center"
                    onClick={() => {
                        if (userLocalDetails?.plan) {
                            setAssignLeadModal(true);
                        } else {
                            setSnackMessage("Add payment method to continue");
                            setShowSnackMessage(true);
                            setMessageType(SnackbarTypes.Warning);
                        }
                    }}
                    disabled={!(selectedLeadsList.length > 0 || selectedAll)}
                >
                    {selectedLeadsList.length > 0 || selectedAll ? (
                        <Image
                            src={"/assets/callBtnFocus.png"}
                            height={17}
                            width={17}
                            alt="*"
                        />
                    ) : (
                        <Image
                            src={"/assets/callBtn.png"}
                            height={17}
                            width={17}
                            alt="*"
                        />
                    )}
                    <span style={userLeadsStyles.heading}>Start Calling</span>
                </button>
                <div className="flex flex-col">
                    <NotficationsDrawer />
                </div>
            </div>
        </div>
    )
}

export default UserLeadsHeader
