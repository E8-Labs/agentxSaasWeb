"use client";
import React, { useState, useEffect } from "react";
import AddScoringModalBase from "../ui/add-scoring-modal";
import axios from "axios";
import Apis from "../apis/Apis";

const PREDEFINED_QUESTIONS = [
  "Are they currently working with another agent?",
  "What's their timeline for buying/selling?",
  "Are they pre-approved for financing?",
  "Have they visited properties in person?",
  "Do they need to sell before buying?"
];

const AddScoringModal = ({
  open,
  onClose,
  onSubmit,
  selectedTemplate = null,
  agentId,
  selectedAgent,
  loading = false,
  ...props
}) => {
  const [formData, setFormData] = useState({
    templateName: "",
    description: "",
    maxPoints: 10,
  });

  const [questions, setQuestions] = useState([
    { question: "", points: "", showSuggestions: false },
    { question: "", points: "", showSuggestions: false },
    { question: "", points: "", showSuggestions: false },
    { question: "", points: "", showSuggestions: false }
  ]);

  const [totalScore, setTotalScore] = useState(0);
  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);

  // Fetch scoring templates
  const fetchTemplates = async () => {
    if (!agentId) return;

    setTemplatesLoading(true);
    try {
      let AuthToken = null;
      const localData = localStorage.getItem("User");
      if (localData) {
        const UserDetails = JSON.parse(localData);
        AuthToken = UserDetails.token;
      }

      console.log('Fetching templates for agentId:', agentId);
      console.log('Auth token:', AuthToken);
      console.log('API URL:', Apis.getScoringTemplates);

      const response = await axios.get(
        Apis.getScoringTemplates,
        {
          headers: {
            'Authorization': `Bearer ${AuthToken}`,
          },
        }
      );

      console.log('Templates response:', response.data);

      if (response.data && response.data.templates) {
        setTemplates(response.data.templates);
      } else if (response.data) {
        // Handle case where templates might be directly in response.data
        setTemplates(response.data);
      }
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setTemplatesLoading(false);
    }
  };

  // Fetch templates when modal opens
  useEffect(() => {
    if (open && agentId) {
      fetchTemplates();
    }
  }, [open, agentId]);

  // Handle click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Don't close if clicking on a suggestion
      if (event.target.closest('.suggestion-item')) {
        return;
      }

      if (!event.target.closest('.question-input-container')) {
        setQuestions(prev => prev.map(q => ({ ...q, showSuggestions: false })));
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Load template data when selectedTemplate changes
  useEffect(() => {
    if (selectedTemplate) {
      setFormData({
        templateName: selectedTemplate.templateName || "",
        description: selectedTemplate.description || "",
        maxPoints: selectedTemplate.maxPoints || 10,
      });

      if (selectedTemplate.questions && selectedTemplate.questions.length > 0) {
        setQuestions(
          selectedTemplate.questions.map(q => ({
            question: q.question || "",
            points: q.points?.toString() || "",
            showSuggestions: false
          }))
        );
      }
    } else {
      // Auto-generate template name based on agent name
      const agentName = selectedAgent?.name || "Agent";
      const templateName = `${agentName}'s Scoring`;

      setFormData({
        templateName: templateName,
        description: "",
        maxPoints: 10,
      });
      setQuestions([
        { question: "", points: "", showSuggestions: false },
        { question: "", points: "", showSuggestions: false },
        { question: "", points: "", showSuggestions: false },
        { question: "", points: "", showSuggestions: false }
      ]);
    }
  }, [selectedTemplate, selectedAgent]);

  // Calculate total score whenever questions change
  useEffect(() => {
    const total = questions.reduce((sum, q) => {
      const points = parseFloat(q.points) || 0;
      const hasQuestion = q.question.trim().length > 0;
      return hasQuestion ? sum + points : sum;
    }, 0);
    setTotalScore(total);
  }, [questions]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleQuestionChange = (index, field, value) => {
    const newQuestions = [...questions];
    newQuestions[index] = {
      ...newQuestions[index],
      [field]: value
    };

    // Show suggestions when typing in question field
    if (field === "question") {
      newQuestions[index].showSuggestions = value.length > 0;
    }

    setQuestions(newQuestions);
  };

  const addQuestion = () => {
    setQuestions([...questions, { question: "", points: "", showSuggestions: false }]);
  };

  const removeQuestion = (index) => {
    if (questions.length > 4) {
      const newQuestions = questions.filter((_, i) => i !== index);
      setQuestions(newQuestions);
    }
  };

  const selectPredefinedQuestion = (index, predefinedQuestion) => {
    const newQuestions = [...questions];
    newQuestions[index] = {
      ...newQuestions[index],
      question: predefinedQuestion,
      showSuggestions: false
    };
    setQuestions(newQuestions);
  };

  const handleTemplateSelect = (templateId) => {
    if (!templateId) return;

    const template = templates.find(t => t.id === templateId);
    if (template) {
      setFormData({
        templateName: template.templateName || "",
        description: template.description || "",
        maxPoints: template.maxPoints || 10,
      });

      if (template.questions && template.questions.length > 0) {
        const templateQuestions = template.questions.map(q => ({
          question: q.question || "",
          points: q.points?.toString() || "",
          showSuggestions: false
        }));

        // Ensure we have at least 4 questions
        while (templateQuestions.length < 4) {
          templateQuestions.push({ question: "", points: "", showSuggestions: false });
        }

        setQuestions(templateQuestions);
      }
    }
  };

  const getFilteredSuggestions = (currentQuestion) => {
    if (!currentQuestion.trim()) return PREDEFINED_QUESTIONS;

    return PREDEFINED_QUESTIONS.filter(q =>
      q.toLowerCase().includes(currentQuestion.toLowerCase())
    );
  };

  const isValidForm = () => {
    // Check if we have valid questions (both question and points filled)
    const validQuestions = questions.filter(q =>
      q.question.trim().length > 0 &&
      parseFloat(q.points) > 0
    );

    // Must have at least one valid question and total score must equal 10
    return validQuestions.length > 0 && totalScore === 10;
  };

  const handleSubmit = async () => {
    if (!isValidForm() || !agentId) return;

    setSubmitLoading(true);

    try {
      const validQuestions = questions
        .filter(q => q.question.trim().length > 0 && parseFloat(q.points) > 0)
        .map((q, index) => ({
          question: q.question.trim(),
          points: parseFloat(q.points),
          questionType: "yes_no",
          sortOrder: index + 1,
          isRequired: true
        }));

      const submissionData = {
        agentId: agentId,
        templateName: formData.templateName.trim(),
        description: formData.description.trim(),
        maxPoints: formData.maxPoints,
        questions: validQuestions
      };

      let AuthToken = null;
      const localData = localStorage.getItem("User");
      if (localData) {
        const UserDetails = JSON.parse(localData);
        AuthToken = UserDetails.token;
      }
      console.log('Submission token:', AuthToken);

      const response = await axios.post(
        `${Apis.createAgentScoring}/${agentId}`,
        submissionData,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${AuthToken}`,
          },
        }
      );

      if (response.data) {
        console.log('Scoring configuration created:', response.data);

        // Call onSubmit callback if provided
        if (onSubmit) {
          onSubmit(submissionData);
        }

        // Close modal
        onClose();
      }
    } catch (error) {
      console.error('Error creating scoring configuration:', error);
      // Handle error (you might want to show a toast or error message)
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <AddScoringModalBase
      open={open}
      onClose={onClose}
      title="Lead Scoring"
      className="lg:w-5/12 sm:w-8/12 w-10/12"
      {...props}
    >
      <div className="space-y-6">
        {/* Header with Template Dropdown in top right */}
        <div className="flex items-center justify-end">
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Select from Template</span>
            <select
              onChange={(e) => handleTemplateSelect(e.target.value)}
              className="outline-none focus:outline-none focus:ring-0 border rounded"
              style={{
                border: "1px solid #E5E7EB",
                fontSize: '14px',
                padding: '8px 12px'
              }}
              disabled={templatesLoading}
            >
              <option value="">
                {templatesLoading ? 'Loading templates...' : 'Select from Template'}
              </option>
              {templates.map((template) => (
                <option key={template.id} value={template.id}>
                  {template.templateName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Learn about scoring leads link */}
        <div className="text-center">
          <a href="#" className="text-purple-600 underline text-sm">
            Learn about scoring leads
          </a>
        </div>

        {/* About Lead Scoring - smaller */}
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-gray-900">About Lead Scoring</h3>
          <p className="text-xs text-gray-600">
            This help your agent quickly assess lead quality, next steps, and confidence level.
          </p>
        </div>

        {/* Questions Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-base font-semibold text-gray-900">Question</span>
            <span className="text-sm font-medium text-purple-600">
              {totalScore}/10 Points
            </span>
          </div>

          {questions.map((question, index) => (
            <div key={index} className="space-y-3">
              <div className="flex items-center gap-4">
                {/* Question Input with Dropdown */}
                <div className="flex-1 relative question-input-container">
                  <input
                    value={question.question}
                    onChange={(e) => handleQuestionChange(index, 'question', e.target.value)}
                    onFocus={() => handleQuestionChange(index, 'showSuggestions', true)}
                    placeholder="Select or Type"
                    className="outline-none focus:outline-none focus:ring-0 border rounded w-full"
                    style={{
                      border: "1px solid #E5E7EB",
                      fontSize: '14px',
                      padding: '12px'
                    }}
                  />

                  {/* Suggestions Dropdown */}
                  {question.showSuggestions && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                      {getFilteredSuggestions(question.question).map((suggestion, suggestionIndex) => (
                        <div
                          key={suggestionIndex}
                          onClick={() => {
                            selectPredefinedQuestion(index, suggestion);
                          }}
                          className="suggestion-item w-full text-left px-3 py-2 hover:bg-gray-100 text-sm border-b border-gray-100 last:border-b-0 cursor-pointer"
                        >
                          {suggestion}
                        </div>
                      ))}
                      {getFilteredSuggestions(question.question).length === 0 && question.question.trim() && (
                        <div className="px-3 py-2 text-sm text-gray-500">
                          No matching suggestions
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Points Input */}
                <div className="w-32">
                  <input
                    type="number"
                    value={question.points}
                    onChange={(e) => handleQuestionChange(index, 'points', e.target.value)}
                    placeholder="Add points"
                    className="outline-none focus:outline-none focus:ring-0 border rounded w-full"
                    style={{
                      border: "1px solid #E5E7EB",
                      fontSize: '14px',
                      padding: '12px'
                    }}
                    min="0"
                    max="10"
                    step="0.5"
                  />
                </div>

                {/* Remove Button */}
                {questions.length > 4 && (
                  <button
                    onClick={() => removeQuestion(index)}
                    className="p-2 text-gray-400 hover:text-red-500 text-lg font-bold"
                  >
                    ×
                  </button>
                )}
              </div>
            </div>
          ))}

          {/* Add New Question Link */}
          <div>
            <button
              onClick={addQuestion}
              className="text-purple-600 underline text-sm"
            >
              Add New Question
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-6">
          <button
            onClick={onClose}
            className="flex-1 h-12 text-gray-800 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValidForm() || submitLoading}
            className={`flex-1 h-12 rounded-lg font-medium flex items-center justify-center ${
              isValidForm() && !submitLoading
                ? 'bg-purple-600 hover:bg-purple-700 text-white'
                : 'bg-purple-300 text-purple-100 cursor-not-allowed'
            }`}
          >
            {submitLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              'Save'
            )}
          </button>
        </div>
      </div>
    </AddScoringModalBase>
  );
};

export default AddScoringModal;