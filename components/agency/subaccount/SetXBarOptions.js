import { Modal, Box, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { Check } from "@phosphor-icons/react"; // Optional: replace with your own icon
import { getXBarOptions } from "./GetPlansList";
import { AuthToken } from "../plan/AuthDetails";
import Apis from "@/components/apis/Apis";
import axios from "axios";
import UserType from "@/components/onboarding/UserType";



export default function SetXBarOptions({
    isOpen, onClose, userEmail, userPhoneNumber,
    teamMembers, subAccountName, selectedMonthlyPlans,
    selectedUserType, closeAll
}) {

    const [xBarPlans, setXBarPlans] = useState([]);
    const [selectedXBarPlans, setSelectedXBarPlans] = useState([]);
    const [subAccountLoader, setSubAccountLoader] = useState(false);

    //getting the plans list
    useEffect(() => {
        getPlansList();
    }, []);


    //function to get plans list
    const getPlansList = async () => {
        try {
            const plans = await getXBarOptions();
            console.log("Plans list recieved is", plans);
            setXBarPlans(plans);
        } catch (error) {
            console.error("Error occured in getting plans on  sub act is", error);
        }
    }

    //select the plan
    const toggleSelection = (index) => {
        setSelectedXBarPlans((prev) =>
            prev.includes(index)
                ? prev.filter((i) => i !== index)
                : [...prev, index]
        );
    };

    //code to create sub acoount
    const handleCreateSubAccount = async (close) => {
        try {
            setSubAccountLoader(true);

            const Token = AuthToken();
            const ApiPath = Apis.CreateAgencySubAccount; //add path

            const ApiData = {
                name: subAccountName,
                phone: userPhoneNumber,
                email: userEmail,
                userType: selectedUserType,
                teams: teamMembers.map((item, index) => ({
                    name: `${item.name}`,
                    phone: `+${item.phone}`,
                    email: item.email
                })),
                monthlyPlans: selectedMonthlyPlans,
                xbarPlans: selectedXBarPlans

            }

            console.log("Api data is", ApiData);
            // return
            const response = await axios.post(ApiPath, ApiData, {
                headers: {
                    "Authorization": "Bearer " + Token,
                    "Content-Type": "application/json"
                }
            });

            if (response) {
                console.log("responese of create sub account api is", response.data);
                if (response.data.status === true) {
                    close();
                }
            }

        } catch (error) {
            console.error("Error occured in create sub account api is", error);
            setSubAccountLoader(false);
        } finally {
            console.log("Sub account created");
            setSubAccountLoader(false);
        }
    }

    return (
        <Modal open={isOpen} onClose={onClose}>
            <Box
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-xl shadow-xl p-6"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Select XBar Options</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                </div>

                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1 scrollbar-hide"
                    sx={{
                        '&::-webkit-scrollbar': { display: 'none' },
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none'
                    }}>
                    {xBarPlans.map((plan, index) => (
                        <div
                            key={index}
                            className="flex justify-between items-center border rounded-lg p-4 hover:shadow transition"
                            onClick={() => toggleSelection(plan.id)}
                        >
                            <div>
                                <h3 className="font-semibold text-gray-900">
                                    {plan.title} | {plan.minutes || "X"}mins
                                </h3>
                                <p className="text-sm text-gray-500">{plan.planDescription}</p>
                                <p className="mt-1 font-medium text-lg text-gray-800">
                                    ${plan.discountedPrice}/<span className="text-sm text-gray-400">Mo*</span>
                                </p>
                            </div>

                            <div className="w-6 h-6 border-2 rounded-sm flex items-center justify-center transition-all duration-150 ease-in-out"
                                style={{
                                    borderColor: selectedXBarPlans.includes(plan.id) ? "#7e22ce" : "#ccc",
                                    backgroundColor: selectedXBarPlans.includes(plan.id) ? "#7e22ce" : "transparent",
                                }}
                            >
                                {selectedXBarPlans.includes(plan.id) && (
                                    <Check size={16} color="#fff" />
                                )}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="flex justify-between mt-6">
                    <button
                        onClick={onClose}
                        className="text-purple-700 font-medium w-2/6"
                    >
                        Back
                    </button>
                    {
                        subAccountLoader ?
                            <CircularProgress size={30} /> :
                            <button
                                onClick={() => { console.log("close all"); handleCreateSubAccount(closeAll); }}
                                className="bg-purple text-white px-8 py-2 rounded-lg w-1/2"
                            >
                                Continue
                            </button>
                    }
                </div>
            </Box>
        </Modal>
    );
}
