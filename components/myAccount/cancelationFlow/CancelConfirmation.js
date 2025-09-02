import React from 'react'

function CancelConfirmation() {
    return (
        <div>
            <div
                className="text-center mt-8"
                style={{
                    fontWeight: "600",
                    fontSize: 22,
                }}
            >
                Confirm Your Cancellation
            </div>

            <div className="flex flex-row items-center justify-center w-full mt-6">
                <div
                    className="text-center"
                    style={{
                        fontWeight: "500",
                        fontSize: 15,
                        width: "70%",
                        alignSelf: "center",
                    }}
                >
                    Canceling your AgentX means you lose access to your agents,
                    leads, pipeline, staff and more.
                </div>
            </div>

            <button
                className="w-full flex flex-row items-center h-[50px] rounded-lg bg-purple text-white justify-center mt-10"
                style={{
                    fontWeight: "600",
                    fontSize: 16.8,
                    outline: "none",
                }}
            >
                Never mind, keep my AgentX
            </button>

            {
                cancelPlanLoader ? (
                    <div className="w-full flex flex-row items-center justify-center mt-8">
                        <CircularProgress size={30} />
                    </div>
                ) : (
                    <button
                        className="w-full flex flex-row items-center rounded-lg justify-center mt-8"
                        style={{
                            fontWeight: "600",
                            fontSize: 16.8,
                            outline: "none",
                        }}
                        onClick={handleCancelPlan}
                    // onClick={() => { setShowConfirmCancelPlanPopup2(true) }}
                    >
                        Yes. Cancel
                    </button>
                )
            }
        </div >
    )
}

export default CancelConfirmation