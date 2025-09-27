"use client";
import React, { useState } from "react";
import AddScoringModalBase from "../ui/add-scoring-modal";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";

const AddScoringModal = ({
  open,
  onClose,
  onSubmit,
  ...props
}) => {
  const [formData, setFormData] = useState({
    // Add scoring fields
    scoringName: "",
    scoringCriteria: "",
    scoringWeight: "",
  });

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = () => {
    if (onSubmit) {
      onSubmit(formData);
    }
    onClose();
  };

  return (
    <AddScoringModalBase
      open={open}
      onClose={onClose}
      title="Add Scoring"
      className="lg:w-5/12 sm:w-8/12 w-10/12"
      {...props}
    >
      <div className="space-y-6">
        {/* Main Content Area - Customize based on Figma design */}
        <Card className="border-0 shadow-none bg-gray-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-medium">
              Scoring Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Scoring Form Fields */}
            <div className="space-y-2">
              <Label htmlFor="scoringName" className="text-sm font-medium">
                Scoring Name
              </Label>
              <Input
                id="scoringName"
                value={formData.scoringName}
                onChange={(e) => handleInputChange('scoringName', e.target.value)}
                placeholder="Enter scoring name..."
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scoringCriteria" className="text-sm font-medium">
                Scoring Criteria
              </Label>
              <Input
                id="scoringCriteria"
                value={formData.scoringCriteria}
                onChange={(e) => handleInputChange('scoringCriteria', e.target.value)}
                placeholder="Enter scoring criteria..."
                className="h-12"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="scoringWeight" className="text-sm font-medium">
                Scoring Weight
              </Label>
              <Input
                id="scoringWeight"
                type="number"
                value={formData.scoringWeight}
                onChange={(e) => handleInputChange('scoringWeight', e.target.value)}
                placeholder="Enter weight (0-100)..."
                className="h-12"
                min="0"
                max="100"
              />
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            className="flex-1 h-12"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="flex-1 h-12 bg-purple-600 hover:bg-purple-700"
          >
            Add Scoring
          </Button>
        </div>
      </div>
    </AddScoringModalBase>
  );
};

export default AddScoringModal;