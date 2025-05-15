"use client";
import React, { Suspense, useEffect, useState } from "react";

import MyAccount from "@/components/myAccount/MyAccount";
import SubAccountMyAccount from "@/components/dashboard/subaccount/myAccount/SubAccountMyAccount";
import { CircularProgress } from "@mui/material";
function Page() {

    const [role, setRole] = useState("");
    const [roleLoader, setRoleLoader] = useState(true);

    useEffect(() => {
        const checkUserType = () => {
            const data = localStorage.getItem("User")
            if (data) {
                let u = JSON.parse(data)

                console.log('u.user.userRole', u.user.userRole)
                setRole(u.user.userRole);
                setRoleLoader(false);
            }
        }

        checkUserType()
    }, [])

    return (
        <Suspense>
            {
                roleLoader ? (
                    <div className="h-screen w-full flex flex-row items-center justify-center">
                        <CircularProgress
                            size={45}
                        />
                    </div>
                ) : (
                    <div>
                        {
                            role && role === "AgencySubAccount" ? (
                                <SubAccountMyAccount />
                            ) : (
                                <MyAccount />
                            )
                        }
                    </div>
                )
            }
        </Suspense>
    );
}

export default Page;