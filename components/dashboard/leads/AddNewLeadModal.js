import { styles } from '@/components/globalsstyles/Stles';
import { Box, Modal } from '@mui/material';
import Image from 'next/image';
import React from 'react'

const AddNewLeadModal = ({
    addNewLeadModal,
    setAddNewLeadModal,
    setShowAddLeadModal,
    setShowAddNewSheetModal,
    
}) => {
    return (
        <Modal
            open={addNewLeadModal}
            onClose={() => setAddNewLeadModal(false)}
            closeAfterTransition
            BackdropProps={{
                timeout: 1000,
                sx: {
                    backgroundColor: "#00000020",
                    // //backdropFilter: "blur(20px)",
                },
            }}
        >
            <Box className="md:w-[627px] w-8/12" sx={styles.modalsStyle}>
                <div className="flex flex-row justify-center w-full">
                    <div
                        className="sm:w-full w-full"
                        style={{
                            backgroundColor: "#ffffff",
                            padding: 20,
                            borderRadius: "13px",
                            height: "579px",
                        }}
                    >
                        <div className="flex flex-row justify-between">
                            <div
                                style={{
                                    fontWeight: "500",
                                    fontSize: 15,
                                }}
                            >
                                New List
                            </div>
                            <button
                                onClick={() => {
                                    setAddNewLeadModal(false);
                                }}
                            >
                                <Image
                                    src={"/assets/crossIcon.png"}
                                    height={40}
                                    width={40}
                                    alt="*"
                                />
                            </button>
                        </div>

                        <div className="flex flex-row items-center w-full justify-center mt-12">
                            <Image
                                src={"/assets/placeholder.png"}
                                height={140}
                                width={490}
                                alt="*"
                            />
                        </div>

                        <div
                            className="text-center sm:font-24 font-16 mt-12"
                            style={{ fontWeight: "600", fontSize: 29 }}
                        >
                            How do you want to add leads?
                        </div>

                        <div className="w-full flex flex-row gap-6 justify-center mt-10 gap-4">
                            <div className="">
                                <button
                                    className="flex flex-row gap-2 bg-purple text-white h-[50px] w-[177px] rounded-lg items-center justify-center"
                                    onClick={() => {
                                        setShowAddLeadModal(true);
                                    }}
                                >
                                    <Image
                                        src={"/assets/addManIcon.png"}
                                        height={20}
                                        width={20}
                                        alt="*"
                                    />
                                    <span style={styles.headingStyle}>Upload Leads</span>
                                </button>
                            </div>
                            <div className="">
                                <button
                                    className="flex flex-row gap-2 bg-purple text-white h-[50px] w-[219px] rounded-lg items-center justify-center"
                                    onClick={() => {
                                        setShowAddNewSheetModal(true);
                                    }}
                                >
                                    <Image
                                        src={"/assets/smartlistIcn.svg"}
                                        height={24}
                                        width={24}
                                        alt="*"
                                    />
                                    <span style={styles.headingStyle}>Create Smartlist</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </Box>
        </Modal>
    )
}

export default AddNewLeadModal
