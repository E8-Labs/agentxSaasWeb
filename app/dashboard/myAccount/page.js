"use client";
import React, { Suspense, useEffect, useState } from "react";

import MyAccount from "@/components/myAccount/MyAccount";

function Page() {

    return (
        <Suspense>
            <MyAccount />
        </Suspense>
    );
}

export default Page;