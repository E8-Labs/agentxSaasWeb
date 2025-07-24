import React, { useEffect, useState } from 'react';
import { Modal, Box, TextareaAutosize, CircularProgress } from '@mui/material';
import Image from 'next/image';
import { AuthToken } from '@/components/agency/plan/AuthDetails';
import Apis from '@/components/apis/Apis';
import axios from 'axios';
import { PersistanceKeys } from '@/constants/Constants';
import { GreetingTagInput } from '../tagInputs/GreetingTagInput';

const EditModal = ({
    isOpen,
    onClose,
    handleUpdateArray,
    selectedItem,
    editName,
    kycsData,
    uniqueColumns,
    scrollOffset,
}) => {

    const [updateTitle, setUpdatedTitle] = useState("");
    const [updatedDescription, setUpdatedDescription] = useState("");
    //loader
    const [updateLoader, setUpdateLoader] = useState(false);

    useEffect(() => {
        if (selectedItem) {
            setUpdatedTitle(selectedItem.title);
            setUpdatedDescription(selectedItem.description);
        }
    }, []);

    const handleUpdate = async () => {
        try {
            setUpdateLoader(true);
            const Token = AuthToken();
            const ApiPath = Apis.UpdateAdvanceSetting;
            const ApiData = {
                title: updateTitle,
                description: updatedDescription,
                id: selectedItem.id
            }

            console.log("Api data is", ApiData);

            const response = await axios.post(ApiPath, ApiData, {
                headers: {
                    Authorization: "Bearer " + Token,
                    "Content-Type": "application/json"
                }
            });

            if (response) {
                setUpdateLoader(false);
                console.log("Response of api is", response);
                if (response.data.status === true) {
                    if (editName === "Guardrails") {
                        const G = localStorage.getItem(PersistanceKeys.GuadrailsList);

                        if (G) {
                            const P = JSON.parse(G);
                            // console.log("List of guadrails", P);

                            // Map over array and update matching item
                            const updatedP = P.map(item => {
                                if (item.id === selectedItem.id) {
                                    // Update title and description
                                    return {
                                        ...item,
                                        title: updateTitle,
                                        description: updatedDescription
                                    };
                                } else {
                                    // No change for other items
                                    return item;
                                }
                            });

                            // Save updated array back to localStorage
                            localStorage.setItem(PersistanceKeys.GuadrailsList, JSON.stringify(updatedP));

                        }
                    } else if (editName === "Objection") {
                        const O = localStorage.getItem(PersistanceKeys.ObjectionsList);
                        if (O) {
                            const P = JSON.parse(O);
                            // console.log("List of Objections", P);

                            const updatedP = P.map(item => {
                                if (item.id === selectedItem.id) {
                                    // Update title and description
                                    return {
                                        ...item,
                                        title: updateTitle,
                                        description: updatedDescription
                                    };
                                } else {
                                    // Keep other items unchanged
                                    return item;
                                }
                            });

                            // Save updated array back to localStorage
                            localStorage.setItem(PersistanceKeys.ObjectionsList, JSON.stringify(updatedP));
                        }
                    }
                } else if (response.data.status === false) {
                    console.log("Status false");
                }
                handleUpdateArray(response.data);
            }

        } catch (error) {
            setUpdateLoader(false);
            console.error("Error occured in update advancesetting api is", error);
        }
    }

    const styles = {
        heading: {
            fontWeight: "600",
            fontSize: 17
        },
        inputStyle: {
            fontWeight: "500",
            fontSize: 15
        }
    }

    return (
        <Modal open={isOpen} onClose={onClose}>
            <Box className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-6 shadow-lg w-full max-w-md outline-none">

                <div className='w-full flex flex-row items-center justify-between'>
                    <div className="text-start text-lg font-semibold">
                        {`Edit ${editName}`}
                    </div>
                    <button className='border-none outline-none' onClick={onClose}>
                        <Image
                            alt='*'
                            src={"/assets/cross.png"}
                            height={15}
                            width={15}
                        />
                    </button>
                </div>

                <div>
                    <div className='mt-4 mb-2' style={styles.heading}>
                        Title
                    </div>
                    <input
                        style={styles.inputStyle}
                        className='w-full rounded-lg border outline-none focus:ring-0 p-2'
                        placeholder={`Edit ${editName} title`}
                        value={updateTitle}
                        onChange={(e) => {
                            setUpdatedTitle(e.target.value);
                        }}
                    />
                </div>

                <div>
                    <div className='mt-4 mb-2' style={styles.heading}>
                        Description
                    </div>
                    <GreetingTagInput
                        greetTag={updatedDescription}
                        kycsList={kycsData}
                        uniqueColumns={uniqueColumns}
                        tagValue={(text) => {
                            setUpdatedDescription(text);
                        }}
                        scrollOffset={scrollOffset}
                    />

                    {/*
                        <TextareaAutosize
                            maxRows={5}
                            className="outline-none focus:outline-none focus:ring-0 p-2 w-full"
                            style={styles.inputStyle}
                            placeholder={`Edit ${editName} description`}
                            value={updatedDescription}
                            onChange={(e) => {
                                setUpdatedDescription(e.target.value);
                            }}
                        />
                    */}

                </div>

                <div className='w-full flex flex-row items-center justify-between mt-4 gap-2'>
                    <button
                        className="px-4 py-2 bg-transparent w-1/2 outline-none text-purple rounded hover:bg-purple10"
                        onClick={onClose}
                    >
                        Close
                    </button>
                    {
                        updateLoader ? (
                            <div className='w-1/2 flex flex-row items-center justify-center'>
                                <CircularProgress size={20} sx={{ color: "#7902DF" }} />
                            </div>
                        ) : (
                            <button
                                className="px-4 py-2 bg-purple w-1/2 outline-none text-white rounded"
                                onClick={() => {
                                    handleUpdate(
                                        {
                                            title: updateTitle,
                                            description: updatedDescription
                                        }
                                        // {
                                        //     updatedData: {
                                        //         title: updateTitle,
                                        //         description: updatedDescription
                                        //     }
                                        // }
                                    )
                                }}
                            >
                                Update
                            </button>
                        )
                    }

                </div>
            </Box>
        </Modal >
    );
};

export default EditModal;
