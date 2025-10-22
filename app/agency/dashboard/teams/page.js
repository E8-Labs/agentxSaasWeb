'use client'
import AdminTeam from '@/components/admin/users/AdminTeams'
import Teams from '@/components/dashboard/teams/Teams'
import React, { useEffect, useState } from 'react'

function Page() {

  const [agencyData, setAgencyData] = useState(null);

  useEffect(() => {
    const Data = localStorage.getItem("User");
    if (Data) {
      const LD = JSON.parse(Data);
      setAgencyData(LD.user);
    }
  }, [])

  return (
    <div>
      <Teams
        agencyData={agencyData}
        from={"agency"}
      />
    </div>
  )
}

export default Page