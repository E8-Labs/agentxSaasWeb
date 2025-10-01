import React from 'react';
import { Modal, Box } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import CloseBtn from '../globalExtras/CloseBtn';

const MoreAgentsPopup = ({ 
  open, 
  onClose, 
  onUpgrade, 
  onAddAgent, 
  costPerAdditionalAgent = 10 
}) => {
  const router = useRouter();

  const handleUpgrade = () => {
    onUpgrade();
    onClose();
  };

  const handleAddAgent = () => {
    onAddAgent();
    onClose();
    router.push('/createagent');
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropProps={{
        timeout: 100,
        sx: {
          backgroundColor: "#00000020",
          backdropFilter: "blur(15px)",
        },
      }}
    >
      <Box
        className="flex justify-center items-center w-full h-full"
        sx={{
          outline: "none",
        }}
      >
        <div
          className="bg-white rounded-2xl p-8 relative max-w-2xl w-full mx-4"
          style={{
            boxShadow: "0px 20px 40px rgba(0, 0, 0, 0.1)",
          }}
        >
          {/* Close Button */}
         <CloseBtn
          onClick={onClose}
         />
          {/* Avatars */}
         
          <Image
            src="/otherAssets/unlockAgents.png"
            height={80}
            width={150}
            alt="Axel"
          />
          

          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-4">
            Add Extra Agents
          </h2>

          {/* Description */}
          <div className="text-center text-gray-600 mb-8 space-y-2">
            <p>{`You've reached the maximum number of agents on your current plan.`}</p>
            <p>
              You can upgrade your plan or add an agent for{' '}
              <span className="font-semibold text-purple-600">${costPerAdditionalAgent}</span> per month.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            {/* Upgrade Button */}
            <button
              onClick={handleUpgrade}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
            >
              Upgrade
            </button>

            {/* Add Agent Button */}
            <Link
              href="/createagent"
              onClick={handleAddAgent}
              className="w-full text-purple-600 hover:text-purple-700 font-semibold py-2 px-6 rounded-lg transition-colors block text-center"
              prefetch={true}
            >
              Add Agent ${costPerAdditionalAgent} per month
            </Link>
          </div>
        </div>
      </Box>
    </Modal>
  );
};

export default MoreAgentsPopup;
