import { Box, CircularProgress, Modal } from '@mui/material'
import Image from 'next/image';
import React, { useEffect, useState } from 'react'
import { AuthToken } from '../plan/AuthDetails';
import Apis from '@/components/apis/Apis';
import axios from 'axios';
import { getMonthlyPlan } from './GetPlansList';
import AgentSelectSnackMessage, { SnackbarTypes } from '@/components/dashboard/leads/AgentSelectSnackMessage';
import { formatDecimalValue } from '../agencyServices/CheckAgencyData';

const ViewSubAccountPlans = ({
    showPlans,
    hidePlans,
    selectedUser
}) => {

    console.log("selected user passed is", selectedUser);

    const [initialLoader, setInitialLoader] = useState(false);
    const [agencyPlans, setAgencyPlans] = useState([]);
    const [subAccountPlans, setSubAccountPlans] = useState([]);
    const [selectedPlans, setSelectedPlans] = useState([]);
    //update agency plans loader
    const [updatePlansLoader, setUpdatePlansLoader] = useState(false);
    //snack bar msg
    const [snackMsg, setSnackMsg] = useState(null);
    const [snackMsgType, setSnackMsgType] = useState(SnackbarTypes.Error);

    useEffect(() => {
        if (subAccountPlans?.length > 0) {
            setSelectedPlans(subAccountPlans.map(plan => plan.id));
        }
    }, [subAccountPlans]);

    useEffect(() => {
        console.log("Current selected plan is", selectedPlans);
    }, [selectedPlans])

    useEffect(() => {
        getPlans();
        getAgencyPlans()
    }, []);

    //const get Agency plans
    const getAgencyPlans = async () => {
        try {
            setInitialLoader(true);
            const Token = AuthToken();
            // const ApiPath = Apis.getPlansForAgency;
            // const response = await axios.get(ApiPath, {
            //     headers: {
            //         "Authorization": "Bearer " + Token,
            //         "Content-Type": "application/json"
            //     }
            // });
            const response = await getMonthlyPlan();
            if (response) {
                console.log("Response of get hosted plans api is", response);
                setAgencyPlans(response);
            }
        } catch (error) {
            console.log("Error occured in getAgencysubaccount plans is", error)
        }
    }

    //get plans from user id api
    const getPlans = async () => {
        try {
            setInitialLoader(true);
            const Token = AuthToken();
            console.log("user id is", selectedUser?.id);
            let ApiPath = null;
            if (selectedUser) {
                ApiPath = `${Apis.getSubAccountPlans}?userId=${selectedUser?.id}`;
            } else {
                ApiPath = Apis.getSubAccountPlans;
            }
            console.log("Api path of get plan is", ApiPath);
            const response = await axios.get(ApiPath, {
                headers: {
                    "Authorization": "Bearer " + Token,
                    "Content-Type": "application/json"
                }
            });

            if (response) {
                console.log("Response of get plans api is", response.data.data);
                setSubAccountPlans(response.data.data.monthlyPlans);
                setInitialLoader(false);
            }

        } catch (error) {
            setInitialLoader(false);
            console.error("Error occured in getting subaccount plans", error);
        }
    }

    //toggle plans click
    const handleTogglePlanClick = (planId) => {
        setSelectedPlans((prev) =>
            prev.includes(planId)
                ? prev.filter((id) => id !== planId) // remove if already selected
                : [...prev, planId] // add if not selected
        );
    };

    //handle Update agency plans
    const handleUpdateAgencyPlans = async () => {
        try {
            setUpdatePlansLoader(true);
            const Token = AuthToken();
            const ApiPath = Apis.updateSubAccountPlansFromAgency;
            console.log("Selected user is", selectedUser)
            const apiData = {
                subaccountUserId: selectedUser.id,
                monthlyPlans: selectedPlans
            }
            const response = await axios.post(ApiPath, apiData, {
                headers: {
                    "Authorization": "Bearer " + Token,
                    "Content-Type": "application/json"
                }
            });
            if (response) {
                console.log("Response of update agency subaccount plans api is", response.data);
                if (response.data.status === true) {
                    setSnackMsg(response.data.message);
                    setSnackMsgType(SnackbarTypes.Success);
                    setUpdatePlansLoader(false);
                } else {
                    setSnackMsg(response.data.message);
                    setSnackMsgType(SnackbarTypes.Error);
                    setUpdatePlansLoader(false);
                }
            }
        } catch (error) {
            setUpdatePlansLoader(false);
            console.log("Error occured in update agency plans api is", error)
        }
    }

    //check if the selected plans equal to agency plans
    // utility function to compare two arrays of IDs
    const arraysEqual = (a, b) => {
        if (a.length !== b.length) return false;
        const sortedA = [...a].sort();
        const sortedB = [...b].sort();
        return sortedA.every((val, index) => val === sortedB[index]);
        console.log("Agency plans passed are", a)
        console.log("Selected palns passed are", b)
        const comparing = a.map((item) => { return item }) === b.map((item) => { return item })
        console.log("is cparing true or false", Boolean(comparing));
    };


    return (
        <Modal
            open={showPlans}
            onClose={hidePlans}
            closeAfterTransition
            BackdropProps={{
                timeout: 500,
                sx: {
                    backgroundColor: "#00000030",
                    // backdropFilter: "blur(20px)",
                },
            }}
        >
            <Box className="w-6/12 bg-white p-6 h-[70vh]" sx={subaccountstyles.modalsStyle}>
                <AgentSelectSnackMessage
                    isVisible={snackMsg !== null}
                    message={snackMsg}
                    hide={() => {
                        setSnackMsg(null);
                    }}
                    type={snackMsgType}
                />
                <div className='w-full flex flex-row items-center justify-between mb-6'>
                    <div style={{ fontWeight: "600", fontSize: 18 }}>
                        View Plans
                    </div>
                    <button onClick={hidePlans}>
                        <Image
                            src={"/assets/cross.png"}
                            alt='*'
                            height={14}
                            width={20}
                        />
                    </button>
                </div>
                {/*selectedUser.plan.map((plan, index) => ())*/}
                {
                    initialLoader ? (
                        <div className="w-full flex flex-row items-center justify-center">
                            <CircularProgress size={25} />
                        </div>
                    ) : (
                        <div className="w-full">
                            <div className="h-[53vh] overflow-auto">
                                {agencyPlans.map((item, index) => (
                                    <button
                                        key={index}
                                        className="w-full mt-4 outline-none"
                                        disabled={item.id === selectedUser?.plan?.id}
                                        onClick={(e) => { handleTogglePlanClick(item.id); }}
                                    >
                                        {item.hasTrial && (
                                            <div className="w-full rounded-t-lg bg-gradient-to-r from-[#7902DF] to-[#C502DF] px-4 py-2">
                                                <div className="flex flex-row items-center gap-2">
                                                    <Image
                                                        src={"/otherAssets/batchIcon.png"}
                                                        alt="*"
                                                        height={24}
                                                        width={24}
                                                    />
                                                    <div
                                                        style={{
                                                            fontWeight: "600",
                                                            fontSize: 18,
                                                            color: "white",
                                                        }}
                                                    >
                                                        First {item.hasTrial == true && (`| ${item.trialValidForDays}`)} Days Free
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        <div
                                            className={`px-4 py-1 pb-4 ${item.hasTrial ? "rounded-b-lg" : "rounded-lg"}`}
                                            style={{
                                                ...styles.pricingBox,
                                                border:
                                                    selectedPlans.includes(item.id)
                                                        ? "2px solid #7902DF"
                                                        : "1px solid #15151520",
                                                backgroundColor: item.id === selectedUser?.plan?.id ? "#402FFF05" : "",
                                            }}
                                        >
                                            <div
                                                style={{ ...styles.triangleLabel, borderTopRightRadius: item.hasTrial ? "0px" : "7px" }}
                                            ></div>
                                            <span style={styles.labelText}>{formatDecimalValue(item.percentageDiscount)}%</span>
                                            <div
                                                className="flex flex-row items-start gap-3"
                                                style={styles.content}
                                            >
                                                <div className="mt-1">
                                                    <div>
                                                        {item.id === selectedUser?.plan?.id ? (
                                                            <Image
                                                                src={"/svgIcons/checkMark.svg"}
                                                                height={24}
                                                                width={24}
                                                                alt="*"
                                                            />
                                                        ) : (
                                                            <Image
                                                                src={"/svgIcons/unCheck.svg"}
                                                                height={24}
                                                                width={24}
                                                                alt="*"
                                                            />
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="w-full">
                                                    {item.id === selectedUser?.plan?.id && (
                                                        <div
                                                            className="-mt-[27px] flex px-2 py-1 bg-purple rounded-full text-white"
                                                            style={{
                                                                fontSize: 11.6,
                                                                fontWeight: "500",
                                                                width: "fit-content",
                                                            }}
                                                        >
                                                            Current Plan
                                                        </div>
                                                    )}

                                                    <div className="flex flex-row items-center gap-3">
                                                        <div className="flex flex-row items-center gap-4">
                                                            <div
                                                                style={{
                                                                    color: "#151515",
                                                                    fontSize: 20,
                                                                    fontWeight: "600",
                                                                }}
                                                            >
                                                                {item.title}
                                                            </div>
                                                            {item.tag &&
                                                                <div className="bg-purple text-white px-2 py-1 rounded-full">
                                                                    {item.tag}
                                                                </div>
                                                            }
                                                        </div>
                                                        {item.status && (
                                                            <div
                                                                className="flex px-2 py-1 bg-purple rounded-full text-white"
                                                                style={{ fontSize: 11.6, fontWeight: "500" }}
                                                            >
                                                                {item.status}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="flex flex-row items-center justify-between">
                                                        <div
                                                            className="mt-2"
                                                            style={{
                                                                color: "#15151590",
                                                                fontSize: 12,
                                                                width: "60%",
                                                                fontWeight: "600",
                                                            }}
                                                        >
                                                            {item.planDescription}
                                                        </div>
                                                        <div className="flex flex-row items-center">

                                                            <div className="flex flex-row justify-start items-center">
                                                                <div style={styles.originalPrice}>
                                                                    ${formatDecimalValue(item.originalPrice)}
                                                                </div>
                                                                <div style={styles.discountedPrice}>
                                                                    ${formatDecimalValue(item.discountedPrice)}
                                                                </div>
                                                                <p style={{ color: "#15151580" }}>/mo*</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                            <div className="mt-4 mt-2">
                                {!arraysEqual(
                                    subAccountPlans.map(plan => plan.id),
                                    selectedPlans
                                ) && (
                                        <button
                                            className="w-full text-center rounded-lg text-white bg-purple h-[49px]"
                                            onClick={handleUpdateAgencyPlans}
                                            disabled={updatePlansLoader}
                                        >
                                            {updatePlansLoader ? (
                                                <CircularProgress size={25} sx={{ color: "white" }} />
                                            ) : (
                                                "Save"
                                            )}
                                        </button>
                                    )}
                            </div>

                        </div>
                    )
                }
            </Box>
        </Modal>
    )
}

export default ViewSubAccountPlans;


const subaccountstyles = {
    modalsStyle: {
        height: "auto",
        // bgcolor: "transparent",
        // p: 2,
        mx: "auto",
        my: "50vh",
        transform: "translateY(-55%)",
        borderRadius: 2,
        border: "none",
        outline: "none",
    },
    nrmlTxt: {
        fontWeight: "500",
        fontSize: 15
    }
};

const styles = {
    text: {
        fontSize: 12,
        color: "#00000090",
    },
    text2: {
        textAlignLast: "left",
        fontSize: 15,
        color: "#000000",
        fontWeight: 500,
        whiteSpace: "nowrap", // Prevent text from wrapping
        overflow: "hidden", // Hide overflow text
        textOverflow: "ellipsis", // Add ellipsis for overflow text
    },
    paymentModal: {
        height: "auto",
        bgcolor: "transparent",
        // p: 2,
        mx: "auto",
        my: "50vh",
        transform: "translateY(-50%)",
        borderRadius: 2,
        border: "none",
        outline: "none",
    },
    headingStyle: {
        fontSize: 16,
        fontWeight: "700",
    },
    gitTextStyle: {
        fontSize: 15,
        fontWeight: "700",
    },

    //style for plans
    cardStyles: {
        fontSize: "14",
        fontWeight: "500",
        border: "1px solid #00000020",
    },
    pricingBox: {
        position: "relative",
        // padding: '10px',
        // borderRadius: "10px",
        // backgroundColor: '#f9f9ff',
        display: "inline-block",
        width: "100%",
    },
    triangleLabel: {
        position: "absolute",
        top: "0",
        right: "0",
        width: "0",
        height: "0",
        borderTop: "50px solid #7902DF", // Increased height again for more padding
        borderLeft: "50px solid transparent",
    },
    labelText: {
        position: "absolute",
        top: "10px", // Adjusted to keep the text centered within the larger triangle
        right: "5px",
        color: "white",
        fontSize: "10px",
        fontWeight: "bold",
        transform: "rotate(45deg)",
    },
    content: {
        textAlign: "left",
        paddingTop: "10px",
    },
    originalPrice: {
        textDecoration: "line-through",
        color: "black",
        fontSize: 15,
        fontWeight: "600",
    },
    discountedPrice: {
        color: "#7902DF65",
        fontWeight: "bold",
        fontSize: 18,
        marginLeft: "10px",
    },
};




{/*
                            <div className="w-full">
                                {
                                    selectedUser?.plan ? (
                                        <div className="flex justify-between items-center border rounded-lg p-4 hover:shadow transition">
                                            <div className="w-[80%]">
                                                <h3 className="font-semibold text-gray-900">
                                                    {selectedUser?.plan?.title} | {selectedUser?.plan?.minutes || "X"}mins
                                                </h3>
                                                <p className="text-sm text-gray-500">{selectedUser?.plan?.planDescription}</p>
                                                <p className="mt-1 font-medium text-lg text-gray-800">
                                                    ${selectedUser?.plan?.price}/<span className="text-sm text-gray-400">Mo*</span>
                                                </p>
                                            </div>
                                        </div>) : (
                                        <div className='text-xl font-bold text-center mt-6'>
                                            No Plan
                                        </div>
                                    )
                                }
                            </div>
                        */}