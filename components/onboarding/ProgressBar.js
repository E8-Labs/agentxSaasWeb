import React, { useEffect, useState } from "react";
import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";

const ProgressBar = ({ value }) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
   // console.log("Value of progress is :", value);
    setProgress(value);
  }, [value]);

  return (
    <div className="">
      <div>
        <Box sx={{ width: "100%" }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{
              "& .MuiLinearProgress-bar": {
                backgroundColor: "#7902DF",
              },
              backgroundColor: "#7902DF35",
            }}
          />
        </Box>
      </div>
    </div>
  );
};

export default ProgressBar;
