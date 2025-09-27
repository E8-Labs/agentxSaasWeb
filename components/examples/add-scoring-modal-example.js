"use client";
import React, { useState } from "react";
import AddScoringModal from "../modals/add-scoring-modal";
import { Button } from "../ui/button";

const AddScoringModalExample = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenModal = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleSubmit = (formData) => {
    console.log("Scoring data submitted:", formData);
    // Handle scoring submission logic here
  };

  return (
    <div className="p-8">
      <div className="max-w-md mx-auto text-center">
        <h1 className="text-2xl font-bold mb-4">Add Scoring Modal Example</h1>
        <p className="text-gray-600 mb-6">
          Click the button below to open the Add Scoring modal.
        </p>

        <Button
          onClick={handleOpenModal}
          className="bg-purple-600 hover:bg-purple-700"
        >
          Open Add Scoring Modal
        </Button>
      </div>

      <AddScoringModal
        open={isModalOpen}
        onClose={handleCloseModal}
        onSubmit={handleSubmit}
      />
    </div>
  );
};

export default AddScoringModalExample;