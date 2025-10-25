import CloseBtn from '@/components/globalExtras/CloseBtn';
import { next30Days } from '@/constants/Constants'
import { Box, CircularProgress, Modal, Tooltip } from '@mui/material';
import moment from 'moment';
import Image from 'next/image'
import React, { useEffect, useState } from 'react'

function DowngradePlanPopup({
    open,
    handleClose,
    onConfirm,
    downgradeTitle,
    features,
    subscribePlanLoader,
    isFrom,
    selectedUser
}) {

    console.log("Features of plans passed are", features)

    const [confirmChecked, setConfirmChecked] = useState(false)
    const [nxtCharge, setNxtChage] = useState(null)


    useEffect(() => {
        getUserData()
    }, [])


    const getUserData = () => {
        let data = localStorage.getItem("User")

        if (data) {
            let u = JSON.parse(data)
            let date = u.user.nextChargeDate

            date = moment(date).format("MM/DD/YYYY")
            setNxtChage(date)
        }
    }


    return (
        <Modal
            open={open}
        // onClose={handleClose()}
        //     handleResetValues();
        //     handleClose("");
        // }}
        >
            {/*<Box className="bg-white rounded-xl p-6 max-w-md w-[95%] mx-auto mt-20 shadow-lg">*/}
            <Box className="bg-white max-h-[90vh] overflow-auto rounded-xl w-6/12 md:w-6/12 lg:w-[35%] border-none outline-none shadow-lg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                <div className="w-full flex flex-col items-center justify-between h-[100%]">
                    <div className='w-full flex flex-col items-center justify-center px-4 pt-4 h-[90%] '>
                        <div className='w-full flex flex-row items-start justify-end  '>
                            <CloseBtn
                                onClick={
                                    handleClose
                                }
                            />
                        </div>
                        <div className='flex flex-col items-center gap-2 h-full py-4 '>

                            <Image className='-mt-5'
                                src={"/otherAssets/IconAccount.png"}
                                height={48} width={48} alt='*'
                            />
                            <div
                                className="text-center text-xl font-semibold"

                            >
                                {downgradeTitle}
                            </div>

                            <div className="flex flex-col items-center justify-center w-full ">
                                <div
                                    className="text-center text-sm font-normal"
                                >
                                    {`This means you’ll lose access to the premium features below starting ${nxtCharge}. Still want to move forward?`}
                                </div>

                                <div
                                    className="text-center text-sm font-normal mt-2 mb-1"
                                >
                                    {`You’ll lose access to`}
                                </div>

                                <div
                                    className=' overflow-y-auto  '
                                    style={{
                                        scrollbarWidth: "none",
                                        msOverflowStyle: "none",
                                        "&::-webkit-scrollbar": {
                                            display: "none",
                                        },
                                    }}
                                >
                                    <div className="grid grid-cols-2 gap-x-2 gap-y-3 w-full mt-2 place-items-center">
                                        {
                                            isFrom ? (
                                                features?.map((item, index) => (
                                                    <div key={index} className="flex flex-row items-center gap-2 w-full">
                                                        <Image src="/svgIcons/selectedTickBtn.svg"
                                                            height={16} width={16} alt="cross"
                                                        />
                                                        <div className="text-[13px] font-normal flex flex-row items-center gap-2">
                                                            <span>{item?.text}</span>
                                                            {item.subtext && (
                                                                <Tooltip
                                                                    title={item.subtext}
                                                                    arrow
                                                                    placement="top"
                                                                    componentsProps={{
                                                                        tooltip: {
                                                                            sx: {
                                                                                backgroundColor: "#ffffff", // Ensure white background
                                                                                color: "#333", // Dark text color
                                                                                fontSize: "14px",
                                                                                padding: "10px 15px",
                                                                                borderRadius: "8px",
                                                                                boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)", // Soft shadow
                                                                            },
                                                                        },
                                                                        arrow: {
                                                                            sx: {
                                                                                color: "#ffffff", // Match tooltip background
                                                                            },
                                                                        },
                                                                    }}
                                                                >
                                                                    <div
                                                                        style={{
                                                                            fontSize: 12,
                                                                            fontWeight: "600",
                                                                            color: "#000000",
                                                                            cursor: "pointer",
                                                                        }}
                                                                    >
                                                                        <Image src="/agencyIcons/InfoIcon.jpg" alt="info" width={16} height={16} className="cursor-pointer rounded-full"
                                                                        />
                                                                    </div>
                                                                </Tooltip>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                features?.map((item, index) => (
                                                    <div key={index} className="flex flex-row items-center gap-2 w-full">
                                                        <Image src="/svgIcons/selectedTickBtn.svg"
                                                            height={16} width={16} alt="cross"
                                                        />
                                                        <div className="text-[13px] font-normal">
                                                            {item}
                                                        </div>
                                                    </div>
                                                ))
                                            )
                                        }
                                    </div>
                                </div>


                            </div>




                        </div>
                    </div>
                    <div className='h-[10%] w-full pb-4 px-4'>
                        <div className='flex flex-row items-center w-full justify-start mt-2 gap-2'>
                            <button onClick={() => {
                                setConfirmChecked(!confirmChecked)
                            }}>
                                {confirmChecked ? (
                                    <div
                                        className="bg-purple flex flex-row items-center justify-center rounded"
                                        style={{ height: "17px", width: "17px" }}
                                    >
                                        <Image
                                            src={"/assets/whiteTick.png"}
                                            height={6}
                                            width={8}
                                            alt="*"
                                        />
                                    </div>
                                ) : (
                                    <div
                                        className="bg-none border-2 flex flex-row items-center justify-center rounded"
                                        style={{ height: "17px", width: "17px" }}
                                    ></div>
                                )}
                            </button>

                            <div className='text-xs font-normal'>
                                {`I confirm that i’ll lose access to features.`}
                            </div>
                        </div>
                        {
                            subscribePlanLoader ? (
                                <div className="w-full flex flex-row items-center justify-center mt-5 h-[40px]">
                                    <CircularProgress size={30} />
                                </div>
                            ) : (
                                <button
                                    className={`w-full flex items-center rounded-lg justify-center mt-5 border h-[40px] ${!confirmChecked ? "bg-btngray text-black" : "bg-purple text-white"}`}
                                    style={{
                                        fontWeight: "400",
                                        fontSize: 15.8,
                                        outline: "none",
                                    }}

                                    disabled={!confirmChecked}

                                    onClick={() => {
                                        onConfirm()
                                    }}
                                >
                                    Confirm Cancellation
                                </button>
                            )
                        }
                    </div>
                </div>
            </Box>
        </Modal>
    )
}

export default DowngradePlanPopup