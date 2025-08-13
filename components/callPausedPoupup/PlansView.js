import React, { useState } from 'react'
import { Box, CircularProgress, Modal } from '@mui/material'
import Image from 'next/image';
import Apis from '../apis/Apis';
import axios from 'axios';
import AgentSelectSnackMessage, { SnackbarTypes } from '../dashboard/leads/AgentSelectSnackMessage';

function PlansView({
    handleClose,
    onPlanSelect,
    selectedPlan,
    setSelectedPlan
}) {

    const plans = [
        {
            name: "Starter",
            mins: "125",
            calls: "500",
            price: "$99",
        },
        {
            name: "Growth",
            mins: "360",
            calls: "1,500",
            price: "$299",
        },
        {
            name: "Scale",
            mins: "800",
            calls: "5,000",
            price: "$599",
        }
    ]

    const [isLoading, setIsLoading] = useState(false);
    const [mutlipleChargeLoading, setMulitpleChargeLoading] = useState(false)
    const [showMessage, setShowMessage] = useState({
        message: null, type: null
    })

    const handleDontUpgrade = async () => {
        setIsLoading(true);
        await handleAutoCharge();
        handleClose();
        setIsLoading(false);
    }

    const handlePauseCall = async (action) => {
        try {
            setMulitpleChargeLoading(true)
            const data = localStorage.getItem("User")

            if (data) {
                let u = JSON.parse(data)


                let apidata = {
                    action: action
                }


                const response = await axios.post(Apis.handleMultipleCharge, apidata, {
                    headers: {
                        'Authorization': 'Bearer ' + u.token
                    }
                })

                if (response) {
                    console.log('multiple charge api reponse is', response.data)
                    if (response.data.status === true) {
                        setShowMessage({
                            message: response.data.message,
                            type: SnackbarTypes.Success
                        });
                        handleClose()
                      
                    } else {
                        setShowMessage({
                            message: response.data.message,
                            type: SnackbarTypes.Error
                        })
                        console.log('multiple charge api message is', response.data.message)
                    }
                }
            }
        } catch (e) {
            console.log('error in multiple charge api', e)
            // setShowMessage({
            //     message:e,
            //     type:SnackbarTypes.Error
            // })
        }
        finally {
            setMulitpleChargeLoading(false)
        }
    }


    return (
        <div>
            <AgentSelectSnackMessage
                isVisible={showMessage.message != null}
                hide={() => {
                    setShowMessage({
                        message: null, type: null
                    })
                }}
                message={showMessage.message}

                type={showMessage.type}
            />
            <div className="flex flex-col items-center gap-4 w-full z-10 relative mt-5">
                <h1 className="text-[20px] font-semibold text-center mt-4">
                    {`We've Paused Your Calls to Save You Money`}
                </h1>
                <Image src={'/otherAssets/callPausedIcon.jpg'}
                    alt="call paused icon"
                    width={69}
                    height={69}
                />
                <div className="text-center text-[14px] font-[400] text-black max-w-xl">
                    {`We noticed you've renewed your $45 plan`} <span className="font-semibold">twice</span> in the last <span className="font-semibold">24 hours</span>.{` To ensure you get the best value, we’ve temporarily paused your calls.`}
                </div>
            </div>
            <div className="w-full flex flex-col items-center gap-4 z-10 relative">
                <div className="text-xl font-semibold text-center mb-4 mt-7">
                    Upgrade to unlock better rates and more calls
                </div>
                <div className="flex flex-row justify-between w-full gap-5">
                    {plans.map((plan,) => (
                        <button key={plan.name} onClick={() => setSelectedPlan(plan)}>
                            <div
                                className={`flex-1 rounded-xl w-[16vw] h-[27vh] border border-2 ${selectedPlan?.name === plan.name ? 'border-purple' : 'border-gray-200'} rounded-lg p-4 flex flex-col items-start justify-between `}
                                style={{ margin: 0 }}
                            >
                                <div className="flex flex-col items-start text-left w-full gap-1">
                                    <div className="font-semibold text-lg">{plan.name}</div>
                                    <div className="text-gray-600">
                                        {plan.mins} Mins | {plan.calls} Calls*
                                        <br />
                                        per month
                                    </div>
                                    <div className="text-3xl font-bold mt-2">{plan.price}</div>
                                </div>

                                <button className="mt-4 w-full bg-purple-600 bg-purple text-white font-medium py-2 rounded-lg transition"
                                    onClick={onPlanSelect}
                                >
                                    Select Plan
                                </button>

                            </div>
                        </button>
                    ))}
                </div>
                <div className="w-full flex flex-col justify-center items-center mt-4">
                {
                    mutlipleChargeLoading ? <CircularProgress size={20} /> :
                    <>
                        <button className="text-purple text-base font-medium bg-transparent" onClick={() => {
                            handlePauseCall("continue")
                        }}>
                            {`Don't Upgrade and Continue on $45/mo plan`}
                        </button>



                        <button className="text-gray-500 text-base font-medium mt-2"
                            onClick={() => {
                                handlePauseCall("pause_until_subscription")
                            }}
                        >
                            {`Pause Calls Until Next Subscription`}
                        </button>
                    </>
                    }
                </div>

            </div>
        </div >
    )
}

export default PlansView


export const handleAutoCharge = async () => {
    try {
        let data = localStorage.getItem('User');
        if (data) {
            // setIsLoading(true);
            let userData = JSON.parse(data);

            let ApiPath = Apis.confirmContinueCharging;
            console.log('ApiPath', ApiPath)

            const response = await axios.post(ApiPath, {}, {
                headers: {
                    'Authorization': `Bearer ${userData.token}`
                }
            });

            console.log('response', response)

            if (response.data.status) {
                return true;
            }


        }

    } catch (error) {
        console.log('error', error)
    } finally {
        // setIsLoading(false);
    }
}