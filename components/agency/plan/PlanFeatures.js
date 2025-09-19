import { useState } from "react";
import { Switch, Tooltip } from "@mui/material";
import Image from "next/image";

export default function PlanFeatures({
    customFeatures,
    handleChangeCustomFeature,
    handleRemoveCustomFeature,
    features,
    setFeatures,
    featuresList,
    trialValidForDays,
    setTrialValidForDays,
    agencyAllowedFeatures,
    upgradePlanClickModal
}) {

    const handleToggle = (key) => {
        setFeatures((prev) => ({ ...prev, [key]: !prev[key] }));
    };






    return (
        <div className="w-full" style={{ borderTop: "2px solid #15151510", }}>
            <div className="pt-2" styles={{ fontSize: "15px", fontWeight: "700" }}>Features</div>
            <div className="flex flex-col gap-1 w-full mt-6">
                {featuresList.map((item) => (
                    <div
                        key={item.stateKey}
                        className="flex flex-row items-center justify-between w-full"
                    >
                        <div className="flex flex-row items-center gap-2">
                            <div styles={{ fontSize: "10px", fontWeight: "900" }}>{item.label}</div>
                            {
                                item.tooltip && (
                                    <Tooltip
                                        title={item.tooltip}
                                        arrow
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
                                        <Image
                                            src="/otherAssets/infoLightDark.png"
                                            alt="info"
                                            width={14}
                                            height={14}
                                            className="cursor-pointer rounded-full"
                                        />
                                    </Tooltip>
                                )
                            }
                            {
                                !agencyAllowedFeatures[item.stateKey] && (
                                    <button
                                        className="text-sm text-white bg-purple rounded-lg px-2 py-1"
                                        onClick={() => {
                                            upgradePlanClickModal()
                                        }}
                                    >
                                        Upgrade
                                    </button>
                                )
                            }
                        </div>

                        <Switch
                            checked={features[item.stateKey]}
                            onChange={() => handleToggle(item.stateKey)}
                            sx={{
                                "& .MuiSwitch-switchBase.Mui-checked": {
                                    color: "white",
                                },
                                "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                                    backgroundColor: "#7902DF",
                                },
                            }}
                            disabled={!agencyAllowedFeatures[item.stateKey]}
                        />
                    </div>
                ))}
            </div>
            {
                features?.allowTrial && (
                    <div className="w-full">
                        <div className="mt-2" styles={styles.regular}>Duration of Trial</div>
                        <div className="w-full">
                            <input
                                style={styles.inputs}
                                className="w-full border border-gray-200 rounded p-2 mb-4 mt-1 outline-none focus:outline-none focus:ring-0 focus:border-gray-200"
                                placeholder="Number of trial days"
                                value={trialValidForDays}
                                onChange={(e) => {
                                    setTrialValidForDays(e.target.value);
                                }}
                            />
                        </div>
                    </div>
                )
            }
            <div className="w-ful pb-2l">
                <div className="flex flex-col gap-2">
                    {customFeatures.map((feature, index) => (
                        <div
                            key={index}
                            className="w-full border border-gray-200 rounded p-2 outline-none flex flex-row items-center">
                            <input
                                value={feature}
                                onChange={(e) =>
                                    handleChangeCustomFeature(index, e.target.value)
                                }
                                placeholder={`Custom Feature ${index + 1}`}
                                className="w-[95%] border-none outline-none focus:outline-none focus:ring-0 focus:border-none"
                            />
                            <button
                                className="border-none outline-none felx flex-row justify-end pe-2"
                                onClick={() => { handleRemoveCustomFeature(index) }}
                            >
                                <Image src="/assets/cross.png" alt="close" width={10} height={10} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

const styles = {
    regular: {
        fontSize: "15px", fontWeight: "500"
    },
    inputs: {
        fontSize: "15px",
        fontWeight: "500",
        color: "#000000",
    },
}