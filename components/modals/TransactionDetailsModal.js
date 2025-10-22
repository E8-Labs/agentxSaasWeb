import React from 'react';
import { Modal, Box, CircularProgress } from '@mui/material';
import Image from 'next/image';
import { GetFormattedDateString } from '@/utilities/utility';

const TransactionDetailsModal = ({
  open,
  onClose,
  transactionDetails,
  isLoading,
}) => {
  const styles = {
    paymentModal: {
      height: "auto",
      bgcolor: "transparent",
      mx: "auto",
      my: "50vh",
      transform: "translateY(-50%)",
      borderRadius: 2,
      border: "none",
      outline: "none",
    },
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
        },
      }}
    >
      <Box
        className="md:9/12 lg:w-8/12 sm:w-11/12 w-full"
        sx={styles.paymentModal}
      >
        <div className="flex flex-row justify-center w-full">
          <div
            className="sm:w-9/12 w-full"
            style={{
              backgroundColor: "#ffffff",
              padding: 20,
              borderRadius: "13px",
              maxHeight: "80vh",
              overflowY: "auto",
            }}
          >
            <div className="flex flex-row justify-between items-center mb-6">
              <div
                style={{
                  fontSize: 22,
                  fontWeight: "600",
                }}
              >
                Transaction Details
              </div>
              <button onClick={onClose}>
                <Image
                  src={"/assets/crossIcon.png"}
                  height={40}
                  width={40}
                  alt="*"
                />
              </button>
            </div>

            {isLoading ? (
              <div className="w-full flex flex-row items-center justify-center py-12">
                <CircularProgress size={35} thickness={2} />
              </div>
            ) : transactionDetails ? (
              <div className="space-y-6">
                {/* Transaction Overview */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">Transaction Overview</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-gray-600">Transaction ID:</span>
                      <p className="font-medium text-sm">{transactionDetails.database?.transactionId}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Amount:</span>
                      <p className="font-medium text-sm">${transactionDetails.database?.price}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Status:</span>
                      <p className="font-medium text-sm capitalize">{transactionDetails.database?.processingStatus}</p>
                    </div>
                    <div>
                      <span className="text-sm text-gray-600">Date:</span>
                      <p className="font-medium text-sm">{GetFormattedDateString(transactionDetails.database?.createdAt)}</p>
                    </div>
                  </div>
                </div>

                {/* Transaction Description */}
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-gray-800">Description</h3>
                  <div>
                    <span className="text-sm text-gray-600">Title:</span>
                    <p className="font-medium text-sm">{transactionDetails.database?.title}</p>
                  </div>
                  <div className="mt-2">
                    <span className="text-sm text-gray-600">Description:</span>
                    <p className="font-medium text-sm">{transactionDetails.database?.description}</p>
                  </div>
                  
                </div>

                {/* Agent Information */}
                {transactionDetails.database?.agent && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">Agent Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-600">Agent Name:</span>
                        <p className="font-medium text-sm">{transactionDetails.database.agent.name}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Agent Type:</span>
                        <p className="font-medium text-sm capitalize">{transactionDetails.database.agent.agentType}</p>
                      </div>
                      <div className="col-span-2">
                        <span className="text-sm text-gray-600">Agent Role:</span>
                        <p className="font-medium text-sm">{transactionDetails.database.agent.agentRole}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Payment Method Details */}
                {transactionDetails.stripe?.paymentMethod && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">Payment Method</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-600">Card Brand:</span>
                        <p className="font-medium text-sm capitalize">{transactionDetails.stripe.paymentMethod.card.brand}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Last 4 Digits:</span>
                        <p className="font-medium text-sm">**** {transactionDetails.stripe.paymentMethod.card.last4}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Expiry:</span>
                        <p className="font-medium text-sm">{transactionDetails.stripe.paymentMethod.card.expMonth}/{transactionDetails.stripe.paymentMethod.card.expYear}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Country:</span>
                        <p className="font-medium text-sm">{transactionDetails.stripe.paymentMethod.card.country}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Customer Information */}
                {transactionDetails.stripe?.customer && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">Customer Information</h3>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-sm text-gray-600">Customer Name:</span>
                        <p className="font-medium text-sm">{transactionDetails.stripe.customer.name}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Email:</span>
                        <p className="font-medium text-sm">{transactionDetails.stripe.customer.email}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-600">Customer ID:</span>
                        <p className="font-medium text-sm">{transactionDetails.stripe.customer.id}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Receipt Information */}
                {transactionDetails.stripe?.charge?.receiptUrl && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-gray-800">Receipt</h3>
                    <div>
                      <a 
                        href={transactionDetails.stripe.charge.receiptUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 underline text-sm"
                      >
                        View Receipt
                      </a>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="w-full flex flex-row items-center justify-center py-12">
                <p className="text-gray-500">No transaction details available</p>
              </div>
            )}
          </div>
        </div>
      </Box>
    </Modal>
  );
};

export default TransactionDetailsModal;
