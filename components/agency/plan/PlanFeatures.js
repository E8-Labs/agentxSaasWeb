import { useRef, useState } from "react";
import { Switch, Tooltip } from "@mui/material";
import Image from "next/image";
import CloseBtn from "@/components/globalExtras/CloseBtn";

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
    upgradePlanClickModal,
    noOfSeats,
    setNoOfSeats,
    costPerAdditionalSeat,
    setCostPerAdditionalSeat,
    handleToggle
}) {

    // const handleToggle = (key) => {
    //     setFeatures((prev) => ({ ...prev, [key]: !prev[key] }));
    // };






    return (
        <div
            className="w-full"
            style={{ borderTop: "2px solid #15151510", }}
        >
            <div className="pt-2" styles={{ fontSize: "15px", fontWeight: "700" }}>Features</div>
            <div className="flex flex-col gap-1 w-full mt-6">
                {featuresList.map((item) => (
                    <div
                        key={item.stateKey}
                    >
                        <div
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
                                            className="text-xs text-white bg-purple rounded-full px-2 py-[3px]"
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
                        {item.stateKey === "allowTeamSeats" && features.allowTeamSeats && (
                            <div className="flex flex-row gap-2 mt-2">
                                {/* Number of Seats */}
                                <div className="w-1/2">
                                    <label style={styles.regular}>Number of Seats</label>
                                    <input
                                        style={styles.inputs}
                                        className="w-full border border-gray-200 rounded p-2 mt-1 outline-none focus:outline-none focus:ring-0"
                                        placeholder="0"
                                        value={noOfSeats}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/[^0-9]/g, "");
                                            setNoOfSeats(value ? Number(value) : 0);
                                        }}
                                    />
                                </div>

                                {/* Price Additional Seats */}
                                <div className="w-1/2">
                                    <div className="flex flex-row items-center gap-2">
                                        <label style={styles.regular}>Price Additional Seats</label>
                                        <Tooltip
                                            title={"Sell additional seats at an extra price per month."}
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
                                    </div>
                                    <div className="border border-gray-200 rounded px-2 py-0 mt-1 flex flex-row items-center w-full">
                                        <div style={styles.inputs}>$</div>
                                        <input
                                            style={styles.inputs}
                                            type="text"
                                            className="w-full border-none outline-none focus:outline-none focus:ring-0"
                                            placeholder=""
                                            value={costPerAdditionalSeat}
                                            onChange={(e) => {
                                                const value = e.target.value.replace(/[^0-9.]/g, "");
                                                setCostPerAdditionalSeat(value);
                                            }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
            {
                features?.allowTrial && (
                    <div className="w-full">
                        <div className="mt-2" styles={{
                            fontSize: "15px", fontWeight: "500",
                        }}>Duration of Trial</div>
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
                            className="w-full">
                            <div className="border border-gray-200 rounded-lg pe-2 py-0 mt-1 flex flex-row items-center w-full">
                                <input
                                    style={styles.inputs}
                                    type="text"
                                    className={`w-full border-none rounded-lg outline-none focus:outline-none focus:ring-0 focus:border-none`}
                                    value={feature}
                                    onChange={(e) =>
                                        handleChangeCustomFeature(index, e.target.value)
                                    }
                                    placeholder={`Custom Feature ${index + 1}`}
                                />
                                <div className="" style={styles.inputs}>
                                    <button
                                        className='cursor-pointer px-2 py-2 rounded-full bg-[#00000010]'
                                        onClick={() => { handleRemoveCustomFeature(index) }}
                                    >
                                        <Image
                                            alt="close"
                                            src="/assets/cross.png"
                                            width={10} height={10}
                                        // style={{ filter: showWhiteCross ? "invert(1)" : "invert(0)" }}
                                        />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

const styles = {
    regular: {
        fontSize: "15px", fontWeight: "500", color: "#00000050"
    },
    inputs: {
        fontSize: "15px",
        fontWeight: "500",
        color: "#000000",
    },
}