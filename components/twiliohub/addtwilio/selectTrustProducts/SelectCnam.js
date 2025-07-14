import { AddSelectedProduct } from '@/apiservicescomponent/twilioapis/AddSelectedProduct';
import { CircularProgress } from '@mui/material';
import Image from 'next/image';
import React, { useEffect, useState } from 'react'

const SelectCnam = ({
    trustProducts,
    handleContinue,
    profileLoader
}) => {

    const [selectedProduct, setSelectedProduct] = useState("");
    const [isDisabled, setIsDisabled] = useState(true);
    const [addProductLoader, setAddProductLoader] = useState(false);

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

    const handleAddProduct = async () => {
        try {
            setAddProductLoader(true);
            const response = await AddSelectedProduct(selectedProduct);
            setAddProductLoader(false);
            if (response.status === true) {
                handleContinue(response);
            }
        } catch (error) {
            setAddProductLoader(false);

        }
    }

    return (
        <div className='h-[100%] w-full'>
            <div className='w-full h-[80%]'>
                <div style={{ fontWeight: "600", fontSize: 22 }}>
                    Select CNAM
                </div>
                <div className='mt-4 h-[90%] overflow-auto'>
                    {
                        trustProducts.cnam.all.map((item) => {
                            return (
                                <div
                                    key={item.id}
                                    className='mb-4'>
                                    <button
                                        className='flex flex-row items-center gap-2'
                                        onClick={() => { handleToggleSelectProduct(item) }}
                                    >
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
                                        <div style={{ fontWeight: "500", fontSize: 15 }}>
                                            {item.friendlyName}
                                        </div>
                                    </button>
                                </div>
                            )
                        })
                    }
                </div>
            </div>
            <div className='h-[20%] w-full flex flex-row items-center justify-center'>
                {
                    (addProductLoader || profileLoader) ? (
                        <CircularProgress size={25} />
                    ) : (
                        <button
                            className={`h-[50px] ${isDisabled ? "bg-btngray text-black" : "bg-purple text-white"} rounded-lg w-full`}
                            disabled={isDisabled || addProductLoader || profileLoader}
                            onClick={handleAddProduct}
                        >
                            Continue
                        </button>
                    )
                }
            </div>
        </div>
    )
}

export default SelectCnam
