import React, { useState, useEffect } from "react";

export const AudioWaveActivity = ({
  isActive = false,
  barCount = 11,
  className = "",
}) => {
  console.log("IS active ", isActive);
  // Center scale (resting) index for non-active state
  const restingIndex = Math.floor(barCount / 2);

  const scaleClasses = [
    "scale-y-75",
    "scale-y-100",
    "scale-y-125",
    "scale-y-150",
    "scale-y-200",
    "scale-y-300",
    "scale-y-200",
    "scale-y-150",
    "scale-y-125",
    "scale-y-100",
    "scale-y-75",
  ];

  const [scalePattern, setScalePattern] = useState(
    Array(barCount).fill(restingIndex)
  );

  useEffect(() => {
    if (!isActive) {
      setScalePattern(Array(barCount).fill(restingIndex));
      return;
    }

    const interval = setInterval(() => {
      setScalePattern(
        Array(barCount)
          .fill(0)
          .map(() => Math.floor(Math.random() * scaleClasses.length))
      );
    }, 160);

    return () => clearInterval(interval);
  }, [isActive, barCount, scaleClasses.length]);

  return (
    <div
      className={`flex items-end justify-center gap-1 h-8 w-32 ${className}`}
    >
      {scalePattern.map((scaleIndex, index) => (
        <div
          key={index}
          className={`bg-green-400 transition-transform duration-200 ease-in-out w-1.5 h-8 rounded-md ${scaleClasses[scaleIndex]}`}
        />
      ))}
    </div>
  );
};
