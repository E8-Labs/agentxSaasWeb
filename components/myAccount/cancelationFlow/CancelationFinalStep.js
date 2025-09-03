import AgentSelectSnackMessage, { SnackbarTypes } from '@/components/dashboard/leads/AgentSelectSnackMessage';
import { completeCancelation, pauseSubscription } from '@/components/userPlans/UserPlanServices';
import { CircularProgress, TextField } from '@mui/material';
import Image from 'next/image';
import React, { useRef, useState } from 'react'

function CancelationFinalStep({
    handleContinue
}) {


    //cancel plan reasons
    const cancelPlanReasons = [
        {
            id: 1,
            reason: "It’s too expensive",
        },
        {
            id: 2,
            reason: "I’m using something else",
        },
        {
            id: 3,
            reason: "I’m not getting the results I expected",
        },
        {
            id: 4,
            reason: "It’s too complicated to use",
        },
        {
            id: 5,
            reason: "Others",
        },
    ];


    const textFieldRef = useRef(null);
    const [selectReason, setSelectReason] = useState("");
    const [showOtherReasonInput, setShowOtherReasonInput] = useState(false);
    const [otherReasonInput, setOtherReasonInput] = useState("");

    //delreason extra variables
    const [loading, setloading] = useState(false);
    const [loading2, setloading2] = useState(false)
    const [showError,setShowError] = useState(null)
    //function to select the cancel plan reason


    const handleSelectReason = async (item) => {
        // //console.log;
        setSelectReason(item.reason);
        if (item.reason === "Others") {
            setShowOtherReasonInput(true);
            const timer = setTimeout(() => {
                textFieldRef.current.focus();
            }, 300);
            return () => clearTimeout(timer);
        } else {
            setShowOtherReasonInput(false);
            setOtherReasonInput("");
        }
    };

    const handleCancel = async () => {
        setloading(true)
        let data = await completeCancelation()
        console.log('data', data)
        if (data.status == true) {

            let nextAction = "completeCancelation"
            handleContinue(nextAction)
        } else {
            setShowError(data.message)
        }
        setloading(false)
    }


    const handlePause = async () => {
        setloading2(true)
        await pauseSubscription()
        let nextAction = "closeModel"
        handleContinue(nextAction)
        setloading2(false)
    }


    return (
        <div className='flex flex-col items-center w-full -mt-5'>
            <AgentSelectSnackMessage
                isVisible={showError!=null}
                hide={() => {
                    setShowError(null);
                }}
                type={SnackbarTypes.Error}
                message={showError}
            />
            <div className="flex flex-row items-center justify-center">
                <Image
                    src={"/otherAssets/feedbackIcon2.png"}
                    height={48}
                    width={48}
                    alt="*"
                />
            </div>

            <div className='text-xl font-semibold mt-4'

            >
                One Final Step to Cancel
            </div>

            <div className='text-base font-normal mt-1'
            >
                {`Help Us Understand What’s Missing!`}
            </div>

            <div className="mt-9 w-full flex-col  justify-between">
                <div className='h-[40vh]'>
                    {cancelPlanReasons.map((item, index) => (
                        <button
                            onClick={() => {
                                handleSelectReason(item);
                            }}
                            key={index}
                            style={{
                                fontWeight: "500",
                                fontSize: 15,
                                textAlign: "start",
                                marginTop: 6,
                            }}
                            className="flex flex-row items-center gap-2"
                        >
                            <div

                                className="rounded-full flex flex-row items-center justify-center"
                                style={{
                                    border:
                                        item.reason === selectReason
                                            ? "2px solid #7902DF"
                                            : "2px solid #15151510",
                                    // backgroundColor: item.reason === selectReason ? "#7902DF" : "",
                                    // margin: item.reason === selectReason && "5px",
                                    height: "20px",
                                    width: "20px",
                                }}
                            >
                                <div
                                    className="w-full h-full rounded-full"
                                    style={{
                                        backgroundColor:
                                            item.reason === selectReason && "#7902DF",
                                        height: "12px",
                                        width: "12px",
                                    }}
                                />
                            </div>
                            <div>{item.reason}</div>
                        </button>
                    ))}
                    {showOtherReasonInput && (
                        <div className="w-full mt-4">
                            <div className='font-semibold text-lg'>
                                Tell us more
                            </div>
                            <textarea
                                inputRef={textFieldRef}
                                placeholder="Type here"
                                className="w-full mt-4 rounded-md p-2 focus:border-none outline-none border"
                                minRows={4}
                                maxRows={5}
                                value={otherReasonInput}
                                onChange={(e) => {
                                    setOtherReasonInput(e.target.value);
                                }}
                                style={{ resize: 'none' }}
                                textAlign="top"

                            />
                        </div>
                    )}
                </div>


                {loading ? (
                    <div className="flex flex-row items-center justify-center mt-10">
                        <CircularProgress size={35} />
                    </div>
                ) : (
                    <button
                        className="w-full flex flex-row items-center h-[50px] rounded-lg text-white justify-center mt-10"
                        style={{
                            fontWeight: "400",
                            fontSize: 16.8,
                            outline: "none",
                            backgroundColor: (selectReason && (selectReason !== "Others" || otherReasonInput))
                                ? "#7902df"
                                : "#00000050",
                            color: selectReason && (selectReason !== "Others" || otherReasonInput)
                                ? "#ffffff"
                                : "#000000",
                        }}
                        onClick={() => {
                            handleCancel();
                        }}
                        disabled={!selectReason && (selectReason !== "Others" || otherReasonInput)}
                    >
                        Cancel Subscription
                    </button>
                )}

                {loading2 ? (
                    <div className="flex flex-row items-center justify-center mt-10">
                        <CircularProgress size={35} />
                    </div>
                ) : (
                    <button
                        className="w-full flex flex-row items-center h-[50px] rounded-lg border justify-center mt-3"

                        onClick={() => {
                            handlePause();
                        }}
                    >
                        Pause Subscription
                    </button>
                )}
            </div>
        </div>

    )
}

export default CancelationFinalStep