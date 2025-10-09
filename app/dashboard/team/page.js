"use client";

import Teams from '@/components/dashboard/teams/Teams'
import React, { useEffect, useState } from 'react'

function Page() {

  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const userLocalData = localStorage.getItem("User");
    if (userLocalData) {
      const D = JSON.parse(userLocalData);
      if (D?.user?.userRole === "AgencySubAccount") {
        setUserRole("SubAccount");
      } else {
        setUserRole("user");
      }
    }
  }, []);

  return (
    <div>
      <Teams from={userRole} />
    </div>
  )
}

export default Page