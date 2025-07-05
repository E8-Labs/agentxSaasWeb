import React, { useState, useEffect } from "react";

export const AudioWaveActivity = ({
  isActive = false,
  barCount = 11,
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
      className={`flex items-end justify-center gap-1 h-4 w-32 mt-4 ${className}`}
    >
      {scalePattern.map((scale, index) => (
        <div
          key={index}
          style={{
            transform: `scaleY(${scale})`,
            transition: "transform 0.2s ease-in-out",
            backgroundColor: "#34D399", // green-400
            width: "6px",
            height: "14px",
            borderRadius: "4px",
          }}
        />
      ))}
    </div>
  );
};
