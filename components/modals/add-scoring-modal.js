"use client";
import React, { useState, useEffect } from "react";
import AddScoringModalBase from "../ui/add-scoring-modal";
import axios from "axios";
import Apis from "../apis/Apis";
import { fetchTemplates } from "@/services/leadScoringSerevices/FetchTempletes";
import { Box, FormControl, MenuItem, Modal, Select } from "@mui/material";

// Dynamic questions based on agent type
const AGENT_QUESTIONS = {
  "Real Estate": [
    "// 🔑 Motivation & Timeline",
    "Are they thinking about selling to downsize?",
    "Are they relocating for work/family?",
    "Are they looking to sell in 30–90 days?",
    "Are they looking for a new place to live?",
    "Have they tried selling this property before? (FSBO or expired listing)",
    "Are they interested in a CMA?",
    
    "// 📊 Financial Alignment & Property Fit",
    "Do they have an existing mortgage on the home?",
    "Do they believe their home has appreciated in value?",
    "Are they open to pricing the home competitively?",
    "Is the property within your target price range or location?",
    
    "// 🧾 Property & Ownership Details",
    "Is this the property owner?",
    "Is the property still available?",
    
    "// 🤝 Agent Status & Engagement",
    "Are they currently not working with an agent?",
    "Are they open to hearing an offer or listing?",
    "Did they book an appointment?",
    
    "// 🏠 Bonus Buyer-Style Add-ons (if applicable)",
    "Do they need to sell before they can buy a new home?",
    "Are they pre-approved or speaking with a lender already?"
  ],
  "Insurance": [
    "// 🔑 Motivation & Timeline",
    "Are they looking to review their current insurance coverage this year?",
    "Are they interested in making sure their family is fully protected?",
    "Are they open to adjusting their policy if better value is available?",
    "Are they considering adding coverage within the next 30–90 days?",
    "Are they open to exploring options that provide more peace of mind?",
    
    "// 📊 Financial Alignment & Policy Fit",
    "Would saving money on their current insurance be valuable to them?",
    "Are they interested in getting the most coverage for their budget?",
    "Do they believe their current policy could be improved with better benefits?",
    "Are they open to bundling coverage (auto, home, life) for greater savings?",
    "Would having fixed, predictable monthly premiums be helpful for them?",
    
    "// 🧾 Coverage & Ownership Details",
    "Do they currently have active insurance coverage in place?",
    "Are they the primary decision-maker for their insurance policy?",
    "Are they open to reviewing whether their coverage matches their current needs?",
    "Do they feel confident their policy covers unexpected emergencies?",
    "Are they interested in seeing if they qualify for additional benefits?",
    
    "// 🤝 Agent Status & Engagement",
    "Are they interested in working together, if we were a fit?",
    "Are they open to working together if the fit is right?",
    "Did they request a personalized quote?",
    "Are they interested in scheduling a quick review appointment?",
    "Would having an expert handle the policy details make things easier for them?"
  ],
  "Sales": [
    "// 🔑 Motivation & Timeline",
    "Are they looking to grow their pipeline in the next 30–90 days?",
    "Are they interested in taking more sales calls with qualified prospects?",
    "Are they open to strategies that help them shorten their sales cycle?",
    "Are they currently focused on booking more meetings for their team?",
    "Do they believe more top-of-funnel activity would accelerate revenue?",
    
    "// 📊 Budget & Fit",
    "Do they have a budget allocated for sales/lead generation tools?",
    "Are they open to investing if the ROI is clear and measurable?",
    "Do they believe increasing conversion rates is worth exploring?",
    "Are they targeting industries or markets where outbound can be effective?",
    "Would they benefit from a predictable flow of sales conversations?",
    
    "// 🧾 Authority & Role Fit",
    "Are they the person responsible for prospecting or booking meetings?",
    "Are they directly involved in building the sales pipeline?",
    "Do they have decision-making power for tools or processes that impact outreach?",
    "Are they responsible for qualifying and passing leads to closers/AE's?",
    "Do they believe better outbound performance would make their role easier?",
    
    "// 🤝 Engagement & Process",
    "Are they open to testing new tools or workflows that improve efficiency?",
    "Have they shown interest in booking a discovery/demo call?",
    "Are they willing to personalize outreach if it means higher response rates?",
    "Do they believe automation could save them time in their daily prospecting?",
    "Are they open to collaborating with a team to refine their pitch?"
  ],
  "Marketing": [
    "// 🔑 Motivation & Timeline",
    "Are they looking to increase brand awareness in the next 30–90 days?",
    "Are they interested in generating more inbound leads through marketing?",
    "Do they believe stronger marketing would accelerate their sales pipeline?",
    "Are they open to testing new campaigns or strategies soon?",
    "Are they focused on scaling their marketing results this quarter?",
    
    "// 📊 Budget & Fit",
    "Do they have a marketing budget allocated for growth initiatives?",
    "Are they open to investing in marketing if the ROI is clear?",
    "Do they believe digital campaigns could bring them measurable results?",
    "Are they currently spending money on ads, content, or other marketing channels?",
    "Would they benefit from lowering their cost-per-lead while increasing volume?",
    
    "// 🧾 Strategy & Ownership",
    "Are they the person responsible for marketing strategy or execution?",
    "Do they currently manage or oversee digital campaigns?",
    "Are they involved in decisions on marketing tools, platforms, or agencies?",
    "Do they believe their current strategy could be improved?",
    "Are they actively tracking KPIs like lead volume, CPL, or conversion rate?",
    
    "// 🤝 Engagement & Process",
    "Are they open to exploring new tools or platforms to improve marketing results?",
    "Have they shown interest in a demo or case study?",
    "Are they willing to test a campaign if it's low risk?",
    "Do they believe automation could improve their marketing efficiency?",
    "Are they interested in collaborating on strategies tailored to their goals?",
    
    "// 📈 Bonus Add-Ons (if applicable)",
    "Are they looking to increase their social media reach?",
    "Would they benefit from content or SEO strategies that generate inbound traffic?",
    "Are they open to retargeting campaigns to nurture existing leads?",
    "Do they believe AI could give them an edge in creating or optimizing campaigns?",
    "Are they focused on driving higher ROI from their current ad spend?"
  ],
  "Loan Officer": [
    "// 🔑 Motivation & Timeline",
    "Are they planning to purchase a home in the next 30–90 days?",
    "Are they interested in refinancing to get a better rate?",
    "Are they looking to get pre-approved for a mortgage soon?",
    "Do they believe now is a good time to explore financing options?",
    "Are they motivated to secure financing to move forward with their goals?",
    
    "// 📊 Financial Alignment & Fit",
    "Do they have stable income that supports a loan?",
    "Are they open to reviewing different loan options to find the best fit?",
    "Do they believe lowering their monthly payment would help them financially?",
    "Are they interested in seeing if they qualify for a lower interest rate?",
    "Would they benefit from consolidating debt into one loan?",
    
    "// 🧾 Ownership & Documentation",
    "Are they the primary decision-maker for the loan application?",
    "Do they already have some of the required documentation ready (income, credit, etc.)?",
    "Are they confident in their ability to qualify for financing?",
    "Are they open to providing information to speed up pre-approval?",
    "Do they believe working with a loan officer will make the process easier?",
    
    "// 🤝 Engagement & Process",
    "Are they open to scheduling a call to review financing options?",
    "Did they request a personalized loan estimate?",
    "Are they interested in learning what programs they may qualify for?",
    "Would they benefit from guidance on first-time homebuyer or specialty programs?",
    "Are they open to comparing loan options side-by-side before deciding?",
    
    "// 🏠 Bonus Add-Ons (if applicable)",
    "Are they interested in down payment assistance programs?",
    "Do they have interest in FHA, VA, or USDA loan options?",
    "Would they benefit from locking in a rate before it increases?",
    "Are they open to exploring equity-based products like HELOCs?",
    "Are they planning to buy an investment property in addition to a primary home?"
  ]
};

