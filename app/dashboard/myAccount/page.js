"use client";
import React, { Suspense, useEffect, useState } from "react";

import MyAccount from "@/components/myAccount/MyAccount";
import SubAccountMyAccount from "@/components/dashboard/subaccount/myAccount/SubAccountMyAccount";
function Page() {

    const [role, setRole] = useState("")

    useEffect(() => {
        const checkUserType = () => {
            const data = localStorage.getItem("User")
            if (data) {
                let u = JSON.parse(data)

                console.log('u.user.userRole', u.user.userRole)
                setRole(u.user.userRole)
            }
        }

        checkUserType()
    }, [])

    return (
        <Suspense>
            {
                role && role === "AgencySubAccount" ? (
                    <SubAccountMyAccount />
                ) : (
                    <MyAccount />
                )
            }

        </Suspense>
    );
}

export default Page;