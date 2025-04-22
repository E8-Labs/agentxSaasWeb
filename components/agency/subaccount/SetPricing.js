import { Modal, Box } from "@mui/material";
import { useEffect, useState } from "react";
import { Check } from "@phosphor-icons/react"; // Optional: replace with your own icon
import SetXBarOptions from "./SetXBarOptions";
import { getMonthlyPlan } from "./GetPlansList";



export default function SetPricing({
    isOpen, onClose, userEmail, userPhoneNumber,
    teamMembers, subAccountName, selectedUserType, closeAll
}) {
    
    const [monthlyPlans, setMonthlyPlans] = useState([]);
    const [selectedPlans, setSelectedPlans] = useState([]);

    //code for XBar MOdal
    const [openPricing, setOpenPricing] = useState(false);

    //printing data recieved
    useEffect(() => {
        console.log("Email is", userEmail);
        console.log("Team members data", teamMembers);
        const teams = teamMembers.map((item, index) => ({
            name: `${item.name}`,
            phone: `+${item.phone}`,
            email: item.email
        }));

        console.log("New array is", teams);

    }, [userEmail]);

    //getting the plans list
    useEffect(() => {
        getPlansList();
    }, []);

    //function to get plans list
    const getPlansList = async () => {
        try {
            const plans = await getMonthlyPlan();
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

    return (
        <Modal open={isOpen} onClose={onClose}>
            <Box
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-white rounded-xl shadow-xl p-6"
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-900">Set Pricing Plans</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
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
                                    borderColor: selectedPlans.includes(plan.id) ? "#7e22ce" : "#ccc",
                                    backgroundColor: selectedPlans.includes(plan.id) ? "#7e22ce" : "transparent",
                                }}
                            >
                                {selectedPlans.includes(plan.id) && (
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
                    <button
                        onClick={() => {
                            // console.log(`Selected Plans: ${selectedPlans.join(', ')}`);
                            console.log(`Selected Plans: `, selectedPlans);
                            setOpenPricing(true);
                        }}
                        className="bg-purple text-white px-8 py-2 rounded-lg w-1/2"
                    >
                        Continue
                    </button>
                </div>

                {/* Xbar Options Modal */}
                <SetXBarOptions
                    isOpen={openPricing}
                    onClose={() => {
                        setOpenPricing(false);
                    }}
                    selectedMonthlyPlans={selectedPlans}
                    userEmail={userEmail}
                    userPhoneNumber={userPhoneNumber}
                    teamMembers={teamMembers}
                    subAccountName={subAccountName}
                    selectedUserType={selectedUserType}
                    closeAll={() => {
                        setOpenPricing(false);
                        closeAll();
                    }}
                />

            </Box>
        </Modal>
    );
}
