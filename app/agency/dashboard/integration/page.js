"use client"

import AgencyIntegrations from '@/components/agency/dashboard/AgencyIntegrations';
import Integrations from '@/components/agency/integrations/Integrations';
import ConnectStripe from '@/components/agency/stripe/ConnectStripe';
import NotficationsDrawer from '@/components/notofications/NotficationsDrawer';
import React, { useState } from 'react';

function Page() {

    const [currentTab, setCurrentTab] = useState(1);

    //handle switch tab
    const handleTabSelection = (tab) => {
        setCurrentTab(tab);
    }

    return (
        <div>
            <AgencyIntegrations />
        </div>
    )
}

export default Page