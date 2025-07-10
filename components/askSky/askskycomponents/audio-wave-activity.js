import { useEffect, useState } from "react";

export const AudioWaveActivity = ({
  isActive = false,
  barCount = 11,
  className = "",
}) => {
  const [scalePattern, setScalePattern] = useState(Array(barCount).fill(0));

  useEffect(() => {
    if (!isActive) {
      setScalePattern(Array(barCount).fill(0));
      return;
    }

    const interval = setInterval(() => {
      setScalePattern((prev) => prev.map(() => Math.floor(Math.random() * 5)));
    }, 200);

    return () => clearInterval(interval);
  }, [isActive, barCount]);

  const scaleClasses = [
    "scale-y-100",
    "scale-y-200",
    "scale-y-[300%]",
    "scale-y-[400%]",
    "scale-y-[500%]",
  ];

  return (
    <div
      className={`flex items-center justify-center gap-1 h-10 w-54 ${className}`}
    >
      {scalePattern.map((scaleIndex, index) => (
        <div
          key={index}
          className={
            isActive
              ? `bg-purple transition-transform duration-300 ease-in-out size-1 rounded-full ${scaleClasses[scaleIndex]}`
              : "bg-purple transition-transform duration-300 ease-in-out size-1 rounded-full"
          }
        />
      ))}
    </div>
  );
};
