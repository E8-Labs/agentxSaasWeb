import { Box, Modal, Slider } from '@mui/material';
import React from 'react';
import { styled } from "@mui/material/styles";

const SupportFile = () => {

    const GradientSlider = styled(Slider)(({ theme }) => ({
        color: "transparent", // base color removed
        height: 8,
        padding: "20px 0",

        "& .MuiSlider-rail": {
            opacity: 1,
            backgroundColor: "#e0e0e0", // rail color
            height: 8,
            borderRadius: 8,
        },

        "& .MuiSlider-track": {
            border: "none",
            background: "linear-gradient(90deg, #7902DF, #DF02BA)", // gradient track
            height: 8,
            borderRadius: 8,
        },

        "& .MuiSlider-thumb": {
            height: 24,
            width: 24,
            background: "linear-gradient(135deg, #7902DF, #DF02BA)",
            border: "3px solid white",
            boxShadow: "0 0 10px rgba(0,0,0,0.2)",
            "&:hover": {
                boxShadow: "0 0 15px rgba(0,0,0,0.3)",
            },
        },

        "& .MuiSlider-valueLabel": {
            background: "linear-gradient(135deg, #7902DF, #DF02BA)",
            color: "white",
            borderRadius: 6,
            padding: "4px 8px",
            fontSize: 12,
            fontWeight: "bold",
            transform: "translateY(-120%) scale(1)",

            "&:before": {
                content: '""',
                position: "absolute",
                bottom: -10, // distance below the box
                left: "50%",
                transform: "translateX(-50%)",
                width: 16,
                height: 10,
                background: "linear-gradient(135deg, #7902DF, #DF02BA)",
                clipPath: "polygon(50% 100%, 0 0, 100% 0)", // triangle shape
            },
        },

    }));

    return (
        <div>
            <Modal
                open={true}
            // onClose={() => {
            //     handleResetValues();
            //     handleClose("");
            // }}
            >
                {/*<Box className="bg-white rounded-xl p-6 max-w-md w-[95%] mx-auto mt-20 shadow-lg">*/}
                <Box className="bg-white rounded-xl w-4/12 h-[50vh] border-none outline-none shadow-lg absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <div className='h-[100%] w-full flex flex-col items-center justify-center p-4'>
                        <div
                            className="bg-gradient-to-r from-[#7902DF] to-[#DF02BA] bg-clip-text text-transparent"
                            style={{ fontSize: "35px", fontWeight: 700 }}
                        >
                            50% Off
                        </div>
                        <div className="mt-2" style={{ fontSize: "15px", fontWeight: "400" }}>
                            Your Minutes
                        </div>
                        <div className="mt-2" style={{ fontSize: "22px", fontWeight: "700" }}>
                            {`Let’s Make a Deal!`}
                        </div>
                        <div className="mt-2 text-center" style={{ fontSize: "15px", fontWeight: "400" }}>
                            {`We want to give you the best price possible, so we’ll cut the cost by 50%. Just don’t tell the world. `}
                        </div>
                        <GradientSlider
                            defaultValue={200}
                            max={300}
                            valueLabelDisplay="on"
                            aria-label="Gradient Slider"
                        />
                    </div>
                </Box>
            </Modal>
        </div>
    )
}

export default SupportFile
