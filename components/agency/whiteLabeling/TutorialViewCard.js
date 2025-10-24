import React from 'react';
import { Switch } from '@mui/material';
import Image from 'next/image';

const TutorialViewCard = ({
  tutorialData,
  onEditClick,
  onToggleSwitch,
  isEnabled = true,
  thumbnailSrc = "/assets/youtubeplay.png"
}) => {
  const styles = {
    semiBoldHeading: { fontSize: 18, fontWeight: "600" },
    regularHeading: { fontSize: 16, fontWeight: "400" },
    description: { fontSize: "12px", fontWeight: "400", color: "#616161" },
  };

  return (
    <div className="w-full flex flex-row items-center justify-between">
      <div className="flex flex-row items-center gap-2 w-[85%]">
        <div className="relative flex-shrink-0">
          <Image
            src={thumbnailSrc}
            alt="Video thumbnail"
            width={Number.parseInt(80, 10)}
            height={Number.parseInt(150, 10)}
            priority
            className="rounded-lg object-cover"
          />
        </div>
        <div>
          <div className="text-start mb-2" style={styles.regularHeading}>
            {tutorialData.title}
          </div>
          <div className="text-start" style={styles.description}>
            {tutorialData.description}
          </div>
        </div>
      </div>
      <div className="w-[15%] flex flex-col items-end justify-end">
        <div className="flex justify-end w-full">
          <Switch
            checked={isEnabled}
            onChange={onToggleSwitch}
            sx={{
              "& .MuiSwitch-switchBase.Mui-checked": {
                color: "white",
              },
              "& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track": {
                backgroundColor: "#7902DF",
              },
            }}
          />
        </div>
        {isEnabled && (
          <button 
            className="pe-4 border-none outline-none" 
            onClick={() => onEditClick(tutorialData)}
          >
            <Image
              src={"/assets/editPen.png"}
              height={17}
              width={17}
              alt="Edit"
              className="cursor-pointer"
            />
          </button>
        )}
      </div>
    </div>
  );
};

export default TutorialViewCard;
