import React from "react";
import { Skeleton, Box, Typography, Avatar } from "@mui/material";

function MyAgentXLoader({ fullScreen = true }) {
    return (
        <div className="scroll-container w-full h-full flex flex-col items-start justify-start max-h-[70vh] overflow-auto">
            <style jsx>{`
    .scroll-container::-webkit-scrollbar {
      display: none;
    }
  `}</style>
            <Box sx={{ width: "100%" }}>
                {/*fullScreen ? (
          <>
            <Skeleton
              variant="text"
              width="40%"
              height={70}
              sx={{ marginTop: 0 }}
            />

            <Box
              sx={{
                flexDirection: "column",
                gap: 3,
                display: "flex",
                marginTop: 4,
              }}
            >
              <Skeleton variant="text" width={250} height={20} />
              <Skeleton variant="text" width={250} height={20} />
              <Skeleton variant="text" width={250} height={20} />
              <Skeleton variant="text" width={250} height={20} />
            </Box>
          </>
        ) : (
          <></>
        )*/}

                <Box
                    sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 3,
                    }}
                >
                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 3,
                        }}
                    >
                        <Skeleton variant="text" width={800} height={250} />
                        <Skeleton
                            variant="text"
                            width={800}
                            height={250}
                            sx={{ marginTop: -10 }}
                        />
                        <Skeleton
                            variant="text"
                            width={800}
                            height={250}
                            sx={{ marginTop: -10 }}
                        />
                        <Skeleton
                            variant="text"
                            width={800}
                            height={250}
                            sx={{ marginTop: -10 }}
                        />
                        <Skeleton
                            variant="text"
                            width={800}
                            height={250}
                            sx={{ marginTop: -10 }}
                        />
                        <Skeleton
                            variant="text"
                            width={800}
                            height={250}
                            sx={{ marginTop: -10 }}
                        />
                        <Skeleton
                            variant="text"
                            width={800}
                            height={250}
                            sx={{ marginTop: -10 }}
                        />
                    </Box>

                    {/*<Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 3,
                        }}
                    >
                        <Skeleton variant="text" width={800} height={250} />
                        <Skeleton
                            variant="text"
                            width={800}
                            height={250}
                            sx={{ marginTop: -10 }}
                        />
                        <Skeleton
                            variant="text"
                            width={800}
                            height={250}
                            sx={{ marginTop: -10 }}
                        />
                    </Box>

                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 3,
                        }}
                    >
                        <Skeleton variant="text" width={800} height={250} />
                        <Skeleton
                            variant="text"
                            width={800}
                            height={250}
                            sx={{ marginTop: -10 }}
                        />
                        <Skeleton
                            variant="text"
                            width={800}
                            height={250}
                            sx={{ marginTop: -10 }}
                        />
                    </Box>

                    <Box
                        sx={{
                            display: "flex",
                            flexDirection: "column",
                            gap: 3,
                        }}
                    >
                        <Skeleton variant="text" width={800} height={250} />
                        <Skeleton
                            variant="text"
                            width={800}
                            height={250}
                            sx={{ marginTop: -10 }}
                        />
                        <Skeleton
                            variant="text"
                            width={800}
                            height={250}
                            sx={{ marginTop: -10 }}
                        />
                    </Box>*/}
                </Box>
            </Box>
        </div>
    );
}

export default MyAgentXLoader;
