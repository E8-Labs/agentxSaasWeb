import React from "react";
import { Skeleton, Box } from "@mui/material";

function MyAgentXLoader({ fullScreen = true }) {
    return (
        <div className="scroll-container w-full h-full flex flex-col items-start justify-start max-h-[70vh] overflow-auto">
            <style jsx>{`
                .scroll-container::-webkit-scrollbar {
                    display: none;
                }
            `}</style>

            <Box sx={{ width: "100%",}}>
                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 3,
                    }}
                >
                    {Array.from({ length: 7 }).map((_, idx) => (
                        <Skeleton
                            key={idx}
                            variant="rectangular"
                            sx={{
                                width:"100%",
                                height: 120,
                                mx: "auto",
                                mt: 1,
                                borderRadius: 2,
                            }}
                        />
                    ))}
                </Box>
            </Box>
        </div>
    );
}

export default MyAgentXLoader;
