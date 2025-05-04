import { Modal, Box, Switch, CircularProgress } from '@mui/material';
import { useState } from 'react';
import { AuthToken } from './AuthDetails';
import Apis from '@/components/apis/Apis';
import axios from 'axios';
import AgentSelectSnackMessage, { SnackbarTypes } from '@/components/dashboard/leads/AgentSelectSnackMessage';
import { useEffect } from 'react';
import Image from 'next/image';
// import { AiOutlineInfoCircle } from 'react-icons/ai';

export default function AddMonthlyPlan({ open, handleClose, onPlanCreated, canAddPlan }) {

    const [allowTrial, setAllowTrial] = useState(false);

    const [title, setTitle] = useState("");
    const [tag, setTag] = useState("");
    const [planDescription, setPlanDescription] = useState("");
    const [originalPrice, setOriginalPrice] = useState("");
    const [discountedPrice, setDiscountedPrice] = useState("");
    const [minutes, setMinutes] = useState("");
    const [trialValidForDays, setTrialValidForDays] = useState("");
    // const [trialMinutes, setTrialMinutes] = useState("");

    const [createPlanLoader, setCreatePlanLoader] = useState(false);
    const [snackMsg, setSnackMsg] = useState(null);
    const [snackMsgType, setSnackMsgType] = useState(SnackbarTypes.Error);
    const [minCostErr, setMinCostErr] = useState(false);

    //auto check minCostError
    useEffect(() => {
        if (originalPrice && minutes) {
            const P = originalPrice * 100 / minutes;
            console.log("Calculated price is", P);
            if (P < 20) {
                setMinCostErr(true);
            } else if (P >= 20) {
                setMinCostErr(false);
            }
        }
    }, [minutes, originalPrice]);



    //code to create plan
    const handleCreatePlan = async () => {
        try {
            setCreatePlanLoader(true);

            console.log("Working");

            const Token = AuthToken();
            const ApiPath = Apis.addMonthlyPlan;
            console.log("Api path is", ApiPath);
            const formData = new FormData();
            formData.append("title", title);
            formData.append("planDescription", planDescription);
            formData.append("originalPrice", discountedPrice);
            formData.append("discountedPrice", originalPrice);
            formData.append("percentageDiscount", discountedPrice / minutes * 100);
            formData.append("hasTrial", allowTrial);
            formData.append("trialValidForDays", trialValidForDays);
            formData.append("trialMinutes", "23");
            formData.append("tag", tag);
            formData.append("minutes", minutes);

            for (let [key, value] of formData.entries()) {
                console.log(`${key} = ${value}`);
            }
            // return

            const response = await axios.post(ApiPath, formData, {
                headers: {
                    "Authorization": "Bearer " + Token
                }
            });

            if (response) {
                console.log("Response of Add plan is", response.data);
                setCreatePlanLoader(false);
                onPlanCreated(response);
                if (response.data.status === true) {
                    setSnackMsg(response.data.message);
                    setSnackMsgType(SnackbarTypes.Success);
                    handleClose(response.data.message);
                } else if (response.data.status === false) {
                    setSnackMsg(response.data.message);
                    setSnackMsgType(SnackbarTypes.Error);
                }
            }

        } catch (error) {
            console.error("Error occured is", error);
            setCreatePlanLoader(false)
        }
    }

    const styles = {
        labels: {
            fontSize: "15px",
            fontWeight: "500",
            color: "#00000050",
        },
        inputs: {
            fontSize: "15px",
            fontWeight: "500",
            color: "#000000",
        }
    }

    return (
        <Modal
            open={open}
            onClose={() => { handleClose("") }}
        >
            {/*<Box className="bg-white rounded-xl p-6 max-w-md w-[95%] mx-auto mt-20 shadow-lg">*/}
            <Box
                className="bg-white rounded-xl p-6 max-w-md w-[95%] h-[90vh] border-none shadow-lg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            >
                <AgentSelectSnackMessage
                    isVisible={snackMsg !== null}
                    message={snackMsg}
                    hide={() => { setSnackMsg(null) }}
                    type={snackMsgType}
                />

                <div className='overflow-y-auto h-[90%] scrollbar-hide'
                    style={{
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none',
                    }}>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-semibold">New Plan</h2>
                        <button onClick={() => { handleClose("") }} className="text-gray-400 hover:text-black">✕</button>
                    </div>

                    {/* Plan Name */}
                    <label style={styles.labels}>Plan Name</label>
                    <input
                        style={styles.inputs}
                        className="w-full border border-gray-200 rounded p-2 mb-4 mt-1 outline-none focus:outline-none focus:ring-0 focus:border-gray-200"
                        placeholder="Type here"
                        value={title}
                        onChange={(e) => { setTitle(e.target.value) }}
                    />

                    {/* Tag Option */}
                    <label style={styles.labels}>Tag Option</label>
                    <input
                        style={styles.inputs}
                        className="w-full border border-gray-200 outline-none focus:outline-none focus:ring-0 focus:border-gray-200 rounded p-2 mb-4 mt-1" placeholder="Popular, best deals"
                        value={tag}
                        onChange={(e) => { setTag(e.target.value) }}
                    />

                    {/* Description */}
                    <label style={styles.labels}>Description</label>
                    <input
                        style={styles.inputs}
                        className="w-full border border-gray-200 outline-none focus:outline-none focus:ring-0 focus:border-gray-200 rounded p-2 mb-4 mt-1" placeholder="Type here"
                        value={planDescription}
                        onChange={(e) => { setPlanDescription(e.target.value) }}
                    />

                    {/* Price */}
                    <label style={styles.labels}>Price</label>
                    <div className='border border-gray-200 rounded px-2 py-0 mb-4 mt-1 flex flex-row items-center w-full'>
                        <div className='' style={styles.inputs}>
                            $
                        </div>
                        <input
                            style={styles.inputs}
                            type="number"
                            className="w-full border-none outline-none focus:outline-none focus:ring-0 focus:border-none" placeholder="00"
                            value={originalPrice}
                            onChange={(e) => { setOriginalPrice(e.target.value) }}
                        />
                    </div>

                    {
                        minCostErr && (
                            <div className="flex flex-row items-center gap-2 mb-4">
                                <Image src={"/agencyIcons/InfoIcon.jpg"} alt="info" height={20} width={20} />
                                <p className="flex items-center gap-1" style={{ fontSize: "15px", fontWeight: "500" }}>
                                    {/*<AiOutlineInfoCircle className="text-sm" />*/}
                                    Min cost per min is 20 cents
                                </p>
                            </div>
                        )
                    }

                    {/* Strikethrough Price */}
                    <label style={styles.labels}>Strikethrough Price (Optional)</label>
                    <div className='border border-gray-200 rounded px-2 py-0 mb-4 mt-1 flex flex-row items-center w-full'>
                        <div className='' style={styles.inputs}>
                            $
                        </div>
                        <input
                            style={styles.inputs}
                            type="number"
                            className={`w-full border-none outline-none focus:outline-none focus:ring-0 focus:border-none ${discountedPrice && "line-through"}`}
                            placeholder="00"
                            value={discountedPrice}
                            onChange={(e) => { setDiscountedPrice(e.target.value) }}
                        />
                    </div>

                    {/* Minutes */}
                    <label style={styles.labels}>Minutes</label>
                    <div className='border border-gray-200 rounded px-2 py-0 mb-4 mt-1 flex flex-row items-center w-full'>
                        <div className='' style={styles.inputs}>
                            $
                        </div>
                        <input
                            style={styles.inputs}
                            type="number"
                            className="w-full border-none outline-none focus:outline-none focus:ring-0 focus:border-none" placeholder="000"
                            value={minutes}
                            onChange={(e) => {
                                setMinutes(e.target.value);
                            }}
                        />
                    </div>

                    {/* Allow Trial */}
                    {
                        canAddPlan && (
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-sm font-medium">Allow Trial</label>
                                <Switch checked={allowTrial} onChange={(e) => setAllowTrial(e.target.checked)} />
                            </div>
                        )
                    }

                    {allowTrial && (
                        <>
                            <div className="bg-purple10 text-purple p-2 mb-2" style={{ fontWeight: "500", fontSize: "15px" }}>
                                <p>You already have a trial plan</p>
                            </div>
                            <label style={styles.labels}>Duration of Trial</label>

                            <div className='flex flex-row items-center border rounded-md px-2 mt-1'>
                                <input
                                    type="number"
                                    className="w-[90%] rounded p-2 border-none outline-none focus:outline-none focus:ring-0"
                                    value={trialValidForDays}
                                    onChange={(e) => { setTrialValidForDays(e.target.value) }}
                                />
                                <div>
                                    Days
                                </div>
                            </div>

                        </>
                    )}
                </div>

                {/* Action Buttons */}
                <div
                    className="flex justify-between mt-6"
                >
                    <button onClick={() => { handleClose("") }} className="text-purple-600 font-semibold">
                        Cancel
                    </button>
                    {
                        createPlanLoader ?
                            <CircularProgress size={30} /> :
                            <button
                                className="bg-purple w-[12vw] hover:bg-purple-700 text-white font-semibold py-2 px-4 rounded-lg"
                                onClick={handleCreatePlan}
                            >
                                Create Plan
                            </button>
                    }
                </div>
            </Box>
        </Modal>
    );
}
