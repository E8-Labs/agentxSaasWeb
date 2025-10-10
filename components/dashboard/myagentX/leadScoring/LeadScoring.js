import React, { useEffect, useState } from 'react'
import { fetchTemplates } from '@/services/leadScoringSerevices/FetchTempletes'
import { CircularProgress, Select, MenuItem, FormControl, Box } from '@mui/material';
import AddScoringModal from '@/components/modals/add-scoring-modal';
import { AuthToken } from '@/components/agency/plan/AuthDetails';
import Apis from '@/components/apis/Apis';
import axios from 'axios';
import AgentSelectSnackMessage, { SnackbarTypes } from '@/components/dashboard/leads/AgentSelectSnackMessage';
import NoActionView from './NoActionView';

function LeadScoring({
    showDrawerSelectedAgent,
    activeTab,
}) {



    const [templates, setTemplates] = useState([])
    const [templatesLoading, setTemplatesLoading] = useState(false)
    const [selectedTemplate, setSelectedTemplate] = useState('')
    const [showAddScoringModal, setShowAddScoringModal] = useState(false)
    const [editingTemplate, setEditingTemplate] = useState(null)
    const [snackbar, setSnackbar] = useState({
        isVisible: false,
        title: '',
        message: '',
        type: SnackbarTypes.Error
    });



    useEffect(() => {
        if (activeTab === "Actions" && showDrawerSelectedAgent?.id) {
            fetchTemplates({
                agentId: showDrawerSelectedAgent?.id,
                setTemplates: setTemplates,
                setTemplatesLoading: setTemplatesLoading,
                setSelectedTemplate: (templateId) => {
                    console.log('Setting selected template in LeadScoring:', templateId);
                    setSelectedTemplate(templateId);
                }
            });

            // Also fetch agent's current scoring template
            fetchAgentScoring();
        }
    }, [activeTab, showDrawerSelectedAgent?.id]);

    // Fetch agent's current scoring configuration
    const fetchAgentScoring = async () => {
        if (!showDrawerSelectedAgent?.id) return;

        try {
            const token = AuthToken();
            const response = await axios.get(
                `${Apis.getAgentScoring}/${showDrawerSelectedAgent.id}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            if (response.data && response.data.status === true) {
                const agentScoring = response.data.data;
                if (agentScoring && agentScoring.id) {
                    setSelectedTemplate(agentScoring.id);
                }
            }
        } catch (error) {
            console.error('Error fetching agent scoring:', error);
        }
    };


    console.log("templates", templates)

    const showSnackbar = (title, message, type = SnackbarTypes.Error) => {
        setSnackbar({
            isVisible: true,
            title,
            message,
            type
        });
    };

    const hideSnackbar = () => {
        setSnackbar(prev => ({ ...prev, isVisible: false }));
    };

    const handleEditTemplate = (template) => {
        setEditingTemplate(template);
        setShowAddScoringModal(true);
    };

    const handleTemplateSelect = async (templateId) => {
        if (!templateId) {
            setSelectedTemplate('');
            return;
        }

        const template = templates.find(t => t.id === templateId);
        if (!template) return;

        setSelectedTemplate(templateId);

        try {
            const token = AuthToken();
            const path = `${Apis.copyAgentScoring}/${showDrawerSelectedAgent?.id}/copy-template`;

            const response = await axios.post(path, {
                agentId: showDrawerSelectedAgent?.id,
                templateId: template.id,
            }, {
                headers: {
                    "Authorization": "Bearer " + token,
                    "Content-Type": "application/json",
                }
            });

            if (response) {
                if (response.data.status === true) {
                    showSnackbar('Success', response.data.message || 'Template applied successfully', SnackbarTypes.Success);
                    // Refresh templates and agent scoring after applying
                    fetchTemplates({
                        agentId: showDrawerSelectedAgent?.id,
                        setTemplates: setTemplates,
                        setTemplatesLoading: setTemplatesLoading,
                    });
                    fetchAgentScoring(); // Refresh agent's current scoring
                } else {
                    showSnackbar('Error', response.data.message || 'Failed to apply template', SnackbarTypes.Error);
                    setSelectedTemplate(''); // Reset selection on error
                }
            }
        } catch (error) {
            console.error('Error applying template:', error);
            showSnackbar('Error', 'Failed to apply template. Please try again.', SnackbarTypes.Error);
        }
    };

    return (

        <div className="mt-2">
            <div className="space-y-4">
                {/* Lead Scoring Header */}
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-gray-900">Lead Scoring</h2>
                    <button
                        onClick={() => setShowAddScoringModal(true)}
                        className="text-purple-600 hover:text-purple-700 text-sm font-medium underline"
                    >
                        + Add Score
                    </button>
                </div>

                {/* Templates Dropdown - Simple Version */}
                {templatesLoading ? (
                    <div className="flex justify-center items-center py-4">
                        <CircularProgress size={20} />
                    </div>
                ) : (
                    templates.length > 0 ? (
                        <div className="space-y-3">
                            <Box className="w-full">
                                <FormControl className="w-full">
                                    <Select
                                        value={selectedTemplate}
                                        onChange={(e) => handleTemplateSelect(e.target.value)}
                                        displayEmpty
                                        className="border-none rounded-lg outline-none"
                                        renderValue={(selected) => {
                                            if (selected === '' || !templates.length) {
                                                return <div className="text-gray-500">Choose a template</div>;
                                            }
                                            const selectedTemplateObj = templates.find(t => t.id === selected);
                                            return <div className="text-gray-900">{selectedTemplateObj?.templateName || 'Choose a template'}</div>;
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
                                                <div className="w-full flex items-center justify-between">
                                                    <div className="font-medium text-gray-900">
                                                        {template.templateName}
                                                    </div>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEditTemplate(template);
                                                        }}
                                                        className="ml-2 text-base text-purple underline"
                                                      
                                                    >
                                                        Edit
                                                    </button>
                                                </div>
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Box>
                        </div>
                    ) : (
                        <NoActionView
                            title="No scoring data available"
                            featureName="Scoring"
                            setShowAddScoringModal = {setShowAddScoringModal}
                        />
                    )
                )}

            </div>

            {/* Add Scoring Modal */}
            <AddScoringModal
                open={showAddScoringModal}
                onClose={() => {
                    setShowAddScoringModal(false);
                    setEditingTemplate(null);
                }}
                agentId={showDrawerSelectedAgent?.id}
                selectedAgent={showDrawerSelectedAgent}
                editingTemplate={editingTemplate}
                onSubmit={(templateData) => {
                    console.log('Template created/updated:', templateData);
                    // Refresh templates after creation/update
                    fetchTemplates({
                        agentId: showDrawerSelectedAgent?.id,
                        setTemplates: setTemplates,
                        setTemplatesLoading: setTemplatesLoading,
                    });
                    // Reset editing state
                    setEditingTemplate(null);
                }}
            />

            {/* Snackbar for notifications */}
            <AgentSelectSnackMessage
                isVisible={snackbar.isVisible}
                title={snackbar.title}
                message={snackbar.message}
                type={snackbar.type}
                hide={hideSnackbar}
            />
        </div >
    )
}

export default LeadScoring