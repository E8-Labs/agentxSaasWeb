"use client";
import React, { Suspense, useEffect, useState } from "react";

import MyAccount from "@/components/myAccount/MyAccount";
import SubAccountMyAccount from "@/components/dashboard/subaccount/myAccount/SubAccountMyAccount";

function Page() {

    return (
        <Suspense>
            <SubAccountMyAccount />
        </Suspense>
    );
}

export default Page;