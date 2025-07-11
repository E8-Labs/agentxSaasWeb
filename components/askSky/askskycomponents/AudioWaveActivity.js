import React, { useState, useEffect } from "react";

export const AudioWaveActivity = ({
  isActive = false,
  barCount = 20,
  className = "",
}) => {
  const [scalePattern, setScalePattern] = useState(
    Array(barCount).fill(1) // 1 = resting scale
  );

  useEffect(() => {
    if (!isActive) {
      setScalePattern(Array(barCount).fill(1));
      return;
    }

    const interval = setInterval(() => {
      setScalePattern(
        Array(barCount)
          .fill(0)
          .map(() => {
            // Random scale between 0.5 and 3
            const scale = (Math.random() * 2.5 + 0.5).toFixed(2);
            return parseFloat(scale);
          })
      );
    }, 160);

    return () => clearInterval(interval);
  }, [isActive, barCount]);

  return (

    <div
      className={`flex items-center justify-center gap-1 h-4 w-32 mt-15 ${className}`}
    >
      {Array(barCount).fill(0).map((_, index) => (
        <div
          key={index}
          style={{
            backgroundColor: "#7902DF", // green-40034D399
            width: "4px",
            height: "2px",
            borderRadius: "50%",
          }}
        />
      ))}
    </div>

    // <div
    //   className={`flex items-end justify-center gap-1 w-32 mt-4 ${className}`}
    // >
    //   {scalePattern.map((scale, index) => (
    //     <div
    //       key={index}
    //       style={{
    //         transform: `scaleY(${scale})`,
    //         transition: "transform 0.2s ease-in-out",
    //         backgroundColor: "#34D399", // green-400
    //         width: "6px",
    //         height: "2px",
    //         borderRadius: "50%",
    //       }}
    //     />
    //   ))}
    // </div>
  );
};
