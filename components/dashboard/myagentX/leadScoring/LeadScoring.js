import React, { useEffect, useState } from 'react'
import { fetchTemplates } from '@/services/leadScoringSerevices/FetchTempletes'
import { CircularProgress, Select, MenuItem, FormControl, Box } from '@mui/material';
import AddScoringModal from '@/components/modals/add-scoring-modal';
import { AuthToken } from '@/components/agency/plan/AuthDetails';

function LeadScoring({
    showDrawerSelectedAgent,
    activeTab,
    }) {



    const [templates, setTemplates] = useState([])
    const [templatesLoading, setTemplatesLoading] = useState(false)
    const [selectedTemplate, setSelectedTemplate] = useState('')
    const [showAddScoringModal, setShowAddScoringModal] = useState(false)
    


    useEffect(() => {
        if (activeTab === "Actions") {
            fetchTemplates({
                agentId: showDrawerSelectedAgent?.id,
                setTemplates: setTemplates,
                setTemplatesLoading: setTemplatesLoading,
            });
        }
    }, [activeTab]);
    

    console.log("templates", templates)


    const templeteSeleclt = async (template) => {
        try {
            const token = AuthToken();
            const path = `${Apis.copyAgentScoring}/${showDrawerSelectedAgent?.id}`


            const response = await axios.post(path, {
                agentId: showDrawerSelectedAgent?.id,
                templateId: template.id,
            },
                {
                    headers: {
                        "Authorization": "Bearer " + token,
                        "Content-Type": "application/json",
                    }
                });
            if (response) {
                if (response.data.status === true) {
                    setShowSuccessSnack(response.data.message);
                    setShowSuccessSnack(true);
                } else {
                    setShowErrorSnack(response.data.message);
                    setShowSuccessSnack(false);
                }
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (

        <div className="mt-2">
            <div className="space-y-6">
                {/* Lead Scoring Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                            {showDrawerSelectedAgent?.profile_image ? (
                                <img
                                    src={showDrawerSelectedAgent.profile_image}
                                    alt="Agent"
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center text-white font-medium">
                                    {showDrawerSelectedAgent?.name?.[0]?.toUpperCase() || "A"}
                                </div>
                            )}
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">Lead Scoring</h2>
                    </div>
                    <button
                        onClick={() => setShowAddScoringModal(true)}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-medium"
                    >
                        + Add Score
                    </button>
                </div>

                {
                    templatesLoading ? (
                        <div className="flex justify-center items-center py-8">
                            <CircularProgress />
                        </div>
                    ) : (
                        templates.length > 0 ? (
                            <div className="space-y-4">
                                {/* Templates Dropdown */}
                                <div className="bg-white border border-gray-200 rounded-lg p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-gray-900">Scoring Templates</h3>
                                        <button
                                            onClick={() => setShowAddScoringModal(true)}
                                            className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded text-sm font-medium"
                                        >
                                            + New Template
                                        </button>
                                    </div>

                                    <div className="space-y-3">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Select Template
                                            </label>
                                            <Box className="w-full">
                                                <FormControl className="w-full">
                                                    <Select
                                                        value={selectedTemplate}
                                                        onChange={(e) => setSelectedTemplate(e.target.value)}
                                                        displayEmpty
                                                        className="border-none rounded-lg outline-none"
                                                        renderValue={(selected) => {
                                                            if (selected === '') {
                                                                return <div className="text-gray-500">Choose a template</div>;
                                                            }
                                                            const template = templates.find(t => t.id === selected);
                                                            return template ? template.templateName : selected;
                                                        }}
                                                        sx={{
                                                            backgroundColor: "#FFFFFF",
                                                            "& .MuiOutlinedInput-notchedOutline": {
                                                                border: "1px solid #E5E7EB",
                                                            },
                                                            "&:hover .MuiOutlinedInput-notchedOutline": {
                                                                border: "1px solid #D1D5DB",
                                                            },
                                                            "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                                                                border: "1px solid #7902DF",
                                                            },
                                                        }}
                                                        MenuProps={{
                                                            PaperProps: {
                                                                style: {
                                                                    maxHeight: "30vh",
                                                                    overflow: "auto",
                                                                    scrollbarWidth: "none",
                                                                    borderRadius: "8px",
                                                                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)"
                                                                },
                                                            },
                                                        }}
                                                    >
                                                        <MenuItem value="">
                                                            <div className="text-gray-500">Choose a template</div>
                                                        </MenuItem>
                                                        {templates.map((template) => (
                                                            <MenuItem
                                                                key={template.id}
                                                                value={template.id}
                                                                sx={{
                                                                    '&:hover': {
                                                                        backgroundColor: '#F3F4F6',
                                                                    },
                                                                }}
                                                            >
                                                                <div className="w-full">
                                                                    <div className="font-medium text-gray-900">
                                                                        {template.templateName}
                                                                    </div>
                                                                </div>
                                                            </MenuItem>
                                                        ))}
                                                    </Select>
                                                </FormControl>
                                            </Box>
                                        </div>

                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="border border-gray-200 rounded-lg">
                                <div className="p-6 text-center">
                                    <div className="text-gray-500 mb-4">
                                        No scoring configuration found for this agent
                                    </div>
                                    <button
                                        onClick={() => setShowAddScoringModal(true)}
                                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded font-medium"
                                    >
                                        Create Scoring Configuration
                                    </button>
                                </div>
                            </div>
                        )
                    )
                }

            </div>

            {/* Add Scoring Modal */}
            <AddScoringModal
                open={showAddScoringModal}
                onClose={() => setShowAddScoringModal(false)}
                agentId={showDrawerSelectedAgent?.id}
                selectedAgent={showDrawerSelectedAgent}
                onSubmit={(templateData) => {
                    console.log('Template created:', templateData);
                    // Refresh templates after creation
                    fetchTemplates({
                        agentId: showDrawerSelectedAgent?.id,
                        setTemplates: setTemplates,
                        setTemplatesLoading: setTemplatesLoading,
                    });
                }}
            />
        </div >
    )
}

export default LeadScoring