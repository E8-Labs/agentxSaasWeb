"use client";
import React, { Suspense, useEffect, useState } from "react";

import MyAccount from "@/components/myAccount/MyAccount";
import SubAccountMyAccount from "@/components/dashboard/subaccount/myAccount/SubAccountMyAccount";
import AgencyMyAccount from "@/components/agency/myAccount/AgencyMyAccount";

function Page() {

    return (
        <Suspense>
            <AgencyMyAccount />
        </Suspense>
    );
}

export default Page;