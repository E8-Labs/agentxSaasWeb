import { Modal, Box } from "@mui/material";
import { useState } from "react";
import { Check } from "@phosphor-icons/react"; // Optional: replace with your own icon

const plans = [
    { name: "Plan name", minutes: "Xmins", price: "$amount", description: "Plan description goes here" },
    { name: "Plan name", minutes: "Xmins", price: "$amount", description: "Plan description goes here" },
    { name: "Plan name", minutes: "Xmins", price: "$amount", description: "Plan description goes here" },
    { name: "Plan name", minutes: "Xmins", price: "$amount", description: "Plan description goes here" },
];

export default function XBarOptions({ isOpen, onClose }) {

    const [selectedPlans, setSelectedPlans] = useState([]);//0, 1, 3

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
                    <h2 className="text-xl font-semibold text-gray-900">Select XBar Options</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl">&times;</button>
                </div>

                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-1 scrollbar-hide"
                    sx={{
                        '&::-webkit-scrollbar': { display: 'none' },
                        scrollbarWidth: 'none',
                        msOverflowStyle: 'none'
                    }}>
                    {plans.map((plan, index) => (
                        <div
                            key={index}
                            className="flex justify-between items-center border rounded-lg p-4 hover:shadow transition"
                            onClick={() => toggleSelection(index)}
                        >
                            <div>
                                <h3 className="font-semibold text-gray-900">
                                    {plan.name} | {plan.minutes}mins
                                </h3>
                                <p className="text-sm text-gray-500">{plan.description}</p>
                                <p className="mt-1 font-medium text-lg text-gray-800">
                                    ${plan.price}/<span className="text-sm text-gray-400">Mo*</span>
                                </p>
                            </div>

                            <div className="w-6 h-6 border-2 rounded-sm flex items-center justify-center transition-all duration-150 ease-in-out"
                                style={{
                                    borderColor: selectedPlans.includes(index) ? "#7e22ce" : "#ccc",
                                    backgroundColor: selectedPlans.includes(index) ? "#7e22ce" : "transparent",
                                }}
                            >
                                {selectedPlans.includes(index) && (
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
                        onClick={() => console.log(`Selected Plans: ${selectedPlans.join(', ')}`)}
                        className="bg-purple text-white px-8 py-2 rounded-lg w-1/2"
                    >
                        Continue
                    </button>
                </div>
            </Box>
        </Modal>
    );
}
