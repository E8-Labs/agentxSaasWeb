import { Modal, Box, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { Check } from "@phosphor-icons/react"; // Optional: replace with your own icon
import { getXBarOptions } from "./GetPlansList";
import { AuthToken } from "../plan/AuthDetails";
import Apis from "@/components/apis/Apis";
import axios from "axios";
import UserType from "@/components/onboarding/UserType";



export default function SetXBarOptions({
    onClose, selectedMonthlyPlans, xBars, formData, closeModal, selectedUserType
}) {

    const [xBarPlans, setXBarPlans] = useState([]);
    const [selectedXBarPlans, setSelectedXBarPlans] = useState([]);
    const [subAccountLoader, setSubAccountLoader] = useState(false);

    const [loading, setLoading] = useState(false)

    //getting the plans list
    useEffect(() => {
        console.log(formData);
        console.log("Xbar plan passed is", xBars);
        setSelectedXBarPlans(xBars);
        getPlansList();
    }, []);


    //function to get plans list
    const getPlansList = async () => {
        try {
            setLoading(true)
            const plans = await getXBarOptions();
            setLoading(false)
            console.log("x bar Plans list recieved is", plans);
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
    const handleCreateSubAccount = async () => {
        try {
            setSubAccountLoader(true);

            const Token = AuthToken();
            const ApiPath = Apis.CreateAgencySubAccount; //add path

            let seatscount = null;
            if (formData.seats) {
                seatscount = Number(formData.seats);
            }


            const ApiData = {
                name: formData.subAccountName,
                phone: formData.userPhoneNumber,
                email: formData.userEmail,
                userType: selectedUserType,
                agencyAccountName: formData.fullName,
                // costPerSeat: seatscount,
                costPerSeat: isNaN(Number(seatscount)) ? 0 : Number(seatscount),
                teams: formData.teamMembers.filter(item => item.name && item.email && item.phone)   // Filter members with all fields present
                    .map(item => ({
                        name: item.name,
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
                    //update the subaccounts state on localstorage to update checklist
                    const localData = localStorage.getItem("User");
                    if (localData) {
                        let D = JSON.parse(localData);
                        D.user.checkList.checkList.subaccountAdded = true;
                        localStorage.setItem("User", JSON.stringify(D));
                    }
                    window.dispatchEvent(new CustomEvent("UpdateAgencyCheckList", { detail: { update: true } }));
                    closeModal();
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

    const handleBack = () => {
        onClose(selectedXBarPlans);
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Select XBar Options</h2>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1 scrollbar-hide"
                sx={{
                    '&::-webkit-scrollbar': { display: 'none' },
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                }}>

                {
                    loading ? (
                        <div className="w-full flex flex-row items-center justify-center">
                            <CircularProgress size={35} />
                        </div>
                    ) :

                        xBarPlans.map((plan, index) => (
                            <div
                                key={index}
                                className="flex justify-between items-center border rounded-lg p-4 hover:shadow transition"
                                onClick={() => toggleSelection(plan.id)}
                            >
                                <div className="w-[80%]">
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
                                        borderColor: selectedXBarPlans?.includes(plan.id) ? "#7e22ce" : "#ccc",
                                        backgroundColor: selectedXBarPlans?.includes(plan.id) ? "#7e22ce" : "transparent",
                                    }}
                                >
                                    {selectedXBarPlans?.includes(plan.id) && (
                                        <Check size={16} color="#fff" />
                                    )}
                                </div>
                            </div>
                        ))}
            </div>

            <div className="flex justify-between mt-6">
                <button
                    onClick={() => { handleBack() }}
                    className="text-purple-700 font-medium w-2/6 rounded-lg border"
                >
                    Back
                </button>
                {
                    subAccountLoader ?
                        <CircularProgress size={30} /> :
                        <button
                            onClick={() => { console.log("close all"); handleCreateSubAccount(); }}
                            // className="bg-purple text-white px-8 py-2 rounded-lg w-1/2"
                            className={`px-8 py-2 rounded-lg w-1/2 ${selectedXBarPlans.length === 0 ? "bg-[#00000020] text-black" : "bg-purple text-white"}`}
                        >
                            Continue
                        </button>
                }
            </div>
        </div>
    );
}
