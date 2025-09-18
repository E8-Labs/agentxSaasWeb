// Utility functions for plan comparison and feature analysis

/**
 * Get features that would be lost when downgrading from current plan to target plan
 * @param {Object} currentPlan - The current plan object
 * @param {Object} targetPlan - The target plan object (usually free plan for cancellation)
 * @returns {Array} Array of feature names that will be lost
 */
export const getFeaturesToLose = (currentPlan, targetPlan) => {
    if (!currentPlan || !targetPlan) {
        console.log('❌ [DOWNGRADE] Missing current or target plan');
        return [];
    }

    console.log('🔍 [DOWNGRADE] Current plan:', currentPlan);
    console.log('🔍 [DOWNGRADE] Target plan:', targetPlan);
    console.log('🔍 [DOWNGRADE] Current plan capabilities type:', typeof currentPlan.capabilities);
    console.log('🔍 [DOWNGRADE] Target plan capabilities type:', typeof targetPlan.capabilities);
    console.log('🔍 [DOWNGRADE] Current plan capabilities:', currentPlan.capabilities);
    console.log('🔍 [DOWNGRADE] Target plan capabilities:', targetPlan.capabilities);
    console.log('🔍 [DOWNGRADE] Current plan features:', currentPlan.features);
    console.log('🔍 [DOWNGRADE] Target plan features:', targetPlan.features);

    const featuresToLose = [];

    // Use existing capabilities or fallback to empty object, don't overwrite with features
    const currentCapabilities = currentPlan.features || {};
    const targetCapabilities = targetPlan.capabilities || {};

    // Check if plans have capabilities
    if (currentCapabilities && targetCapabilities) {
        console.log('✅ [DOWNGRADE] Using capabilities for comparison');

        // Compare AI Agents
        const currentAgents = currentCapabilities?.maxAgents || 0;
        const targetAgents = targetCapabilities?.maxAgents || 0;

        if (currentAgents > targetAgents) {
            if (currentAgents === 1000) {
                featuresToLose.push("Unlimited AI Agents");
            } else {
                featuresToLose.push(`${currentAgents} AI Agents`);
            }
        }

        console.log('🔍 [DOWNGRADE] Current agents:', currentAgents);
        console.log('🔍 [DOWNGRADE] Target agents:', targetAgents);

        // Compare Contacts
        const currentContacts = currentCapabilities?.maxLeads || 0;
        const targetContacts = targetCapabilities?.maxLeads || 0;

        if (currentContacts > targetContacts) {
            if (currentContacts === 10000000) {
                featuresToLose.push("Unlimited Contacts");
            } else {
                featuresToLose.push(`${currentContacts.toLocaleString()} Contacts`);
            }
        }

        // Compare Team Seats
        const currentTeamSeats = currentCapabilities?.maxTeamMembers || 0;
        const targetTeamSeats = targetCapabilities?.maxTeamMembers || 0;

        if (currentTeamSeats > targetTeamSeats) {
            if (currentTeamSeats === 1000) {
                featuresToLose.push("Unlimited Team Seats");
            } else {
                featuresToLose.push(`${currentTeamSeats} Team Seats`);
            }
        }

        // Compare AI Credits
        const currentCredits = currentPlan.mints || 0;
        const targetCredits = targetPlan.mints || 0;

        if (currentCredits > targetCredits) {
            featuresToLose.push(`${currentCredits} AI Credits`);
        }

        // Compare specific features that are boolean capabilities
        const capabilityFeatures = [
            { key: 'allowPrioritySupport', name: 'Priority Support' },
            { key: 'allowZoomSupport', name: 'Zoom Support Webinar' },
            { key: 'allowGHLSubaccounts', name: 'GHL Subaccount & Snapshots' },
            { key: 'allowLeadSource', name: 'Lead Source' }, 
            { key: 'allowKnowledgeBases', name: 'RAG Knowledge Base' },
            { key: 'allowSuccessManager', name: 'Success Manager' }
        ];

        capabilityFeatures.forEach(feature => {
            const currentHasFeature = currentCapabilities?.[feature.key] || false;
            const targetHasFeature = targetCapabilities?.[feature.key] || false;

            if (currentHasFeature && !targetHasFeature) {
                featuresToLose.push(feature.name);
            }
        });
    } else {
        console.log('⚠️ [DOWNGRADE] No capabilities found, using fallback logic');

        // Fallback: Use plan names and basic comparisons
        const currentPlanName = currentPlan.name || '';
        const targetPlanName = targetPlan.name || '';

        // Scale to Growth
        if (currentPlanName === 'Scale' && targetPlanName === 'Growth') {
            featuresToLose.push("Unlimited AI Agents", "Unlimited Contacts", "Unlimited Team Seats", "1000 AI Credits", "Success Manager");
        }
        // Scale to Starter
        else if (currentPlanName === 'Scale' && targetPlanName === 'Starter') {
            featuresToLose.push("Unlimited AI Agents", "Unlimited Contacts", "Unlimited Team Seats", "1000 AI Credits", "Success Manager", "Ultra Priority Calling");
        }
        // Growth to Starter
        else if (currentPlanName === 'Growth' && targetPlanName === 'Starter') {
            featuresToLose.push("10 AI Agents", "10,000 Contacts", "4 Team Seats", "450 AI Credits", "Ultra Priority Calling");
        }
        // Any paid plan to Free (cancellation)
        else if (currentPlanName !== 'Free' && targetPlanName === 'Free') {
            // Add all premium features for cancellation
            featuresToLose.push(
                "AI Agents", 
                "Contacts", 
                "Team Seats", 
                "AI Credits", 
                "Priority Support",
                "Zoom Support Webinar",
                "GHL Subaccount & Snapshots",
                "Lead Source",
                "RAG Knowledge Base",
                "Success Manager"
            );
        }
    }

    // Check for Success Manager (Scale only)
    if (currentPlan.name === 'Scale' && targetPlan.name !== 'Scale') {
        if (!featuresToLose.includes("Success Manager")) {
            featuresToLose.push("Success Manager");
        }
    }

    // Check for Ultra Priority Calling (Growth and Scale only)
    if ((currentPlan.name === 'Scale' || currentPlan.name === 'Growth') &&
        targetPlan.name === 'Starter') {
        if (!featuresToLose.includes("Ultra Priority Calling")) {
            featuresToLose.push("Ultra Priority Calling");
        }
    }

    console.log('📋 [DOWNGRADE] Features to lose:', featuresToLose);
    return featuresToLose;
};

/**
 * Get a free plan object for comparison
 * @returns {Object} Free plan object
 */
export const getFreePlan = () => {
    return {
        name: 'Free',
        id: 'free',
        price: 0,
        mints: 0,
        capabilities: {
            maxAgents: 0,
            maxLeads: 0,
            maxTeamMembers: 0,
            allowPrioritySupport: false,
            allowZoomSupport: false,
            allowGHLSubaccounts: false,
            allowLeadSource: false,
            allowKnowledgeBases: false,
            allowSuccessManager: false
        }
    };
};