// Default questions for unknown agent types
const DEFAULT_QUESTIONS = [
  "What's their timeline for this decision?",
  "What's their budget range?",
  "What are their main requirements?",
  "Who else is involved in the decision?",
  "What's their biggest concern?"
];

const AddScoringModal = ({
  open,
  onClose,
  onSubmit,
  selectedTemplate = null,
  editingTemplate = null,
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

  const agents = [
    { id: 1, name: "Real Estate" },
    { id: 2, name: "Insurance" },
    { id: 3, name: "Sales" },
    { id: 4, name: "Marketing" },
    { id: 5, name: "Loan Officer" },
  ];
  const [totalScore, setTotalScore] = useState(0);
  const [templates, setTemplates] = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [selectedAgentType, setSelectedAgentType] = useState(agents[0]);


  // Fetch templates when modal opens
  useEffect(() => {
    if (open && agentId) {
      fetchTemplates({
        agentId: agentId,
        setTemplates: setTemplates,
        setTemplatesLoading: setTemplatesLoading,
        // Don't auto-select in modal - let user choose from dropdown
        setSelectedTemplate: null
      });
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

  // Load template data when selectedTemplate or editingTemplate changes
  useEffect(() => {
    const templateToLoad = editingTemplate || selectedTemplate;
    
    if (templateToLoad) {
      setFormData({
        templateName: templateToLoad.templateName || "",
        description: templateToLoad.description || "",
        maxPoints: templateToLoad.maxPoints || 10,
      });

      console.log('Loading template:', templateToLoad);

      if (templateToLoad.questions && templateToLoad.questions.length > 0) {
        setQuestions(
          templateToLoad.questions.map(q => ({
            question: q.question || "",
            // fix points to zero decimal places
            points: q.points ? parseFloat(q.points).toFixed(0) : "0",
            showSuggestions: false
          }))
        );
      }
    } else {
      // Auto-generate template name based on agent name
      const agentName = selectedAgent?.name || "Agent";
      const templateName = `${agentName}'s Score`;

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
  }, [selectedTemplate, editingTemplate, selectedAgent]);

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
    if (questions.length > 1 && index !== 0) {
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

  const handleAgentTypeSelect = (agentType) => {
    setSelectedAgentType(agentType === selectedAgentType ? null : agentType);
  };

  const handleTemplateSelect = (templateId) => {
    console.log('Template selected:', templateId);
    console.log('Available templates:', templates);

    setSelectedTemplateId(templateId);

    if (!templateId) {
      // Reset to default when no template selected
      const agentName = selectedAgent?.name || "Agent";
      const defaultTemplateName = `${agentName}'s Score`;

      setFormData({
        templateName: defaultTemplateName,
        description: "",
        maxPoints: 10,
      });

      setQuestions([
        { question: "", points: "", showSuggestions: false },
        { question: "", points: "", showSuggestions: false },
        { question: "", points: "", showSuggestions: false },
        { question: "", points: "", showSuggestions: false }
      ]);
      return;
    }

    const template = templates.find(t => t.id === templateId || t.id === parseInt(templateId));
    console.log('Found template:', template);
    console.log('Template structure:', JSON.stringify(template, null, 2));

    if (template) {
      // Generate new template name based on agent and source template
      const agentName = selectedAgent?.name || "Agent";
      const newTemplateName = `${agentName}'s ${template.templateName}`;

      setFormData({
        templateName: newTemplateName,
        description: template.description || "",
        maxPoints: template.maxPoints || 10,
      });

      if (template.questions && Array.isArray(template.questions) && template.questions.length > 0) {
        console.log('Template questions found:', template.questions);
        const templateQuestions = template.questions.map((q, index) => {
          console.log(`Question ${index}:`, q);
          return {
            question: q.question || q.text || "",
            points: (q.points || q.score || "").toString(),
            showSuggestions: false
          };
        });

        // Ensure we have at least 4 questions
        while (templateQuestions.length < 4) {
          templateQuestions.push({ question: "", points: "", showSuggestions: false });
        }

        console.log('Setting questions to:', templateQuestions);
        templateQuestions.forEach(q => {
          console.log('Question:', q);
          let pointInNumber = parseFloat(q.points).toFixed(0);
          console.log('Point in number:', pointInNumber);
          q.points = pointInNumber.toString() || "0";
        });
        setQuestions(templateQuestions);
      } else {
        console.log('No questions in template or questions is not an array. Template questions:', template.questions);
        // If template has no questions, start with 4 empty ones
        setQuestions([
          { question: "", points: "", showSuggestions: false },
          { question: "", points: "", showSuggestions: false },
          { question: "", points: "", showSuggestions: false },
          { question: "", points: "", showSuggestions: false }
        ]);
      }
    } else {
      console.log('Template not found for ID:', templateId, 'Available templates:', templates.map(t => ({ id: t.id, name: t.templateName })));
    }
  };

  const getFilteredSuggestions = (currentQuestion) => {
    // Get questions based on selected agent type
    const agentQuestions = selectedAgentType 
      ? AGENT_QUESTIONS[selectedAgentType.name] || DEFAULT_QUESTIONS
      : DEFAULT_QUESTIONS;

    // Filter out comments (lines starting with //)
    const filteredQuestions = agentQuestions.filter(q => !q.trim().startsWith('//'));

    if (!currentQuestion.trim()) return filteredQuestions;

    return filteredQuestions.filter(q =>
      q.toLowerCase().includes(currentQuestion.toLowerCase())
    );
  };

  const getCategorizedSuggestions = (currentQuestion) => {
    // Get questions based on selected agent type
    const agentQuestions = selectedAgentType 
      ? AGENT_QUESTIONS[selectedAgentType.name] || DEFAULT_QUESTIONS
      : DEFAULT_QUESTIONS;

    console.log('Agent questions:', agentQuestions);
    console.log('Selected agent type:', selectedAgentType);

    const categorized = [];
    let currentCategory = null;
    let currentQuestions = [];

    agentQuestions.forEach(item => {
      if (item.trim().startsWith('//')) {
        // This is a category heading - save previous category if it has questions
        if (currentCategory && currentQuestions.length > 0) {
          categorized.push({ type: 'category', text: currentCategory, questions: [...currentQuestions] });
        }
        currentCategory = item.replace('//', '').trim();
        currentQuestions = [];
      } else if (item.trim() !== '') {
        // This is a question - add it to current category
        currentQuestions.push(item);
      }
    });

    // Add the last category if it has questions
    if (currentCategory && currentQuestions.length > 0) {
      categorized.push({ type: 'category', text: currentCategory, questions: [...currentQuestions] });
    }

    console.log('Categorized suggestions:', categorized);

    return categorized;
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
        questions: validQuestions,
        isTemplate: true,
      };

      // If editing, we don't need to specify isTemplate since we're updating an existing template
      // If creating new, specify isTemplate: true
   

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
        console.log('Scoring configuration created/updated:', response.data);

        // Call onSubmit callback if provided
        if (onSubmit) {
          onSubmit(submissionData);
        }

        // Close modal
        onClose();
      }
    } catch (error) {
      console.error('Error creating/updating scoring configuration:', error);
      // Handle error (you might want to show a toast or error message)
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeAfterTransition
      BackdropProps={{
        sx: {
          backgroundColor: "#00000020",
        },
      }}
      {...props}
    >
      <Box
        className={`lg:w-5/12 sm:w-7/12 w-8/12 bg-white rounded-3xl`}
        sx={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          borderRadius: 3,
          border: "none",
          outline: "none",
          backgroundColor: "white",
          maxHeight: '80vh',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div className="w-full flex flex-col h-full">
          {/* Header */}
          <div className="flex flex-row items-center justify-between w-full py-2 px-6">
            <div className="text-lg font-semibold text-gray-900">
              {editingTemplate ? 'Edit Template' : 'Lead Scoring'}
            </div>

            {!editingTemplate && (
              <FormControl sx={{ m: 1 }} className="w-[40%]">
                <Select
                  labelId="demo-select-small-label"
                  id="demo-select-small"
                  value={selectedTemplateId}
                  onChange={(e) => handleTemplateSelect(e.target.value)}
                  displayEmpty // Enables placeholder
                  renderValue={(selected) => {
                    if (!selected) {
                      return <div style={{ color: "#aaa" }}>Select</div>; // Placeholder style
                    }
                    const template = templates.find(t => t.id === selected || t.id === parseInt(selected));
                    return template ? template.templateName : selected;
                  }}
                  sx={{
                    border: "none", // Default border
                    "& .MuiOutlinedInput-notchedOutline": {
                      border: "none", // Remove the default outline
                    },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                      border: "none", // Remove outline on focus
                    },
                    "&.MuiSelect-select": {
                      py: 0, // Optional padding adjustments
                    },
                  }}
                  MenuProps={{
                    PaperProps: {
                      style: {
                        maxHeight: "30vh", // Limit dropdown height
                        overflow: "auto", // Enable scrolling in dropdown
                        scrollbarWidth: "none",
                        // borderRadius: "10px"
                      },
                    },
                  }}
                >

                  {
                    templates.length > 0 ? (
                      templates.map((template) => (
                        <MenuItem key={template.id} value={template.id}>
                          {template.templateName}
                        </MenuItem>
                      ))
                    ) : (
                      <MenuItem value="">
                        <em>No templates found</em>
                      </MenuItem>
                    )}
                </Select>
              </FormControl>
            )}

          </div>

          {/* Scrollable Content */}
          <div 
            className="overflow-y-auto px-6 h-[60vh]" 
            style={{ 
              scrollbarWidth: 'none', 
              msOverflowStyle: 'none'
            }}
            sx={{
              '&::-webkit-scrollbar': {
                display: 'none',
              }
            }}
          >
          {/* About Lead Scoring - smaller */}
          <div className="space-y-1 bg-[#D9D9D92B] flex flex-col items-start justify-center gap-2 rounded-xl px-4 py-2">
            <div className="flex flex-row items-center  gap-2">
              <h3 className="text-base font-semibold text-gray-900">About Lead Scoring</h3>
              <a href="#" className="text-purple-600 text-[12px]">
                Learn about scoring leads
              </a>
            </div>
            <p className="text-xs text-gray-600">
              {`This help your agent quickly assess lead quality, next steps, and confidence level. Only ask "Yes" questions to score your lead. `}
            </p>
          </div>


          

              <div style={{ fontSize: 15, fontWeight: "600" , marginTop: "10px",color :"#8A8A8A",marginTop: "20px"}}>
                Select Template
              </div>

              <div className='w-full flex-row flex items-center gap-2 mt-3'
                style={{ overflowX: 'auto', scrollbarWidth: 'none' }}
              >
                {
                  agents.map((item) => (
                    <button key={item.id}
                      onClick={() => handleAgentTypeSelect(item)}
                    >
                      <div className='px-4 py-2 rounded-lg'
                        style={{
                          fontSize: 14, fontWeight: '400', whiteSpace: 'nowrap',
                          borderWidth: 1,
                          borderColor: selectedAgentType?.id === item.id ? "#7902df" : "#15151510"
                        }}
                      >
                        {item.name}
                      </div>
                    </button>
                  ))
                }
              </div>

          {/* Questions Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between mt-5">
              <span className="text-base font-normal text-gray-900">Question</span>
              <div className="px-2 py-1 rounded-full bg-[#7902DF20]">
                <span className="text-sm font-medium text-purple">
                  {totalScore?.toFixed(0)}/10 Points
                </span>
              </div>
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
                        {(() => {
                          const categorized = getCategorizedSuggestions(question.question);
                          console.log('Rendering suggestions, categorized:', categorized);
                          
                          if (categorized.length > 0) {
                            return categorized.map((category, categoryIndex) => {
                              // Filter questions within this category based on current input
                              const filteredQuestions = category.questions.filter(q => 
                                question.question.trim() === '' || q.toLowerCase().includes(question.question.toLowerCase())
                              );
                              
                              // Only show category if it has matching questions
                              if (filteredQuestions.length === 0) return null;
                              
                              return (
                                <div key={categoryIndex}>
                                  {/* Category Heading */}
                                  <div className="px-3 py-2 bg-gray-50 text-xs font-semibold text-gray-600 border-b border-gray-200 sticky top-0">
                                    {category.text}
                                  </div>
                                  {/* Category Questions */}
                                  {filteredQuestions.map((suggestion, suggestionIndex) => (
                                    <div
                                      key={`${categoryIndex}-${suggestionIndex}`}
                                      onClick={() => {
                                        selectPredefinedQuestion(index, suggestion);
                                      }}
                                      className="suggestion-item w-full text-left px-3 py-2 hover:bg-gray-100 text-sm border-b border-gray-100 last:border-b-0 cursor-pointer"
                                    >
                                      {suggestion}
                                    </div>
                                  ))}
                                </div>
                              );
                            }).filter(Boolean); // Remove null entries
                          } else {
                            // Fallback to simple suggestions if no categories
                            const simpleSuggestions = getFilteredSuggestions(question.question);
                            console.log('Using fallback suggestions:', simpleSuggestions);
                            return simpleSuggestions.map((suggestion, suggestionIndex) => (
                          <div
                            key={suggestionIndex}
                            onClick={() => {
                              selectPredefinedQuestion(index, suggestion);
                            }}
                            className="suggestion-item w-full text-left px-3 py-2 hover:bg-gray-100 text-sm border-b border-gray-100 last:border-b-0 cursor-pointer"
                          >
                            {suggestion}
                          </div>
                            ));
                          }
                        })()}
                        {getCategorizedSuggestions(question.question).length === 0 && getFilteredSuggestions(question.question).length === 0 && question.question.trim() && (
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
                  {questions.length > 1 && index !== 0 ? (
                    <button
                      onClick={() => removeQuestion(index)}
                      className="p-2 text-gray-400 text-lg font-bold"
                    >
                      ×
                    </button>
                  ):(
                    <div className="w-5"></div>
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
          </div>

          {/* Fixed Action Buttons */}
          <div className="flex gap-3 px-6 mb-4">
            <button
              onClick={onClose}
              className="flex-1 h-12 text-gray-800 bg-white border border-gray-300 rounded-lg font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={!isValidForm() || submitLoading}
              className={`flex-1 h-12 rounded-lg font-medium flex items-center justify-center ${isValidForm() && !submitLoading
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
      </Box>
    </Modal>

  );
};

export default AddScoringModal;