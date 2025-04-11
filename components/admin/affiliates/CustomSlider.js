import React, { useEffect, useState } from "react";
import { Slider, Box, Typography } from "@mui/material";

export default function CustomSlider({
  min = 100,
  max = 10000,
  step = 10,
  defaultValue = [200, 700],
  label = "Users",
  onChange,
}) {
  const [value, setValue] = useState(defaultValue);

  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
    if (onChange) {
      onChange(newValue); // Callback to parent
    }
  };

  return (
    <Box
      sx={{
        backgroundColor: "white",
        borderRadius: "12px",
        padding: "16px",
        boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
        width: "100%",
        marginTop:"20px"
      }}
    >
      {/* Title and Value Display */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography fontWeight="600" fontSize={15} color="black">
          {label}
        </Typography>
        <Typography fontWeight="600" fontSize={15} color="black">
          {Array.isArray(value) ? `${label != "Users"? "$":""}${value[0]} - ${label != "Users"? "$":""}${value[1]}` : value}
        </Typography>
      </Box>

      {/* Slider Component */}
      <Slider
        value={value}
        onChange={handleChange}
        valueLabelDisplay="off"
        min={min}
        max={max}
        // step={step}
        sx={{
          color: "#6200EA",
          height: 12,
          borderRadius: "5px",
          "& .MuiSlider-track": {
            backgroundColor: "#6200EA",
            border: "none",
          },
          "& .MuiSlider-rail": {
            backgroundColor: "#E0CFFF",
            opacity: 1,
          },
          "& .MuiSlider-thumb": {
            height: 25,
            width: 25,
            backgroundColor: "white",
            boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.2)",
            "&:hover": {
              boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.3)",
            },
          },
        }}
      />
    </Box>
  );
}
