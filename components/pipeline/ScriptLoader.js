import React from "react";
import { Skeleton, Box } from "@mui/material";


export function ScriptLoader({
    height = 50
}) {
    return (
        <div className="flex w-full ">
            <Skeleton
                variant="rectangular"
                sx={{
                    width: "100%",
                    height: height,
                    mx: "auto",
                    mt: 1,
                    borderRadius: 2,
                }}
            />
        </div>
    )
}