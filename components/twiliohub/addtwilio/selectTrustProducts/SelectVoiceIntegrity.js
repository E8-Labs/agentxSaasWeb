import { AddSelectedProduct } from '@/apiservicescomponent/twilioapis/AddSelectedProduct';
import { CircularProgress } from '@mui/material';
import Image from 'next/image';
import React, { useEffect, useState } from 'react'

const SelectVoiceIntegrity = ({
    trustProducts,
    handleContinue,
    profileLoader
}) => {

    const [selectedProduct, setSelectedProduct] = useState("");
    const [isDisabled, setIsDisabled] = useState(true);
    const [addProductLoader, setAddProductLoader] = useState(false);
    const [isExitLoader, setIsExitLoader] = useState(false);

    useEffect(() => {
        if (!selectedProduct) {
            setIsDisabled(true);
        } else {
            setIsDisabled(false);
        }
    }, [selectedProduct])

    const handleToggleSelectProduct = (item) => {
        if (selectedProduct === item.id) {
            setSelectedProduct("");
        } else {
            setSelectedProduct(item.id);
        }
    }

    const handleAddProduct = async (isExit) => {
        try {
            if (isExit) {
                setIsExitLoader(true);
            } else {
                setAddProductLoader(true);
            }
            const response = await AddSelectedProduct(selectedProduct);
            setAddProductLoader(false);
            if (response.status === true) {
                handleContinue(response);
            }
        } catch (error) {
            setAddProductLoader(false);
            setIsExitLoader(false);

        }
    }

    return (
        <div className='h-[100%] w-full flex flex-col items-center justify-between'>
            <div className='w-10/12 h-[80%]'>
                <div style={{ fontWeight: "600", fontSize: 22 }}>
                    Select Voice Integrity
                </div>
                <div className='mt-4 h-[90%] overflow-auto'>
                    {
                        trustProducts.voiceIntegrity.all.map((item) => {
                            return (
                                <div
                                    key={item.id}
                                    className='flex flex-row items-center gap-2 mb-4'>
                                    <button onClick={() => { handleToggleSelectProduct(item) }}>
                                        {selectedProduct === item.id ? (
                                            <div
                                                className="bg-purple flex flex-row items-center justify-center rounded"
                                                style={{ height: "24px", width: "24px" }}
                                            >
                                                <Image
                                                    src={"/assets/whiteTick.png"}
                                                    height={8}
                                                    width={10}
                                                    alt="*"
                                                />
                                            </div>
                                        ) : (
                                            <div
                                                className="bg-none border-2 flex flex-row items-center justify-center rounded"
                                                style={{ height: "24px", width: "24px" }}
                                            ></div>
                                        )}
                                    </button>
                                    <div style={{ fontWeight: "500", fontSize: 15 }}>
                                        {item.friendlyName}
                                    </div>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
            <div className='h-[20%] w-full flex flex-row items-center justify-between'>
                <button
                    className='text-violet-blue w-[165px] bg-transparent h-[50px] rounded-lg outline-none border-none'
                    style={{ fontWeight: "500", fontSize: 15 }}
                    disabled={addProductLoader || profileLoader || isDisabled || isExitLoader}
                    onClick={() => { handleAddProduct(true) }}
                >
                    {
                        (isExitLoader || profileLoader) ? (
                            <CircularProgress size={25} />
                        ) : (
                            "Save&Exit"
                        )
                    }
                </button>
                {
                    (addProductLoader || profileLoader) ? (
                        <CircularProgress size={25} />
                    ) : (
                        <button
                            className={`h-[50px] ${isDisabled ? "bg-btngray text-black" : "bg-violet-blue text-white"} rounded-lg w-[176px]`}
                            disabled={isDisabled || addProductLoader || profileLoader}
                            onClick={() => { handleAddProduct(false) }}
                        >
                            Continue
                        </button>
                    )
                }
            </div>
        </div>
    )
}

export default SelectVoiceIntegrity
