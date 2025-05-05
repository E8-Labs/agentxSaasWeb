import { Box, Modal } from '@mui/material'
import Image from 'next/image';
import React from 'react'

const ViewSubAccountPlans = ({
    showPlans,
    hidePlans,
    selectedUser
}) => {

    console.log("selected user passed is", selectedUser);

    return (
        <Modal
            open={showPlans}
            onClose={hidePlans}
            closeAfterTransition
            BackdropProps={{
                timeout: 500,
                sx: {
                    backgroundColor: "#00000030",
                    // backdropFilter: "blur(20px)",
                },
            }}
        >
            <Box className="w-6/12 bg-white p-6" sx={styles.modalsStyle}>
                <div className='w-full flex flex-row items-center justify-between mb-6'>
                    <div style={{ fontWeight: "600", fontSize: 18 }}>
                        View Plans
                    </div>
                    <button onClick={hidePlans}>
                        <Image
                            src={"/assets/cross.png"}
                            alt='*'
                            height={14}
                            width={20}
                        />
                    </button>
                </div>
                {/*selectedUser.plan.map((plan, index) => ())*/}
                <div
                    // key={index}
                    className="flex justify-between items-center border rounded-lg p-4 hover:shadow transition"
                // onClick={() => toggleSelection(plan.id)}
                >
                    <div className="w-[80%]">
                        <h3 className="font-semibold text-gray-900">
                            {selectedUser?.plan?.title} | {selectedUser?.plan?.minutes || "X"}mins
                        </h3>
                        <p className="text-sm text-gray-500">{selectedUser?.plan?.planDescription}</p>
                        <p className="mt-1 font-medium text-lg text-gray-800">
                            ${selectedUser?.plan?.price}/<span className="text-sm text-gray-400">Mo*</span>
                        </p>
                    </div>
                </div>
            </Box>
        </Modal>
    )
}

export default ViewSubAccountPlans;


const styles = {
    modalsStyle: {
        height: "auto",
        // bgcolor: "transparent",
        // p: 2,
        mx: "auto",
        my: "50vh",
        transform: "translateY(-55%)",
        borderRadius: 2,
        border: "none",
        outline: "none",
    },
    nrmlTxt: {
        fontWeight: "500",
        fontSize: 15
    }
};
