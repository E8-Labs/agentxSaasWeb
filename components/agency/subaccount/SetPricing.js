import { Modal, Box } from "@mui/material";
import { useEffect, useState } from "react";
import { Check } from "@phosphor-icons/react"; // Optional: replace with your own icon
import SetXBarOptions from "./SetXBarOptions";
import { getMonthlyPlan } from "./GetPlansList";
import AgentSelectSnackMessage, { SnackbarTypes } from "@/components/dashboard/leads/AgentSelectSnackMessage";
import Image from "next/image";
import { formatDecimalValue } from "../agencyServices/CheckAgencyData";



export default function SetPricing({
    onClose, onContinue, monPlans, selectedAgency
}) {

    const [monthlyPlans, setMonthlyPlans] = useState([]);
    const [selectedPlans, setSelectedPlans] = useState([]);

    //code for XBar MOdal
    const [openPricing, setOpenPricing] = useState(false);

    const [showErrorSnack, setShowErrorSnack] = useState(null)


    //printing data recieved
    // useEffect(() => {
    //     console.log("Email is", userEmail);
    //     console.log("Team members data", teamMembers);
    //     const teams = teamMembers.map((item, index) => ({
    //         name: `${item.name}`,
    //         phone: `+${item.phone}`,
    //         email: item.email
    //     }));

    //     console.log("New array is", teams);

    // }, [userEmail]);

    //getting the plans list
    useEffect(() => {
        console.log("Selected plans passed are", monPlans);
        setSelectedPlans(monPlans);
        getPlansList();
    }, []);

    //function to get plans list
    const getPlansList = async () => {
        try {
            const plans = await getMonthlyPlan(selectedAgency);
            console.log("Plans list recieved is", plans);
            setMonthlyPlans(plans);
        } catch (error) {
            console.error("Error occured in getting plans on  sub act is", error);
        }
    }

    const toggleSelection = (index) => {
        setSelectedPlans((prev) =>
            prev.includes(index)
                ? prev.filter((i) => i !== index)
                : [...prev, index]
        );
    };


    const handleContinue = () => {
        if (selectedPlans.length === 0) {
            setShowErrorSnack("Select a plan")
            return
        }

        onContinue(selectedPlans);
        // setOpenPricing(true)
    }

    const handleBack = () => {
        onClose(selectedPlans);
    }

    return (
        <div>
            <AgentSelectSnackMessage
                isVisible={showErrorSnack != null ? true : false}
                hide={() => setShowErrorSnack(null)}
                type={SnackbarTypes.Error} message={showErrorSnack}

            />
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">Set Pricing Plans</h2>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1 scrollbar-hide"
                sx={{
                    '&::-webkit-scrollbar': { display: 'none' },
                    scrollbarWidth: 'none',
                    msOverflowStyle: 'none'
                }}>
                {monthlyPlans.map((plan, index) => (
                    <div
                        key={index}
                        onClick={() => toggleSelection(plan.id)}
                        className="cursor-pointer"
                    >
                        {plan.hasTrial && (
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
                                        First {plan.hasTrial == true && (`| ${plan.trialValidForDays}`)} Days Free
                                    </div>
                                </div>
                            </div>
                        )}
                        <div
                            className={`flex justify-between items-center border ${plan.hasTrial ? "rounded-b-lg" : "rounded-lg"} p-4 hover:shadow transition`}
                        >
                            <div className="w-[80%]">
                                <h3 className="font-semibold text-gray-900">
                                    {plan.title} | {plan.minutes || "X"}mins{" "}
                                </h3>
                                <p className="text-sm text-gray-500">{plan.planDescription}</p>
                                <p className="mt-1 font-medium text-lg text-gray-800">
                                    <span className="line-through text-[#00000090]">${formatDecimalValue(plan.originalPrice)}</span> ${plan.discountedPrice?.toFixed(2)}/<span className="text-sm text-gray-400">Mo*</span>
                                </p>
                            </div>

                            <div className="w-6 h-6 border-2 rounded-sm flex items-center justify-center transition-all duration-150 ease-in-out"
                                style={{
                                    borderColor: selectedPlans.includes(plan.id) ? "#7e22ce" : "#ccc",
                                    backgroundColor: selectedPlans.includes(plan.id) ? "#7e22ce" : "transparent",
                                }}
                            >
                                {selectedPlans.includes(plan.id) && (
                                    <Check size={16} color="#fff" />
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="flex justify-between mt-6">
                <button
                    onClick={() => { handleBack() }}
                    className="text-purple-700 font-medium w-2/6 border rounded-lg"
                >
                    Back
                </button>
                <button
                    onClick={() => {
                        handleContinue()
                    }}
                    className={`px-8 py-2 rounded-lg w-1/2 ${selectedPlans.length === 0 ? "bg-[#00000020] text-black" : "bg-purple text-white"}`}
                >
                    Continue
                </button>
            </div>

        </div>
    );
}
